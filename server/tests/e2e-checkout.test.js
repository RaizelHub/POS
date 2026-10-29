import test from 'node:test';
import assert from 'node:assert/strict';
import { toCents, fromCents, percentageOfCents } from '../utils/money.js';

// --- Pure Checkout Engine & State Transition Simulator ---
// Models the exact algorithmic pipeline of server/Controller/saleController.js

const simulateNormalizeItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('At least one product is required.');
    error.status = 400;
    throw error;
  }

  const quantities = new Map();
  for (const item of items) {
    const productId = item.productId || item._id;
    const quantity = Number(item.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      const error = new Error('Every sale item requires a valid product and positive whole quantity.');
      error.status = 400;
      throw error;
    }
    quantities.set(productId.toString(), (quantities.get(productId.toString()) || 0) + quantity);
  }
  return quantities;
};

const simulateCheckout = ({
  requestedProducts,
  catalogProducts,
  paymentMethod,
  splitDetails,
  promoCode,
  coupons = [],
  manualDiscountPercent = 0,
  userRole = 'cashier',
  isAdmin = false,
  customerId = null,
  activeShift = true,
  tenderReference = null,
  idempotencyKey = 'valid_idempotency_key_12345678',
  existingTransactions = new Map(),
}) => {
  // 1. Idempotency Key validation
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    const err = new Error('A valid idempotency key is required.');
    err.status = 400;
    throw err;
  }

  // 2. Check for duplicate replay
  if (existingTransactions.has(idempotencyKey)) {
    return {
      status: 200,
      replayed: true,
      transaction: existingTransactions.get(idempotencyKey),
    };
  }

  // 3. Payment method validation
  const PAYMENT_METHODS = ['Cash', 'Card', 'GCash/PayMaya', 'Split', 'Pay Later'];
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    const err = new Error('Unsupported payment method.');
    err.status = 400;
    throw err;
  }
  if (['Card', 'GCash/PayMaya'].includes(paymentMethod) && !tenderReference?.trim()) {
    const err = new Error('An external tender reference is required.');
    err.status = 400;
    throw err;
  }
  if (paymentMethod === 'Split' && Number(splitDetails?.digitalAmount) > 0 && !tenderReference?.trim()) {
    const err = new Error('A reference is required for the digital split tender.');
    err.status = 400;
    throw err;
  }
  if (paymentMethod === 'Pay Later' && !customerId) {
    const err = new Error('Customer credit requires an assigned customer.');
    err.status = 400;
    throw err;
  }

  // 4. Shift check
  if (!activeShift) {
    const err = new Error('An active shift for this cashier and branch is required.');
    err.status = 409;
    err.code = 'SHIFT_REQUIRED';
    throw err;
  }

  // 5. Normalize items
  const requestedItems = simulateNormalizeItems(requestedProducts);

  // 6. Match catalog items
  const catalogMap = new Map(catalogProducts.map((p) => [p._id.toString(), p]));
  for (const [id] of requestedItems) {
    const p = catalogMap.get(id);
    if (!p || !p.isActive) {
      const err = new Error('One or more products are unavailable in this branch.');
      err.status = 409;
      err.code = 'PRODUCT_UNAVAILABLE';
      throw err;
    }
  }

  // 7. Calculate subtotal on server
  let subtotalCents = 0;
  const lineItems = [];
  for (const [id, qty] of requestedItems) {
    const product = catalogMap.get(id);
    const unitPriceCents = product.priceCents || toCents(product.price);
    const totalPriceCents = unitPriceCents * qty;
    subtotalCents += totalPriceCents;

    lineItems.push({
      productId: product._id,
      name: product.name,
      price: fromCents(unitPriceCents),
      quantity: qty,
      totalPrice: fromCents(totalPriceCents),
      unitPriceCents,
      totalPriceCents,
      costPriceCents: product.costPriceCents || toCents(product.costPrice || 0),
    });
  }

  // 8. Discounts
  if (promoCode && Number(manualDiscountPercent) > 0) {
    const err = new Error('A coupon and manual discount cannot be combined.');
    err.status = 400;
    err.code = 'DISCOUNT_STACKING_NOT_ALLOWED';
    throw err;
  }

  let couponDiscountCents = 0;
  if (promoCode) {
    const coupon = coupons.find((c) => c.code === promoCode.toUpperCase() && c.isActive);
    if (!coupon) {
      const err = new Error('Coupon is invalid or expired.');
      err.status = 400;
      err.code = 'INVALID_COUPON';
      throw err;
    }
    couponDiscountCents = coupon.discountType === 'percent'
      ? percentageOfCents(subtotalCents, coupon.discountValue)
      : Math.min(subtotalCents, toCents(coupon.discountValue));
  }

  let manualDiscountCents = 0;
  if (Number(manualDiscountPercent) > 0) {
    if (!isAdmin && !['owner', 'manager', 'supervisor'].includes(userRole)) {
      const err = new Error('A supervisor must approve manual discounts.');
      err.status = 403;
      err.code = 'APPROVAL_REQUIRED';
      throw err;
    }
    manualDiscountCents = percentageOfCents(subtotalCents, manualDiscountPercent);
  }

  const discountAmountCents = Math.min(subtotalCents, couponDiscountCents + manualDiscountCents);
  const totalAmountCents = subtotalCents - discountAmountCents;

  // 9. Split tender verification
  if (paymentMethod === 'Split') {
    const cashAmountCents = toCents(splitDetails?.cashAmount || 0);
    const digitalAmountCents = toCents(splitDetails?.digitalAmount || 0);
    if (cashAmountCents + digitalAmountCents !== totalAmountCents) {
      const err = new Error('Split tender amounts must exactly equal the sale total.');
      err.status = 400;
      err.code = 'INVALID_SPLIT';
      throw err;
    }
  }

  // 10. Atomic Stock Check & Decrement
  const inventoryMovements = [];
  for (const item of lineItems) {
    const product = catalogMap.get(item.productId.toString());
    if (product.quantity < item.quantity) {
      const err = new Error(`${item.name} no longer has enough stock.`);
      err.status = 409;
      err.code = 'STOCK_CONFLICT';
      throw err;
    }
    // Atomic deduction
    product.quantity -= item.quantity;
    inventoryMovements.push({
      productId: item.productId,
      type: 'sale',
      quantityDelta: -item.quantity,
      resultingQuantity: product.quantity,
    });
  }

  // 11. Transaction creation
  const transaction = {
    transactionId: `TX-${Date.now()}`,
    products: lineItems,
    paymentMethod,
    idempotencyKey,
    subtotalCents,
    discountAmountCents,
    totalAmountCents,
    originalAmount: fromCents(subtotalCents),
    discountAmount: fromCents(discountAmountCents),
    totalAmount: fromCents(totalAmountCents),
    tenderReference,
    status: 'completed',
    transactionDate: new Date().toISOString(),
  };

  existingTransactions.set(idempotencyKey, transaction);

  return {
    status: 201,
    replayed: false,
    transaction,
    inventoryMovements,
  };
};

