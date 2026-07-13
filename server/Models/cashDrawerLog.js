import mongoose from 'mongoose';

const cashDrawerLogSchema = new mongoose.Schema(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Cash-In', 'Cash-Out'], required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const CashDrawerLog = mongoose.model('CashDrawerLog', cashDrawerLogSchema);
export default CashDrawerLog;
