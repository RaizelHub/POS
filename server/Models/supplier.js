import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'default', index: true },
    branchId: { type: String, default: 'main', index: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      }
    ]
  },
  {
    timestamps: true,
  }
);

supplierSchema.index({ organizationId: 1, branchId: 1, name: 1 }, { unique: true });

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
