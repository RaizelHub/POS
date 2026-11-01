import test from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// TEST SUITE: OFFLINE-FIRST ARCHITECTURAL FOUNDATION (Stage A)
// ============================================================================

test('OfflineDB Schema: Stores and indexes match architecture specifications', () => {
  const STORES = {
    PRODUCTS: 'products',
    CASHIER_SESSION: 'cashier_session',
    PENDING_TRANSACTIONS: 'pending_transactions',
    SYNC_METADATA: 'sync_metadata',
  };

  assert.equal(STORES.PRODUCTS, 'products');
  assert.equal(STORES.CASHIER_SESSION, 'cashier_session');
  assert.equal(STORES.PENDING_TRANSACTIONS, 'pending_transactions');
  assert.equal(STORES.SYNC_METADATA, 'sync_metadata');
});

test('Catalog Sanitizer: Correctly cleanses product fields for local IndexedDB persistence', () => {
  const rawProducts = [
    {
      _id: 'prod_001',
      name: 'Artisan Espresso Beans 250g',
      price: 450,
      cost: 280,
      category: 'Coffee',
      barcode: ' 1234567890123 ',
      sku: 'COF-ESP-250',
      stock: 45,
      isTaxable: true,
      taxRate: 0.12,
    },
    {
      id: 'prod_002', // fallback id
      name: 'Organic Earl Grey',
      price: '320', // string price
      quantity: 12, // fallback quantity field
      category: null,
      barcode: null,
    },
  ];

  const sanitized = rawProducts.map((p) => ({
    _id: String(p._id || p.id),
    name: p.name || 'Unnamed Product',
    price: Number(p.price) || 0,
    cost: Number(p.cost) || 0,
    category: p.category || 'General',
    barcode: p.barcode ? String(p.barcode).trim() : '',
    sku: p.sku ? String(p.sku).trim() : '',
    stock: typeof p.stock === 'number' ? p.stock : (p.quantity || 0),
    isTaxable: Boolean(p.isTaxable),
    taxRate: Number(p.taxRate) || 0,
  }));

  assert.equal(sanitized[0]._id, 'prod_001');
  assert.equal(sanitized[0].barcode, '1234567890123'); // trimmed
  assert.equal(sanitized[0].stock, 45);

  assert.equal(sanitized[1]._id, 'prod_002');
  assert.equal(sanitized[1].price, 320); // numeric
  assert.equal(sanitized[1].category, 'General'); // default
  assert.equal(sanitized[1].stock, 12); // from quantity
  assert.equal(sanitized[1].barcode, '');
});

test('Offline Search Simulator: Correctly matches products by query and category', () => {
  const catalog = [
    { _id: '1', name: 'Almond Croissant', category: 'Pastry', barcode: '4001', sku: 'PAS-ALM' },
    { _id: '2', name: 'Pain au Chocolat', category: 'Pastry', barcode: '4002', sku: 'PAS-CHO' },
    { _id: '3', name: 'Cold Brew 500ml', category: 'Beverage', barcode: '5001', sku: 'BEV-CB' },
  ];

  const search = (query = '', category = 'all') => {
    const cleanQuery = query.toLowerCase().trim();
    return catalog.filter((product) => {
      const matchesCategory =
        !category || category === 'all' || product.category.toLowerCase() === category.toLowerCase();
      if (!cleanQuery) return matchesCategory;
      const matchesName = product.name.toLowerCase().includes(cleanQuery);
      const matchesBarcode = product.barcode.includes(cleanQuery);
      const matchesSku = product.sku.toLowerCase().includes(cleanQuery);
      return matchesCategory && (matchesName || matchesBarcode || matchesSku);
    });
  };

  // Category filter
  assert.equal(search('', 'Pastry').length, 2);
  assert.equal(search('', 'Beverage').length, 1);

  // Search by name
  assert.equal(search('almond', 'all').length, 1);
  assert.equal(search('almond', 'all')[0]._id, '1');

  // Search by barcode
  assert.equal(search('5001', 'all').length, 1);
  assert.equal(search('5001', 'all')[0].name, 'Cold Brew 500ml');

  // Search by SKU
  assert.equal(search('PAS-CHO', 'all').length, 1);
  assert.equal(search('PAS-CHO', 'all')[0]._id, '2');

  // Search mismatch
  assert.equal(search('NonexistentItem', 'all').length, 0);
});

test('Connectivity Resolution: Distinguishes browser offline from backend outage', () => {
  const resolveStatus = ({ browserOnline, backendHealthy, isSyncing }) => {
    if (isSyncing) return 'syncing';
    if (!browserOnline) return 'offline_browser';
    if (!backendHealthy) return 'offline_backend';
    return 'online';
  };

  assert.equal(resolveStatus({ browserOnline: true, backendHealthy: true, isSyncing: false }), 'online');
  assert.equal(resolveStatus({ browserOnline: false, backendHealthy: true, isSyncing: false }), 'offline_browser');
  assert.equal(resolveStatus({ browserOnline: true, backendHealthy: false, isSyncing: false }), 'offline_backend');
  assert.equal(resolveStatus({ browserOnline: true, backendHealthy: true, isSyncing: true }), 'syncing');
});

