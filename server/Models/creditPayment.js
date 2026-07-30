import mongoose from 'mongoose';

const creditPaymentSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    amountCents: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'GCash/PayMaya'], required: true },
    reference: { type: String, trim: true, maxlength: 100 },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);

creditPaymentSchema.index({ organizationId: 1, branchId: 1, createdAt: -1 });

export default mongoose.model('CreditPayment', creditPaymentSchema);
