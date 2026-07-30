import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'default', index: true },
    branchId: { type: String, default: 'main', index: true },
    costPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    costPriceCents: {
      type: Number,
      min: 0,
      default: 0,
    },
    priceCents: {
      type: Number,
      min: 0,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'others',
      required: true
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    barcode: {
      type: String,
      required: true,
      maxlength: 20,
    },
    sku: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
  },
  {
    timestamps: true,
  }
);

productSchema.index({ organizationId: 1, branchId: 1, barcode: 1 }, { unique: true });
productSchema.index({ organizationId: 1, branchId: 1, sku: 1 }, { unique: true, sparse: true });

const Product = mongoose.model('Product', productSchema);
export default Product;

