import test from 'node:test';
import assert from 'node:assert/strict';

// Core business logic validators extracted from productsController
const validateProductPayload = ({ name, price, quantity, barcode, costPrice = 0, lowStockThreshold = 5 }) => {
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedBarcode = typeof barcode === 'string' ? barcode.trim() : '';
  const numPrice = Number(price);
  const numCostPrice = Number(costPrice);
  const numQuantity = Number(quantity);
  const numLowStock = Number(lowStockThreshold);

  if (!trimmedName || trimmedName.length > 100) {
    return { valid: false, error: 'Product name is required (max 100 characters).' };
  }
  if (!trimmedBarcode || trimmedBarcode.length > 50) {
    return { valid: false, error: 'Barcode is required (max 50 characters).' };
  }
  if (!Number.isFinite(numPrice) || numPrice <= 0) {
    return { valid: false, error: 'Price must be a positive number greater than 0.' };
  }
  if (!Number.isFinite(numCostPrice) || numCostPrice < 0) {
    return { valid: false, error: 'Cost price must be a non-negative number.' };
  }
  if (!Number.isInteger(numQuantity) || numQuantity < 0) {
    return { valid: false, error: 'Stock quantity must be a non-negative whole integer.' };
  }
  if (!Number.isInteger(numLowStock) || numLowStock < 0) {
    return { valid: false, error: 'Low stock threshold must be a non-negative integer.' };
  }

  return { valid: true };
};

const categorizeStock = (quantity, lowStockThreshold = 5) => {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= lowStockThreshold) return 'low_stock';
  return 'in_stock';
};

const sanitizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return '';
  return term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const calculatePagination = (totalItems, page = 1, limit = 20) => {
  const boundedPage = Math.max(1, Number(page) || 1);
  const boundedLimit = Math.min(Math.max(1, Number(limit) || 20), 100);
  const totalPages = Math.ceil(totalItems / boundedLimit) || 1;
  const skip = (boundedPage - 1) * boundedLimit;
  return { page: boundedPage, limit: boundedLimit, totalPages, skip };
};

test('product validation rejects invalid prices', () => {
  assert.equal(validateProductPayload({ name: 'Item', price: 0, quantity: 5, barcode: '123' }).valid, false);
  assert.equal(validateProductPayload({ name: 'Item', price: -10, quantity: 5, barcode: '123' }).valid, false);
  assert.equal(validateProductPayload({ name: 'Item', price: 'abc', quantity: 5, barcode: '123' }).valid, false);
  assert.equal(validateProductPayload({ name: 'Item', price: 99.50, quantity: 5, barcode: '123' }).valid, true);
});

test('product validation rejects fractional or negative quantities', () => {
  assert.equal(validateProductPayload({ name: 'Item', price: 10, quantity: -1, barcode: '123' }).valid, false);
  assert.equal(validateProductPayload({ name: 'Item', price: 10, quantity: 2.5, barcode: '123' }).valid, false);
  assert.equal(validateProductPayload({ name: 'Item', price: 10, quantity: 0, barcode: '123' }).valid, true);
  assert.equal(validateProductPayload({ name: 'Item', price: 10, quantity: 50, barcode: '123' }).valid, true);
});

test('product validation rejects empty or missing names and barcodes', () => {
  assert.equal(validateProductPayload({ name: '', price: 10, quantity: 5, barcode: '123' }).valid, false);
  assert.equal(validateProductPayload({ name: '   ', price: 10, quantity: 5, barcode: '123' }).valid, false);
  assert.equal(validateProductPayload({ name: 'Valid Item', price: 10, quantity: 5, barcode: '' }).valid, false);
});

test('stock categorization distinguishes out-of-stock from low-stock', () => {
  assert.equal(categorizeStock(0, 5), 'out_of_stock');
  assert.equal(categorizeStock(-2, 5), 'out_of_stock');
  assert.equal(categorizeStock(3, 5), 'low_stock');
  assert.equal(categorizeStock(5, 5), 'low_stock');
  assert.equal(categorizeStock(6, 5), 'in_stock');
  assert.equal(categorizeStock(100, 5), 'in_stock');
});

test('pagination boundaries enforce min page and max limit', () => {
  const p1 = calculatePagination(150, -5, 500); // Bad page and limit over max
  assert.equal(p1.page, 1);
  assert.equal(p1.limit, 100); // Clamped to 100 max
  assert.equal(p1.totalPages, 2);
  assert.equal(p1.skip, 0);

  const p2 = calculatePagination(45, 2, 20);
  assert.equal(p2.page, 2);
  assert.equal(p2.limit, 20);
  assert.equal(p2.totalPages, 3);
  assert.equal(p2.skip, 20);
});

test('search term sanitizer escapes regex metacharacters safely', () => {
  assert.equal(sanitizeSearchTerm('coke (330ml)'), 'coke \\(330ml\\)');
  assert.equal(sanitizeSearchTerm('item+extra*'), 'item\\+extra\\*');
  assert.equal(sanitizeSearchTerm('normal text'), 'normal text');
});

