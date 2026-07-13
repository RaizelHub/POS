import Shift from '../Models/shift.js';
import Transaction from '../Models/transaction.js';
import CashDrawerLog from '../Models/cashDrawerLog.js';

// Open shift
export const openShift = async (req, res) => {
  try {
    const { cashierId, cashierName, startingCash } = req.body;

    if (!cashierId || !cashierName || startingCash === undefined) {
      return res.status(400).json({ message: 'Cashier ID, name, and starting float cash are required.' });
    }

    // Check if there is already an open shift for this cashier
    const existingOpenShift = await Shift.findOne({ cashierId, status: 'Open' });
    if (existingOpenShift) {
      return res.status(400).json({ message: 'Cashier already has an active open shift.', shift: existingOpenShift });
    }

    const newShift = new Shift({
      cashierId,
      cashierName,
      startingCash,
      status: 'Open',
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

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found.' });
    }

    if (shift.status === 'Closed') {
      return res.status(400).json({ message: 'Shift is already closed.', shift });
    }

    // Retrieve all transactions linked to this shift
    const transactions = await Transaction.find({ shiftId });

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

    const expectedCash = shift.startingCash + cashSalesTotal + cashAdjustments;

    shift.endTime = new Date();
    shift.endingCash = endingCash;
    shift.expectedCash = expectedCash;
    shift.transactionsCount = transactions.length;
    shift.status = 'Closed';

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
    const shift = await Shift.findOne({ cashierId, status: 'Open' });
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Error checking active shift', error: error.message });
  }
};

// Get all shifts (admin logs)
export const getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().sort({ createdAt: -1 });
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shifts', error: error.message });
  }
};

// Add cash log
export const addCashLog = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { cashierId, type, amount, reason } = req.body;

    if (!cashierId || !type || !amount || !reason) {
      return res.status(400).json({ message: 'Cashier ID, type (Cash-In/Cash-Out), amount, and reason are required.' });
    }

    const newLog = new CashDrawerLog({
      shiftId,
      cashierId,
      type,
      amount,
      reason,
    });

    await newLog.save();
    res.status(201).json({ message: 'Cash adjustment logged successfully!', log: newLog });
  } catch (error) {
    res.status(500).json({ message: 'Error logging cash adjustment', error: error.message });
  }
};

// Get cash logs
export const getCashLogs = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const logs = await CashDrawerLog.find({ shiftId }).sort({ createdAt: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cash adjustments', error: error.message });
  }
};
