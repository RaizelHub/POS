import mongoose from 'mongoose';
import Product from '../Models/product.js';
import InventoryMovement from '../Models/inventoryMovement.js';
import AuditLog from '../Models/auditLog.js';
import { toCents } from '../utils/money.js';

const runInventoryChange = async ({
  req,
  productId,
  type,
  quantityDelta,
  resultingQuantity,
  reason,
  unitCostCents,
}) => {
  const session = await mongoose.startSession();
  let product;
  try {
    await session.withTransaction(async () => {
      product = await Product.findOne({
        _id: productId,
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        isActive: { $ne: false },
      }).session(session);
      if (!product) {
        const error = new Error('Product not found in this branch.');
        error.status = 404;
        throw error;
      }

      const nextQuantity = resultingQuantity ?? product.quantity + quantityDelta;
      if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
        const error = new Error('Inventory quantity cannot be negative.');
        error.status = 400;
        throw error;
      }

      const actualDelta = nextQuantity - product.quantity;
      if (type === 'receiving' && unitCostCents !== undefined && actualDelta > 0) {
        const existingCostCents = product.costPriceCents || toCents(product.costPrice || 0);
        const weightedCost = Math.round(
          ((existingCostCents * product.quantity) + (unitCostCents * actualDelta)) / nextQuantity
        );
        product.costPriceCents = weightedCost;
        product.costPrice = weightedCost / 100;
      }

      product.quantity = nextQuantity;
      await product.save({ session });

      await InventoryMovement.create([{
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        productId: product._id,
        type,
        quantityDelta: actualDelta,
        resultingQuantity: nextQuantity,
        reason,
        referenceType: 'inventory-operation',
        referenceId: req.get('Idempotency-Key') || new mongoose.Types.ObjectId().toString(),
        performedBy: req.auth.userId,
        unitCostCents: unitCostCents ?? product.costPriceCents ?? 0,
      }], { session });

      await AuditLog.create([{
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        actorId: req.auth.userId,
        action: `inventory.${type}`,
        entityType: 'product',
        entityId: product._id.toString(),
        summary: `${type} changed stock by ${actualDelta}`,
        metadata: { previousQuantity: nextQuantity - actualDelta, nextQuantity, reason },
        ipAddress: req.ip,
      }], { session });
    });
    return product;
  } finally {
    await session.endSession();
  }
};

export const receiveInventory = async (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Receiving quantity must be a positive whole number.' });
  }
  try {
    const product = await runInventoryChange({
      req,
      productId: req.params.productId,
      type: 'receiving',
      quantityDelta: quantity,
      reason: req.body.reason || 'Stock received',
      unitCostCents: req.body.unitCost === undefined ? undefined : toCents(req.body.unitCost),
    });
    return res.json({ message: 'Inventory received.', product });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Unable to receive inventory.' });
  }
};

export const adjustInventory = async (req, res) => {
  const quantityDelta = Number(req.body.quantityDelta);
  if (!Number.isInteger(quantityDelta) || quantityDelta === 0) {
    return res.status(400).json({ message: 'Adjustment must be a non-zero whole number.' });
  }
  if (!req.body.reason?.trim()) {
    return res.status(400).json({ message: 'An adjustment reason is required.' });
  }
  try {
    const product = await runInventoryChange({
      req,
      productId: req.params.productId,
      type: quantityDelta < 0 && req.body.isWastage ? 'wastage' : 'adjustment',
      quantityDelta,
      reason: req.body.reason.trim(),
    });
    return res.json({ message: 'Inventory adjusted.', product });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Unable to adjust inventory.' });
  }
};

export const recordCycleCount = async (req, res) => {
  const countedQuantity = Number(req.body.countedQuantity);
  if (!Number.isInteger(countedQuantity) || countedQuantity < 0) {
    return res.status(400).json({ message: 'Counted quantity must be a non-negative whole number.' });
  }
  try {
    const product = await runInventoryChange({
      req,
      productId: req.params.productId,
      type: 'cycle_count',
      resultingQuantity: countedQuantity,
      reason: req.body.reason || 'Physical cycle count',
    });
    return res.json({ message: 'Cycle count recorded.', product });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Unable to record cycle count.' });
  }
};

export const getInventoryMovements = async (req, res) => {
  const query = {
    organizationId: req.auth.organizationId,
    branchId: req.auth.branchId,
  };
  if (req.query.productId && mongoose.Types.ObjectId.isValid(req.query.productId)) {
    query.productId = req.query.productId;
  }
  if (req.query.type) query.type = req.query.type;

  const movements = await InventoryMovement.find(query)
    .populate('productId', 'name barcode sku')
    .populate('performedBy', 'firstname lastname')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 100, 500));
  return res.json(movements);
};

