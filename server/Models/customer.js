import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'default', index: true },
    branchId: { type: String, default: 'main', index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    loyaltyPoints: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    outstandingBalanceCents: { type: Number, default: 0, min: 0 },
    creditLimitCents: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
