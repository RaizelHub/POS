import Shift from '../Models/shift.js';
import Transaction from '../Models/transaction.js';
import CashDrawerLog from '../Models/cashDrawerLog.js';
import AuditLog from '../Models/auditLog.js';
import CreditPayment from '../Models/creditPayment.js';
import Return from '../Models/return.js';
import { buildOrgBranchFilter } from '../utills/orgBranchFilter.js';

// Open shift
export const openShift = async (req, res) => {
  try {
    const { startingCash, registerId = req.authUser?.station || 'register-01' } = req.body;
    const cashierId = req.auth.userId;
    const cashierName = `${req.authUser?.firstname || 'Cashier'} ${req.authUser?.lastname || ''}`.trim();

    if (!cashierId || startingCash === undefined) {
      return res.status(400).json({ message: 'Cashier ID and starting float cash are required.' });
    }

    // Check if there is already an open shift for this cashier
    const existingOpenShift = await Shift.findOne({
      ...buildOrgBranchFilter(req.auth),
      cashierId,
      status: 'Open',
    });
    if (existingOpenShift) {
      return res.status(400).json({ message: 'Cashier already has an active open shift.', shift: existingOpenShift });
    }

    const newShift = new Shift({
      cashierId,
      cashierName,
      startingCash,
      status: 'Open',
      organizationId: req.auth?.organizationId || 'default',
      branchId: req.auth?.branchId || 'main',
      registerId,
    });

    await newShift.save();
    res.status(201).json({ message: 'Shift started successfully!', shift: newShift });
  } catch (error) {
    res.status(500).json({ message: 'Error opening shift', error: error.message });
  }
};