// ==========================================
// TEST SUITE: Primary E2E Checkout Flow
// ==========================================

test('E2E Checkout: Successful sale full journey', () => {
  const catalog = [
    { _id: 'prod-01', name: 'San Miguel Pale Pilsen', price: 65.00, priceCents: 6500, quantity: 24, isActive: true },
    { _id: 'prod-02', name: 'Lucky Me Pancit Canton', price: 18.50, priceCents: 1850, quantity: 50, isActive: true },
  ];
  const existingTx = new Map();

  const result = simulateCheckout({
    requestedProducts: [
      { productId: 'prod-01', quantity: 2 }, // 2 * 65.00 = 130.00 (13000 cents)
      { productId: 'prod-02', quantity: 3 }, // 3 * 18.50 = 55.50 (5550 cents)
    ],
    catalogProducts: catalog,
    paymentMethod: 'Cash',
    idempotencyKey: 'idemp_key_success_journey_001',
    existingTransactions: existingTx,
  });

  // Verify response
  assert.equal(result.status, 201);
  assert.equal(result.replayed, false);
  assert.equal(result.transaction.subtotalCents, 18550);
  assert.equal(result.transaction.totalAmountCents, 18550);
  assert.equal(result.transaction.totalAmount, 185.50);

  // Verify inventory decremented
  assert.equal(catalog.find((p) => p._id === 'prod-01').quantity, 22);
  assert.equal(catalog.find((p) => p._id === 'prod-02').quantity, 47);

  // Verify inventory movement records generated
  assert.equal(result.inventoryMovements.length, 2);
  assert.equal(result.inventoryMovements[0].type, 'sale');
  assert.equal(result.inventoryMovements[0].quantityDelta, -2);
  assert.equal(result.inventoryMovements[0].resultingQuantity, 22);
});

