import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'default', index: true },
    branchId: { type: String, default: 'main', index: true },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ organizationId: 1, branchId: 1, code: 1 }, { unique: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
