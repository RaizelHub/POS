import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    product: { type: mongoose.Schema.Types.Mixed },
    name: { type: String },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1, min: 1 },
    totalPrice: { type: Number, default: 0 },
  },
  { _id: false, strict: false }
);

const draftOrderSchema = new mongoose.Schema(
  {
    branchId: { type: String, default: 'default', index: true },
    draftId: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'held', 'completed', 'abandoned'],
      default: 'active',
      index: true,
    },
    cartItems: { type: [cartItemSchema], default: [] },
    selectedCustomer: { type: mongoose.Schema.Types.Mixed, default: null },
    discounts: { type: [mongoose.Schema.Types.Mixed], default: [] },
    paymentSelection: { type: mongoose.Schema.Types.Mixed, default: null },
    notes: { type: String, default: '' },
    totals: { type: mongoose.Schema.Types.Mixed, default: {} },
    sourceDeviceId: { type: String, default: '' },
    syncVersion: { type: Number, default: 1 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastClientUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

draftOrderSchema.index({ userId: 1, draftId: 1 }, { unique: true });
  draftOrderSchema.index({ branchId: 1 });
draftOrderSchema.index({ userId: 1, status: 1, updatedAt: -1 });

export const SavedCart = mongoose.model('SavedCart', draftOrderSchema, 'savedCarts');
export const DraftSale = mongoose.model('DraftSale', draftOrderSchema, 'draftSales');
export const HeldOrder = mongoose.model('HeldOrder', draftOrderSchema, 'heldOrders');

export const draftModels = {
  savedCart: SavedCart,
  draftSale: DraftSale,
  heldOrder: HeldOrder,
};

export default draftModels;
