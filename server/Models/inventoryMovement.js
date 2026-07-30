import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    organizationId: { type: String, required: true, index: true },
    branchId: { type: String, required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: {
      type: String,
      enum: ['sale', 'return', 'void', 'receiving', 'adjustment', 'cycle_count', 'transfer', 'wastage'],
      required: true,
      index: true,
    },
    quantityDelta: { type: Number, required: true },
    resultingQuantity: { type: Number, required: true },
    reason: { type: String, trim: true, maxlength: 500 },
    referenceType: { type: String, trim: true },
    referenceId: { type: String, trim: true, index: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unitCostCents: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

inventoryMovementSchema.index({ organizationId: 1, branchId: 1, productId: 1, createdAt: -1 });

export default mongoose.model('InventoryMovement', inventoryMovementSchema);

