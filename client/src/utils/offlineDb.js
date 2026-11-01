/**
 * SUELTO POS — Client Offline Database (IndexedDB)
 * 
 * Durable, transactional client-side storage for:
 * 1. Approved local product catalog (with barcode, category, name indexes)
 * 2. Cashier session context & permissions for offline terminal unlock
 * 3. Pending offline transactions queue (awaiting MongoDB reconciliation)
 * 4. Sync metadata and schema versioning
 */

const DB_NAME = 'suelto_pos_offline_db';
const DB_VERSION = 1;

export const STORES = {
  PRODUCTS: 'products',
  CASHIER_SESSION: 'cashier_session',
  PENDING_TRANSACTIONS: 'pending_transactions',
  SYNC_METADATA: 'sync_metadata',
};

let dbPromise = null;

export const isIndexedDBSupported = () => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

/**
 * Initializes and upgrades the IndexedDB schema.
 */
export const openOfflineDb = () => {
  if (!isIndexedDBSupported()) {
    return Promise.reject(new Error('IndexedDB is not supported in this browser environment.'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Local Products Catalog Store
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const productStore = db.createObjectStore(STORES.PRODUCTS, { keyPath: '_id' });
        productStore.createIndex('barcode', 'barcode', { unique: false });
        productStore.createIndex('name', 'name', { unique: false });
        productStore.createIndex('category', 'category', { unique: false });
        productStore.createIndex('sku', 'sku', { unique: false });
      }

      // 2. Cashier Session & Workstation Context Store
      if (!db.objectStoreNames.contains(STORES.CASHIER_SESSION)) {
        db.createObjectStore(STORES.CASHIER_SESSION, { keyPath: 'key' });
      }

      // 3. Pending Offline Transactions Queue Store
      if (!db.objectStoreNames.contains(STORES.PENDING_TRANSACTIONS)) {
        const txStore = db.createObjectStore(STORES.PENDING_TRANSACTIONS, { keyPath: 'offlineId' });
        txStore.createIndex('status', 'status', { unique: false });
        txStore.createIndex('createdAt', 'createdAt', { unique: false });
        txStore.createIndex('registerId', 'registerId', { unique: false });
      }

      // 4. Synchronization & Catalog Version Metadata Store
      if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
        db.createObjectStore(STORES.SYNC_METADATA, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      // Reset promise if database closes unexpectedly
      db.onclose = () => {
        dbPromise = null;
      };

      resolve(db);
    };

    request.onerror = (event) => {
      dbPromise = null;
      reject(event.target.error || new Error('Failed to open IndexedDB database.'));
    };

    request.onblocked = () => {
      console.warn('[OfflineDB] Database upgrade blocked. Please close other tabs of SUELTO POS.');
    };
  });

  return dbPromise;
};

/**
 * Executes a transactional read/write operation.
 */
const withStore = async (storeName, mode, callback) => {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      let result;
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));

      result = callback(store, tx);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Puts an item into the specified store.
 */
export const putItem = async (storeName, item) => {
  return withStore(storeName, 'readwrite', (store) => {
    store.put(item);
    return item;
  });
};

/**
 * Retrieves an item by its primary key.
 */
export const getItem = async (storeName, key) => {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Deletes an item by its primary key.
 */
export const deleteItem = async (storeName, key) => {
  return withStore(storeName, 'readwrite', (store) => {
    store.delete(key);
    return true;
  });
};

/**
 * Retrieves all items in a store.
 */
export const getAllItems = async (storeName) => {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Retrieves a single item using an index.
 */
export const getItemByIndex = async (storeName, indexName, value) => {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.get(value);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Retrieves all items matching an index value.
 */
export const getAllByIndex = async (storeName, indexName, value) => {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Bulk upserts multiple records atomically in a single readwrite transaction.
 */
export const bulkPut = async (storeName, items) => {
  if (!items || !items.length) return 0;
  return withStore(storeName, 'readwrite', (store) => {
    for (let i = 0; i < items.length; i++) {
      store.put(items[i]);
    }
    return items.length;
  });
};

/**
 * Clears all records from a store.
 */
export const clearStore = async (storeName) => {
  return withStore(storeName, 'readwrite', (store) => {
    store.clear();
    return true;
  });
};

/**
 * Counts items in a store.
 */
export const countItems = async (storeName) => {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result || 0);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
};

