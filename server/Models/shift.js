import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'default', index: true },
    branchId: { type: String, default: 'main', index: true },
    registerId: { type: String, default: 'register-01', index: true },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cashierName: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    startingCash: { type: Number, required: true },
    endingCash: { type: Number },
    expectedCash: { type: Number },
    transactionsCount: { type: Number, default: 0 },
    discrepancy: { type: Number, default: 0 },
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open', index: true }
  },
  { timestamps: true }
);

const Shift = mongoose.model('Shift', shiftSchema);
export default Shift;
