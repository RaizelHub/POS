import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', index: true },
    returnNumber: { type: String, required: true, unique: true, index: true },
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      unitPriceCents: { type: Number, required: true, min: 0 },
      refundAmountCents: { type: Number, required: true, min: 0 },
    }],
    totalRefundCents: { type: Number, required: true, min: 0 },
    creditAdjustmentCents: { type: Number, default: 0, min: 0 },
    cashRefundCents: { type: Number, default: 0, min: 0 },
    refundMethod: {
      type: String,
      enum: ['Cash', 'Card', 'GCash/PayMaya', 'Store Credit', 'Original Tender'],
      default: 'Original Tender',
    },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Return', returnSchema);