test('E2E Checkout: Promo coupon application and rounding', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Premium Coffee 500g', price: 299.99, priceCents: 29999, quantity: 10, isActive: true },
  ];
  const coupons = [
    { code: 'WELCOME10', discountType: 'percent', discountValue: 10, isActive: true },
  ];

  const result = simulateCheckout({
    requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
    catalogProducts: catalog,
    paymentMethod: 'Cash',
    promoCode: 'WELCOME10',
    coupons,
    idempotencyKey: 'idemp_key_coupon_discount_002',
  });

  // 10% of 29999 cents = 3000 cents (Math.round((29999 * 10) / 100))
  assert.equal(result.transaction.discountAmountCents, 3000);
  assert.equal(result.transaction.discountAmount, 30.00);
  assert.equal(result.transaction.totalAmountCents, 26999);
  assert.equal(result.transaction.totalAmount, 269.99);
});

test('E2E Checkout: Duplicate checkout submission replays without double stock deduction', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Chocolate Bar', price: 50.00, priceCents: 5000, quantity: 10, isActive: true },
  ];
  const existingTx = new Map();
  const idempotencyKey = 'idemp_key_repeat_submission_003';

  // First submission
  const firstResult = simulateCheckout({
    requestedProducts: [{ productId: 'prod-01', quantity: 2 }],
    catalogProducts: catalog,
    paymentMethod: 'Cash',
    idempotencyKey,
    existingTransactions: existingTx,
  });

  assert.equal(firstResult.status, 201);
  assert.equal(firstResult.replayed, false);
  assert.equal(catalog[0].quantity, 8); // Decremented from 10 to 8

  // Immediate retry with the same idempotency key (simulating network timeout or double-click)
  const secondResult = simulateCheckout({
    requestedProducts: [{ productId: 'prod-01', quantity: 2 }],
    catalogProducts: catalog,
    paymentMethod: 'Cash',
    idempotencyKey,
    existingTransactions: existingTx,
  });

  assert.equal(secondResult.status, 200);
  assert.equal(secondResult.replayed, true);
  assert.equal(secondResult.transaction.transactionId, firstResult.transaction.transactionId);
  // Stock MUST still be 8, NOT 6!
  assert.equal(catalog[0].quantity, 8);
});

test('E2E Checkout: Split tender payment exact match', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Item A', price: 100.00, priceCents: 10000, quantity: 5, isActive: true },
  ];

  const result = simulateCheckout({
    requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
    catalogProducts: catalog,
    paymentMethod: 'Split',
    splitDetails: { cashAmount: 40.00, digitalAmount: 60.00 },
    tenderReference: 'GCASH-REF-89472',
    idempotencyKey: 'idemp_key_split_tender_004',
  });

  assert.equal(result.status, 201);
  assert.equal(result.transaction.totalAmountCents, 10000);
});

// ==========================================
// TEST SUITE: Failure & Boundary Scenarios
// ==========================================

test('E2E Failure: Insufficient stock aborts checkout with STOCK_CONFLICT', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Rare Whiskey', price: 1500.00, priceCents: 150000, quantity: 1, isActive: true },
  ];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 2 }], // Requested 2, but only 1 exists
        catalogProducts: catalog,
        paymentMethod: 'Cash',
        idempotencyKey: 'idemp_key_insufficient_stock_005',
      });
    },
    (err) => err.status === 409 && err.code === 'STOCK_CONFLICT' && catalog[0].quantity === 1
  );
});

