import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Transaction from '../Models/transaction.js';
import Product from '../Models/product.js';
import Return from '../Models/return.js';
import InventoryMovement from '../Models/inventoryMovement.js';
import AuditLog from '../Models/auditLog.js';
import Shift from '../Models/shift.js';
import Customer from '../Models/customer.js';

const executeReturn = async ({ req, transaction, requestedItems, reason, refundMethod, isVoid = false, session }) => {
  const requested = new Map();
  for (const item of requestedItems) {
    const productId = item.productId?.toString();
    const quantity = Number(item.quantity);
    if (!mongoose.Types.ObjectId.isValid(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error('Every returned item requires a valid product and positive whole quantity.');
      error.status = 400;
      throw error;
    }
    requested.set(productId, (requested.get(productId) || 0) + quantity);
  }

  const returnItems = [];
  let totalRefundCents = 0;
  for (const productId of requested.keys()) {
    const soldItem = transaction.products.find((item) => item.productId?.toString() === productId);
    const returnQuantity = requested.get(productId);
    if (!soldItem || returnQuantity > soldItem.quantity - (soldItem.returnedQuantity || 0)) {
      const error = new Error('Return quantity exceeds the remaining sold quantity.');
      error.status = 409;
      throw error;
    }
    const unitPriceCents = soldItem.unitPriceCents ?? Math.round(soldItem.price * 100);
    const netLineTotalCents = soldItem.netTotalPriceCents ?? (unitPriceCents * soldItem.quantity);
    const previousReturnedQuantity = soldItem.returnedQuantity || 0;
    const previousRefundedCents = soldItem.refundedAmountCents || 0;
    const newReturnedQuantity = previousReturnedQuantity + returnQuantity;
    const cumulativeRefundCents = newReturnedQuantity === soldItem.quantity
      ? netLineTotalCents
      : Math.floor((netLineTotalCents * newReturnedQuantity) / soldItem.quantity);
    const refundAmountCents = Math.max(0, cumulativeRefundCents - previousRefundedCents);
    totalRefundCents += refundAmountCents;
    soldItem.returnedQuantity = newReturnedQuantity;
    soldItem.refundedAmountCents = previousRefundedCents + refundAmountCents;
    returnItems.push({
      productId: soldItem.productId,
      name: soldItem.name,
      quantity: returnQuantity,
      unitPriceCents,
      refundAmountCents,
    });
  }

  const movementRows = [];
  for (const item of returnItems) {
    const product = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
      },
      { $inc: { quantity: item.quantity } },
      { new: true, session }
    );
    if (!product) {
      const error = new Error(`Product ${item.name} no longer exists in this branch.`);
      error.status = 409;
      throw error;
    }
    movementRows.push({
      organizationId: req.auth.organizationId,
      branchId: req.auth.branchId,
      productId: item.productId,
      type: isVoid ? 'void' : 'return',
      quantityDelta: item.quantity,
      resultingQuantity: product.quantity,
      reason,
      referenceType: 'transaction',
      referenceId: transaction._id.toString(),
      performedBy: req.auth.userId,
      unitCostCents: product.costPriceCents || 0,
    });
  }

  const fullyReturned = transaction.products.every(
    (item) => (item.returnedQuantity || 0) >= item.quantity
  );
  const creditAdjustmentCents = Math.min(transaction.balanceDueCents || 0, totalRefundCents);
  if (creditAdjustmentCents > 0) {
    transaction.balanceDueCents -= creditAdjustmentCents;
    await Customer.updateOne(
      { _id: transaction.customerId, organizationId: req.auth.organizationId },
      { $inc: { outstandingBalanceCents: -creditAdjustmentCents } },
      { session }
    );
    if (transaction.balanceDueCents === 0) {
      transaction.paymentStatus = 'Paid';
      transaction.products.forEach((item) => { item.paymentStatus = 'Paid'; });
    }
  }
  transaction.refundTotalCents = (transaction.refundTotalCents || 0) + totalRefundCents;
  transaction.status = isVoid ? 'voided' : (fullyReturned ? 'refunded' : 'partially_refunded');
  await transaction.save({ session });

  const tenderRefundCents = totalRefundCents - creditAdjustmentCents;
  const affectsCash = tenderRefundCents > 0 && (refundMethod === 'Cash' || (
    refundMethod === 'Original Tender' &&
    (transaction.paymentMethod === 'Cash' || (
      transaction.paymentMethod === 'Split' && (transaction.splitDetails?.cashAmountCents || 0) > 0
    ))
  ));
  const cashRefundCents = !affectsCash ? 0 : (
    refundMethod === 'Cash' || transaction.paymentMethod === 'Cash'
      ? tenderRefundCents
      : Math.round(tenderRefundCents * ((transaction.splitDetails?.cashAmountCents || 0) / transaction.totalAmountCents))
  );
  let refundShiftId;
  if (affectsCash) {
    const refundShift = await Shift.findOne({
      _id: req.body.shiftId,
      organizationId: req.auth.organizationId,
      branchId: req.auth.branchId,
      status: 'Open',
    }).session(session);
    if (!refundShift) {
      const error = new Error('Select an open shift for a cash-impacting refund.');
      error.status = 409;
      throw error;
    }
    refundShiftId = refundShift._id;
  }

  const [returnRecord] = await Return.create([{
    organizationId: req.auth.organizationId,
    branchId: req.auth.branchId,
    transactionId: transaction._id,
    shiftId: refundShiftId,
    returnNumber: `${isVoid ? 'VOID' : 'RET'}-${uuidv4()}`,
    items: returnItems,
    totalRefundCents,
    creditAdjustmentCents,
    cashRefundCents,
    refundMethod,
    reason,
    approvedBy: req.auth.userId,
  }], { session });

  await InventoryMovement.insertMany(movementRows, { session });
  await AuditLog.create([{
    organizationId: req.auth.organizationId,
    branchId: req.auth.branchId,
    actorId: req.auth.userId,
    action: isVoid ? 'sale.voided' : 'sale.returned',
    entityType: 'transaction',
    entityId: transaction._id.toString(),
    summary: isVoid ? 'Transaction voided' : 'Items returned',
    metadata: { returnId: returnRecord._id, totalRefundCents, reason },
    ipAddress: req.ip,
  }], { session });
  return returnRecord;
};

