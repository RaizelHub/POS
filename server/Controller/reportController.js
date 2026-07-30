import mongoose from 'mongoose';
import Transaction from '../Models/transaction.js';
import Shift from '../Models/shift.js';
import CashDrawerLog from '../Models/cashDrawerLog.js';
import Return from '../Models/return.js';
import CreditPayment from '../Models/creditPayment.js';

export const getShiftReconciliation = async (req, res) => {
  const shift = await Shift.findOne({
    _id: req.params.shiftId,
    organizationId: req.auth.organizationId,
    branchId: req.auth.branchId,
  }).lean();
  if (!shift) return res.status(404).json({ message: 'Shift not found.' });

  const shiftObjectId = new mongoose.Types.ObjectId(shift._id);
  const [tenders, cashLogs, returns, creditPayments] = await Promise.all([
    Transaction.aggregate([
      { $match: { shiftId: shiftObjectId, status: { $ne: 'voided' } } },
      {
        $group: {
          _id: '$paymentMethod',
          transactionCount: { $sum: 1 },
          grossCents: { $sum: '$totalAmountCents' },
          refundsCents: { $sum: '$refundTotalCents' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    CashDrawerLog.find({ shiftId: shift._id }).sort({ createdAt: 1 }).lean(),
    Return.find({ shiftId: shift._id }).lean(),
    CreditPayment.find({ shiftId: shift._id }).lean(),
  ]);

  const cashAdjustments = cashLogs.reduce(
    (total, log) => total + (log.type === 'Cash-In' ? log.amount : -log.amount),
    0
  );
  const grossCents = tenders.reduce((total, tender) => total + (tender.grossCents || 0), 0);
  const refundsCents = returns.reduce((total, item) => total + (item.totalRefundCents || 0), 0);

  return res.json({
    reportType: shift.status === 'Closed' ? 'Z' : 'X',
    generatedAt: new Date(),
    shift,
    tenders,
    cashLogs,
    totals: {
      grossCents,
      refundsCents,
      netCents: grossCents - refundsCents,
      cashAdjustments,
      expectedCash: shift.expectedCash,
      endingCash: shift.endingCash,
      discrepancy: shift.discrepancy,
      creditPaymentsCents: creditPayments.reduce((total, payment) => total + payment.amountCents, 0),
    },
    creditPayments,
  });
};