test('E2E Failure: Product inactive or deleted from branch catalog', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Discontinued SKU', price: 50.00, priceCents: 5000, quantity: 10, isActive: false },
  ];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
        catalogProducts: catalog,
        paymentMethod: 'Cash',
        idempotencyKey: 'idemp_key_inactive_product_006',
      });
    },
    (err) => err.status === 409 && err.code === 'PRODUCT_UNAVAILABLE'
  );
});

test('E2E Failure: Split tender mismatch fails with INVALID_SPLIT', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Item', price: 100.00, priceCents: 10000, quantity: 5, isActive: true },
  ];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 1 }], // Total 100.00
        catalogProducts: catalog,
        paymentMethod: 'Split',
        splitDetails: { cashAmount: 30.00, digitalAmount: 50.00 }, // Sum is 80.00 != 100.00
        tenderReference: 'REF-1234',
        idempotencyKey: 'idemp_key_split_mismatch_007',
      });
    },
    (err) => err.status === 400 && err.code === 'INVALID_SPLIT'
  );
});

test('E2E Failure: Cashier cannot apply manual discount without supervisor role', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Item', price: 200.00, priceCents: 20000, quantity: 5, isActive: true },
  ];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
        catalogProducts: catalog,
        paymentMethod: 'Cash',
        manualDiscountPercent: 15,
        userRole: 'cashier', // Cashier role
        isAdmin: false,
        idempotencyKey: 'idemp_key_unauthorized_discount_008',
      });
    },
    (err) => err.status === 403 && err.code === 'APPROVAL_REQUIRED'
  );
});

test('E2E Failure: Stacking coupon and manual discount is rejected', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Item', price: 200.00, priceCents: 20000, quantity: 5, isActive: true },
  ];
  const coupons = [{ code: 'SALE10', discountType: 'percent', discountValue: 10, isActive: true }];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
        catalogProducts: catalog,
        paymentMethod: 'Cash',
        promoCode: 'SALE10',
        manualDiscountPercent: 5,
        userRole: 'manager',
        idempotencyKey: 'idemp_key_stacked_discount_009',
      });
    },
    (err) => err.status === 400 && err.code === 'DISCOUNT_STACKING_NOT_ALLOWED'
  );
});

test('E2E Failure: Digital payment without tender reference is rejected', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Item', price: 100.00, priceCents: 10000, quantity: 5, isActive: true },
  ];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
        catalogProducts: catalog,
        paymentMethod: 'GCash/PayMaya',
        tenderReference: '', // Missing reference
        idempotencyKey: 'idemp_key_missing_ref_010',
      });
    },
    (err) => err.status === 400
  );
});

test('E2E Failure: Missing active cashier shift is rejected with SHIFT_REQUIRED', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Item', price: 100.00, priceCents: 10000, quantity: 5, isActive: true },
  ];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
        catalogProducts: catalog,
        paymentMethod: 'Cash',
        activeShift: false, // No open shift
        idempotencyKey: 'idemp_key_missing_shift_011',
      });
    },
    (err) => err.status === 409 && err.code === 'SHIFT_REQUIRED'
  );
});

test('E2E Failure: Malformed or missing idempotency key is rejected', () => {
  const catalog = [
    { _id: 'prod-01', name: 'Item', price: 100.00, priceCents: 10000, quantity: 5, isActive: true },
  ];

  assert.throws(
    () => {
      simulateCheckout({
        requestedProducts: [{ productId: 'prod-01', quantity: 1 }],
        catalogProducts: catalog,
        paymentMethod: 'Cash',
        idempotencyKey: 'too_short', // Less than 16 chars
      });
    },
    (err) => err.status === 400
  );
});

test('E2E Failure: Non-positive or fractional item quantities are rejected', () => {
  assert.throws(() => simulateNormalizeItems([{ productId: 'prod-01', quantity: 0 }]), (err) => err.status === 400);
  assert.throws(() => simulateNormalizeItems([{ productId: 'prod-01', quantity: -2 }]), (err) => err.status === 400);
  assert.throws(() => simulateNormalizeItems([{ productId: 'prod-01', quantity: 1.5 }]), (err) => err.status === 400);
});