export const returnTransactionItems = async (req, res) => {
  if (!req.body.reason?.trim()) return res.status(400).json({ message: 'A return reason is required.' });
  const session = await mongoose.startSession();
  let returnRecord;
  try {
    await session.withTransaction(async () => {
      const transaction = await Transaction.findOne({
        _id: req.params.transactionId,
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        status: { $nin: ['voided', 'refunded'] },
      }).session(session);
      if (!transaction) {
        const error = new Error('Eligible transaction not found.');
        error.status = 404;
        throw error;
      }
      returnRecord = await executeReturn({
        req,
        transaction,
        requestedItems: req.body.items,
        reason: req.body.reason.trim(),
        refundMethod: req.body.refundMethod || 'Original Tender',
        session,
      });
    });
    return res.status(201).json({ message: 'Return completed.', return: returnRecord });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Unable to complete return.' });
  } finally {
    await session.endSession();
  }
};

export const voidTransaction = async (req, res) => {
  if (!req.body.reason?.trim()) return res.status(400).json({ message: 'A void reason is required.' });
  const session = await mongoose.startSession();
  let returnRecord;
  try {
    await session.withTransaction(async () => {
      const transaction = await Transaction.findOne({
        _id: req.params.transactionId,
        organizationId: req.auth.organizationId,
        branchId: req.auth.branchId,
        status: 'completed',
        refundTotalCents: 0,
      }).session(session);
      if (!transaction) {
        const error = new Error('Only an unreturned completed transaction can be voided.');
        error.status = 409;
        throw error;
      }
      returnRecord = await executeReturn({
        req,
        transaction,
        requestedItems: transaction.products.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        reason: req.body.reason.trim(),
        refundMethod: req.body.refundMethod || 'Original Tender',
        isVoid: true,
        session,
      });
    });
    return res.json({ message: 'Transaction voided.', void: returnRecord });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Unable to void transaction.' });
  } finally {
    await session.endSession();
  }
};

export const getReturns = async (req, res) => {
  const returns = await Return.find({
    organizationId: req.auth.organizationId,
    branchId: req.auth.branchId,
  })
    .populate('transactionId', 'transactionId transactionDate')
    .populate('approvedBy', 'firstname lastname')
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 100, 500));
  return res.json(returns);
};
