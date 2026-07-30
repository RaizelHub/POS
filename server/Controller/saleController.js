import mongoose from 'mongoose';
import Product from '../Models/product.js';
import Transaction from '../Models/transaction.js';
import Shift from '../Models/shift.js';
import Customer from '../Models/customer.js';
import Coupon from '../Models/coupon.js';
import InventoryMovement from '../Models/inventoryMovement.js';
import AuditLog from '../Models/auditLog.js';
import { fromCents, percentageOfCents, toCents } from '../utils/money.js';

const PAYMENT_METHODS = ['Cash', 'Card', 'GCash/PayMaya', 'Split', 'Pay Later'];

const saleError = (status, message, code = 'SALE_REJECTED') => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

const normalizeRequestedItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw saleError(400, 'At least one product is required.');
  }

  const quantities = new Map();
  for (const item of items) {
    const productId = item.productId || item._id;
    const quantity = Number(item.quantity);
    if (!mongoose.Types.ObjectId.isValid(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      throw saleError(400, 'Every sale item requires a valid product and positive whole quantity.');
    }
    quantities.set(productId.toString(), (quantities.get(productId.toString()) || 0) + quantity);
  }
  return quantities;
};

export const completeSale = async (req, res) => {
  const {
    products,
    paymentMethod,
    promoCode,
    customerId,
    shiftId,
    splitDetails,
    manualDiscountPercent = 0,
    redeemLoyaltyPoints = false,
    tenderReference,
    registerId = 'register-01',
  } = req.body;
  const idempotencyKey = req.get('Idempotency-Key') || req.body.idempotencyKey;

  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    return res.status(400).json({ message: 'A valid idempotency key is required.' });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Unsupported payment method.' });
  }
  if (['Card', 'GCash/PayMaya'].includes(paymentMethod) && !tenderReference?.trim()) {
    return res.status(400).json({ message: 'An external tender reference is required.' });
  }
  if (paymentMethod === 'Split' && Number(splitDetails?.digitalAmount) > 0 && !tenderReference?.trim()) {
    return res.status(400).json({ message: 'A reference is required for the digital split tender.' });
  }
  if (paymentMethod === 'Pay Later' && !customerId) {
    return res.status(400).json({ message: 'Customer credit requires an assigned customer.' });
  }

  try {
    const existing = await Transaction.findOne({
      organizationId: req.auth.organizationId,
      idempotencyKey,
    });
    if (existing) {
      return res.status(200).json({
        message: 'Sale was already completed.',
        transaction: existing,
        replayed: true,
      });
    }

    const requestedItems = normalizeRequestedItems(products);
    let savedTransaction;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const shift = await Shift.findOne({
          _id: shiftId,
          organizationId: req.auth.organizationId,
          branchId: req.auth.branchId,
          cashierId: req.auth.userId,
          status: 'Open',
        }).session(session);
        if (!shift) {
          throw saleError(409, 'An active shift for this cashier and branch is required.', 'SHIFT_REQUIRED');
        }

        const catalogProducts = await Product.find({
          _id: { $in: [...requestedItems.keys()] },
          organizationId: req.auth.organizationId,
          branchId: req.auth.branchId,
          isActive: true,
        }).session(session);

        if (catalogProducts.length !== requestedItems.size) {
          throw saleError(409, 'One or more products are unavailable in this branch.', 'PRODUCT_UNAVAILABLE');
        }

        let subtotalCents = 0;
        const transactionProducts = catalogProducts.map((product) => {
          const quantity = requestedItems.get(product._id.toString());
          const unitPriceCents = Number.isInteger(product.priceCents)
            ? product.priceCents
            : toCents(product.price);
          const totalPriceCents = unitPriceCents * quantity;
          subtotalCents += totalPriceCents;
          return {
            productId: product._id,
            name: product.name,
            price: fromCents(unitPriceCents),
            quantity,
            totalPrice: fromCents(totalPriceCents),
            unitPriceCents,
            totalPriceCents,
            paymentStatus: paymentMethod === 'Pay Later' ? 'Pay Later' : 'Paid',
            paymentMethod,
          };
        });

        let couponDiscountCents = 0;
        let appliedCoupon;
        if (promoCode && Number(manualDiscountPercent) > 0) {
          throw saleError(400, 'A coupon and manual discount cannot be combined.', 'DISCOUNT_STACKING_NOT_ALLOWED');
        }
        if (promoCode) {
          appliedCoupon = await Coupon.findOne({
            organizationId: req.auth.organizationId,
            branchId: req.auth.branchId,
            code: promoCode.trim().toUpperCase(),
            isActive: true,
            $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }],
          }).session(session);
          if (!appliedCoupon) {
            throw saleError(400, 'Coupon is invalid or expired.', 'INVALID_COUPON');
          }
          couponDiscountCents = appliedCoupon.discountType === 'percent'
            ? percentageOfCents(subtotalCents, appliedCoupon.discountValue)
            : Math.min(subtotalCents, toCents(appliedCoupon.discountValue));
        }

        let manualDiscountCents = 0;
        if (Number(manualDiscountPercent) > 0) {
          if (!req.auth.isAdmin && !['owner', 'manager', 'supervisor'].includes(req.auth.role)) {
            throw saleError(403, 'A supervisor must approve manual discounts.', 'APPROVAL_REQUIRED');
          }
          manualDiscountCents = percentageOfCents(subtotalCents, manualDiscountPercent);
        }

        let customer;
        let loyaltyDiscountCents = 0;
        if (customerId) {
          customer = await Customer.findOne({
            _id: customerId,
            organizationId: req.auth.organizationId,
            branchId: req.auth.branchId,
          }).session(session);
          if (!customer) throw saleError(404, 'Customer was not found in this branch.');
          if (redeemLoyaltyPoints) {
            loyaltyDiscountCents = Math.min(
              Math.max(0, subtotalCents - couponDiscountCents - manualDiscountCents),
              Math.max(0, customer.loyaltyPoints) * 100
            );
          }
        }

        const discountAmountCents = Math.min(
          subtotalCents,
          couponDiscountCents + manualDiscountCents + loyaltyDiscountCents
        );
        const totalAmountCents = subtotalCents - discountAmountCents;
        let remainingDiscountCents = discountAmountCents;
        transactionProducts.forEach((item, index) => {
          const isLast = index === transactionProducts.length - 1;
          const proportionalDiscount = subtotalCents
            ? Math.floor((discountAmountCents * item.totalPriceCents) / subtotalCents)
            : 0;
          const allocatedDiscount = isLast
            ? remainingDiscountCents
            : Math.min(remainingDiscountCents, proportionalDiscount);
          item.discountAllocationCents = allocatedDiscount;
          item.netTotalPriceCents = item.totalPriceCents - allocatedDiscount;
          item.refundedAmountCents = 0;
          remainingDiscountCents -= allocatedDiscount;
        });

        const cashAmountCents = toCents(splitDetails?.cashAmount || 0);
        const digitalAmountCents = toCents(splitDetails?.digitalAmount || 0);
        if (paymentMethod === 'Split' && cashAmountCents + digitalAmountCents !== totalAmountCents) {
          throw saleError(400, 'Split tender amounts must exactly equal the sale total.', 'INVALID_SPLIT');
        }

        const movementRows = [];
        for (const item of transactionProducts) {
          const updated = await Product.findOneAndUpdate(
            {
              _id: item.productId,
              organizationId: req.auth.organizationId,
              branchId: req.auth.branchId,
              quantity: { $gte: item.quantity },
            },
            { $inc: { quantity: -item.quantity } },
            { new: true, session }
          );
          if (!updated) {
            throw saleError(409, `${item.name} no longer has enough stock.`, 'STOCK_CONFLICT');
          }
          movementRows.push({
            organizationId: req.auth.organizationId,
            branchId: req.auth.branchId,
            productId: item.productId,
            type: 'sale',
            quantityDelta: -item.quantity,
            resultingQuantity: updated.quantity,
            reason: 'Completed sale',
            referenceType: 'transaction',
            performedBy: req.auth.userId,
            unitCostCents: updated.costPriceCents || toCents(updated.costPrice || 0),
          });
        }

        const paymentStatus = paymentMethod === 'Pay Later' ? 'Pay Later' : 'Paid';
        [savedTransaction] = await Transaction.create([{
          organizationId: req.auth.organizationId,
          branchId: req.auth.branchId,
          registerId,
          userId: req.auth.userId,
          products: transactionProducts,
          paymentMethod,
          paymentStatus,
          idempotencyKey,
          subtotalCents,
          discountAmountCents,
          totalAmountCents,
          amountPaidCents: paymentMethod === 'Pay Later' ? 0 : totalAmountCents,
          balanceDueCents: paymentMethod === 'Pay Later' ? totalAmountCents : 0,
          dueDate: paymentMethod === 'Pay Later'
            ? new Date(Date.now() + (Number(process.env.DEFAULT_CREDIT_DAYS || 30) * 86400000))
            : undefined,
          originalAmount: fromCents(subtotalCents),
          discountAmount: fromCents(discountAmountCents),
          promoCode: appliedCoupon?.code,
          customerId: customer?._id,
          shiftId: shift._id,
          loyaltyPointsEarned: Math.floor(fromCents(totalAmountCents) / 100),
          loyaltyPointsRedeemed: Math.floor(loyaltyDiscountCents / 100),
          splitDetails: {
            cashAmount: fromCents(cashAmountCents),
            digitalAmount: fromCents(digitalAmountCents),
            cashAmountCents,
            digitalAmountCents,
          },
          tenderReference: tenderReference?.trim() || undefined,
        }], { session });

        await Shift.updateOne({ _id: shift._id }, { $inc: { transactionsCount: 1 } }, { session });

        if (customer) {
          await Customer.updateOne(
            { _id: customer._id },
            {
              $inc: {
                purchaseCount: 1,
                totalSpent: fromCents(totalAmountCents),
                loyaltyPoints: Math.floor(fromCents(totalAmountCents) / 100) - Math.floor(loyaltyDiscountCents / 100),
                outstandingBalanceCents: paymentMethod === 'Pay Later' ? totalAmountCents : 0,
              },
            },
            { session }
          );
        }

        movementRows.forEach((row) => {
          row.referenceId = savedTransaction._id.toString();
        });
        await InventoryMovement.insertMany(movementRows, { session });
        await AuditLog.create([{
          organizationId: req.auth.organizationId,
          branchId: req.auth.branchId,
          actorId: req.auth.userId,
          action: 'sale.completed',
          entityType: 'transaction',
          entityId: savedTransaction._id.toString(),
          summary: `Completed sale ${savedTransaction.transactionId}`,
          metadata: { totalAmountCents, paymentMethod, itemCount: transactionProducts.length },
          ipAddress: req.ip,
        }], { session });
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      message: 'Payment completed successfully.',
      transaction: savedTransaction,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await Transaction.findOne({
        organizationId: req.auth.organizationId,
        idempotencyKey,
      });
      return res.status(200).json({ message: 'Sale was already completed.', transaction: existing, replayed: true });
    }
    return res.status(error.status || 500).json({
      message: error.status ? error.message : 'The sale could not be completed.',
      code: error.code || 'SALE_FAILED',
    });
  }
};
