import mongoose from 'mongoose';
import Transaction from '../Models/transaction.js';
import Customer from '../Models/customer.js';
import Shift from '../Models/shift.js';
import CreditPayment from '../Models/creditPayment.js';
import AuditLog from '../Models/auditLog.js';
import { buildOrgBranchFilter } from '../utills/orgBranchFilter.js';

export const confirmPayLaterPayment = async (req, res) => {
  const { transactionId, itemId, shiftId, paymentMethod = 'Cash', reference } = req.body;
  const amountCentsInput = req.body.amountCents;
  if (!transactionId && !itemId) {
    return res.status(400).json({ message: 'A transaction ID is required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(shiftId)) {
    return res.status(400).json({ message: 'An active shift is required to receive payment.' });
  }
  if (!['Cash', 'Card', 'GCash/PayMaya'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Unsupported payment method.' });
  }
  if (paymentMethod !== 'Cash' && !String(reference || '').trim()) {
    return res.status(400).json({ message: 'A reference is required for digital payments.' });
  }

  const session = await mongoose.startSession();
  let payment;
  let updatedTransaction;
  try {
    await session.withTransaction(async () => {
      const shift = await Shift.findOne({
        _id: shiftId,
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        cashierId: req.auth.userId,
        status: 'Open',
      }).session(session);
      if (!shift) {
        const error = new Error('Your active shift was not found.');
        error.status = 409;
        throw error;
      }

      const query = {
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        paymentStatus: 'Pay Later',
        balanceDueCents: { $gt: 0 },
      };
      if (transactionId && mongoose.Types.ObjectId.isValid(transactionId)) query._id = transactionId;
      else if (mongoose.Types.ObjectId.isValid(itemId)) query['products._id'] = itemId;
      else {
        const error = new Error('Invalid transaction reference.');
        error.status = 400;
        throw error;
      }

      const transaction = await Transaction.findOne(query).session(session);
      if (!transaction || !transaction.customerId) {
        const error = new Error('Outstanding credit transaction was not found.');
        error.status = 404;
        throw error;
      }

      const amountCents = amountCentsInput === undefined
        ? transaction.balanceDueCents
        : Number(amountCentsInput);
      if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > transaction.balanceDueCents) {
        const error = new Error('Payment must be a positive cent amount no greater than the balance.');
        error.status = 400;
        throw error;
      }

      transaction.amountPaidCents = (transaction.amountPaidCents || 0) + amountCents;
      transaction.balanceDueCents -= amountCents;
      if (transaction.balanceDueCents === 0) {
        transaction.paymentStatus = 'Paid';
        transaction.products.forEach((item) => { item.paymentStatus = 'Paid'; });
      }
      await transaction.save({ session });
      updatedTransaction = transaction;

      await Customer.updateOne(
        { _id: transaction.customerId, organizationId: req.auth.organizationId },
        { $inc: { outstandingBalanceCents: -amountCents } },
        { session }
      );
      [payment] = await CreditPayment.create([{
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        transactionId: transaction._id,
        customerId: transaction.customerId,
        shiftId,
        amountCents,
        paymentMethod,
        reference: String(reference || '').trim() || undefined,
        receivedBy: req.auth.userId,
      }], { session });
      await AuditLog.create([{
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        actorId: req.auth.userId,
        action: 'credit.payment_received',
        entityType: 'transaction',
        entityId: transaction._id.toString(),
        summary: `Received credit payment of ${(amountCents / 100).toFixed(2)}`,
        metadata: { paymentId: payment._id, amountCents, paymentMethod },
        ipAddress: req.ip,
      }], { session });
    });
    res.status(200).json({
      message: 'Payment recorded successfully.',
      payment,
      balanceDueCents: updatedTransaction.balanceDueCents,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Could not record payment.' });
  } finally {
    await session.endSession();
  }
};

export const getAllTransactionsLedger = async (req, res) => {
  try {
    const { cashierId, startDate, endDate, status, search } = req.query;
    const query = {
      ...buildOrgBranchFilter(req.auth),
    };
    if (cashierId) query.userId = cashierId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.transactionDate.$lte = end;
      }
    }
    if (search) {
      query.$or = [
        { transactionId: { $regex: String(search).trim(), $options: 'i' } },
        { tenderReference: { $regex: String(search).trim(), $options: 'i' } },
      ];
    }
    const transactions = await Transaction.find(query)
      .populate('userId', 'firstname lastname email')
      .populate('customerId', 'name phone email')
      .sort({ transactionDate: -1 })
      .limit(1000);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions ledger.', error: error.message });
  }
};
