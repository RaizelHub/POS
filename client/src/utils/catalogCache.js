/**
 * SUELTO POS — Local Product Catalog Synchronization Service
 * 
 * Manages caching and offline querying of approved store products in IndexedDB.
 */

import {
  STORES,
  bulkPut,
  getAllItems,
  getItemByIndex,
  getItem,
  putItem,
  countItems,
} from './offlineDb';

/**
 * Persists an array of products to the local IndexedDB catalog.
 * @param {Array} products - List of products from backend
 * @returns {Promise<{ count: number, syncedAt: string }>}
 */
export const syncCatalogToIndexedDb = async (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return { count: 0, syncedAt: new Date().toISOString() };
  }

  // Sanitize and ensure each product has valid keyPath (_id)
  const sanitized = products.map((p) => ({
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
    imageUrl: p.imageUrl || p.image || '',
    status: p.status || 'active',
    updatedAt: p.updatedAt || new Date().toISOString(),
  }));

  // Bulk upsert into IndexedDB
  const count = await bulkPut(STORES.PRODUCTS, sanitized);

  const syncedAt = new Date().toISOString();
  await putItem(STORES.SYNC_METADATA, {
    key: 'catalog_sync',
    count,
    syncedAt,
  });

  return { count, syncedAt };
};

/**
 * Retrieves the full cached product catalog from IndexedDB.
 * @returns {Promise<Array>}
 */
export const getCachedCatalog = async () => {
  try {
    const products = await getAllItems(STORES.PRODUCTS);
    return products || [];
  } catch (err) {
    console.error('[CatalogCache] Failed to read cached products:', err);
    return [];
  }
};

/**
 * Looks up a single product by its barcode from IndexedDB.
 * @param {string} barcode 
 * @returns {Promise<Object|null>}
 */
export const getCachedProductByBarcode = async (barcode) => {
  if (!barcode) return null;
  const cleanBarcode = String(barcode).trim();
  try {
    const exact = await getItemByIndex(STORES.PRODUCTS, 'barcode', cleanBarcode);
    if (exact) return exact;

    // Fallback: search in-memory if index scan misses due to slight formatting
    const all = await getAllItems(STORES.PRODUCTS);
    return all.find((p) => p.barcode && p.barcode.trim() === cleanBarcode) || null;
  } catch (err) {
    console.error('[CatalogCache] Barcode index lookup error:', err);
    return null;
  }
};

/**
 * Filters the cached product catalog offline.
 * @param {string} query Search text
 * @param {string} category Selected category or 'all'
 * @returns {Promise<Array>}
 */
export const searchCachedCatalog = async (query = '', category = 'all') => {
  const all = await getCachedCatalog();
  const cleanQuery = query.toLowerCase().trim();

  return all.filter((product) => {
    const matchesCategory =
      !category || category === 'all' || (product.category && product.category.toLowerCase() === category.toLowerCase());

    if (!cleanQuery) return matchesCategory;

    const matchesName = product.name && product.name.toLowerCase().includes(cleanQuery);
    const matchesBarcode = product.barcode && product.barcode.toLowerCase().includes(cleanQuery);
    const matchesSku = product.sku && product.sku.toLowerCase().includes(cleanQuery);

    return matchesCategory && (matchesName || matchesBarcode || matchesSku);
  });
};

/**
 * Retrieves the timestamp and count of the last catalog sync.
 * @returns {Promise<{ count: number, syncedAt: string }|null>}
 */
export const getCatalogSyncMetadata = async () => {
  try {
    const meta = await getItem(STORES.SYNC_METADATA, 'catalog_sync');
    if (!meta) {
      const count = await countItems(STORES.PRODUCTS);
      return count > 0 ? { count, syncedAt: 'Previously cached' } : null;
    }
    return meta;
  } catch (err) {
    return null;
  }
};