// Close shift
export const closeShift = async (req, res) => {
  try {
    const { shiftId, endingCash } = req.body;

    if (!shiftId || endingCash === undefined) {
      return res.status(400).json({ message: 'Shift ID and ending cash are required.' });
    }

    const shift = await Shift.findOne({
      _id: shiftId,
      ...buildOrgBranchFilter(req.auth),
    });
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found.' });
    }

    if (shift.status === 'Closed') {
      return res.status(400).json({ message: 'Shift is already closed.', shift });
    }
    if (
      shift.cashierId.toString() !== req.auth.userId &&
      !req.auth.isAdmin &&
      !['owner', 'manager', 'supervisor'].includes(req.auth.role)
    ) {
      return res.status(403).json({ message: 'You cannot close another cashier’s shift.' });
    }

    // Retrieve all transactions and drawer-affecting records linked to this shift.
    const transactions = await Transaction.find({ shiftId });
    const [creditPayments, returns] = await Promise.all([
      CreditPayment.find({ shiftId, paymentMethod: 'Cash' }),
      Return.find({ shiftId }),
    ]);

    // Calculate expected cash in drawer
    let cashSalesTotal = 0;
    transactions.forEach(t => {
      if (t.paymentMethod === 'Cash') {
        const discountAdjusted = t.discountAmount || 0;
        cashSalesTotal += (t.products.some(p => p.paymentStatus === 'Paid') ? (t.products.reduce((s, p) => s + p.totalPrice, 0) - discountAdjusted) : 0);
      } else if (t.paymentMethod === 'Split') {
        if (t.splitDetails && t.splitDetails.cashAmount) {
          cashSalesTotal += t.splitDetails.cashAmount;
        }
      }
    });

    // Retrieve cash adjustments (Cash-In and Cash-Out drops)
    const cashLogs = await CashDrawerLog.find({ shiftId });
    let cashAdjustments = 0;
    cashLogs.forEach(log => {
      if (log.type === 'Cash-In') {
        cashAdjustments += log.amount;
      } else if (log.type === 'Cash-Out') {
        cashAdjustments -= log.amount;
      }
    });

    const creditCashReceived = creditPayments.reduce((sum, payment) => sum + payment.amountCents / 100, 0);
    const cashRefunds = returns.reduce((sum, item) => {
      return sum + (item.cashRefundCents || 0) / 100;
    }, 0);
    const expectedCash = shift.startingCash + cashSalesTotal + creditCashReceived - cashRefunds + cashAdjustments;

    shift.endTime = new Date();
    shift.endingCash = endingCash;
    shift.expectedCash = expectedCash;
    shift.transactionsCount = transactions.length;
    shift.status = 'Closed';
    shift.discrepancy = endingCash - expectedCash;

    await shift.save();

    res.json({
      message: 'Shift closed successfully!',
      shift,
      discrepancy: endingCash - expectedCash,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error closing shift', error: error.message });
  }
};

// Check active shift
export const getActiveShift = async (req, res) => {
  try {
    const { cashierId } = req.params;
    if (
      cashierId !== req.auth.userId &&
      !req.auth.isAdmin &&
      !['owner', 'manager', 'supervisor'].includes(req.auth.role)
    ) {
      return res.status(403).json({ message: 'You cannot inspect another cashier’s shift.' });
    }
    const shift = await Shift.findOne({
      ...buildOrgBranchFilter(req.auth),
      cashierId,
      status: 'Open',
    });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Error checking active shift', error: error.message });
  }
};

// Get all shifts (admin logs)
export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({
      ...buildOrgBranchFilter(req.auth),
    }).sort({ createdAt: -1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shifts', error: error.message });
  }
};

// Add cash log
export const addCashLog = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { type, amount, reason } = req.body;
    const cashierId = req.auth.userId;
    const numericAmount = Number(amount);
    const normalizedReason = String(reason || '').trim();

    if (!['Cash-In', 'Cash-Out'].includes(type) || !Number.isFinite(numericAmount) || numericAmount <= 0 || normalizedReason.length < 3) {
      return res.status(400).json({ message: 'Cashier ID, type (Cash-In/Cash-Out), amount, and reason are required.' });
    }

    const shift = await Shift.findOne({
      _id: shiftId,
      organizationId: req.auth.organizationId,
      branchId: req.auth.branchId,
      status: 'Open',
    });
    if (!shift) return res.status(404).json({ message: 'Open shift not found.' });
    const canManage = req.auth.isAdmin || ['owner', 'manager', 'supervisor'].includes(req.auth.role);
    if (shift.cashierId.toString() !== cashierId && !canManage) {
      return res.status(403).json({ message: 'You cannot adjust another cashier’s drawer.' });
    }

    const newLog = await CashDrawerLog.create({
      shiftId,
      cashierId,
      type,
      amount: numericAmount,
      reason: normalizedReason,
    });

    await AuditLog.create({
      organizationId: req.auth.organizationId,
      branchId: req.auth.branchId,
      actorId: cashierId,
      action: type === 'Cash-In' ? 'cash_drawer.cash_in' : 'cash_drawer.cash_out',
      entityType: 'Shift',
      entityId: shiftId,
      summary: `${type} ${numericAmount.toFixed(2)}: ${normalizedReason}`,
      metadata: { amount: numericAmount, reason: normalizedReason },
      ipAddress: req.ip,
    });
    res.status(201).json({ message: 'Cash adjustment logged successfully!', log: newLog });
  } catch (error) {
    res.status(500).json({ message: 'Error logging cash adjustment', error: error.message });
  }
};

// Get cash logs
export const getCashLogs = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const shift = await Shift.findOne({
      _id: shiftId,
      organizationId: req.auth.organizationId,
      branchId: req.auth.branchId,
    });
    if (!shift) return res.status(404).json({ message: 'Shift not found.' });
    if (
      shift.cashierId.toString() !== req.auth.userId &&
      !req.auth.isAdmin &&
      !['owner', 'manager', 'supervisor'].includes(req.auth.role)
    ) {
      return res.status(403).json({ message: 'You cannot inspect another cashier’s cash log.' });
    }
    const logs = await CashDrawerLog.find({ shiftId }).sort({ createdAt: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cash adjustments', error: error.message });
  }
};
