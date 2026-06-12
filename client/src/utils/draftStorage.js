import config from '../config';

const DB_NAME = 'pos_transaction_recovery';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const FALLBACK_KEY = 'posTransactionDrafts';
const DEVICE_KEY = 'posDraftDeviceId';

export const DRAFT_TYPES = {
  SAVED_CART: 'savedCart',
  DRAFT_SALE: 'draftSale',
  HELD_ORDER: 'heldOrder',
};

const canUseIndexedDB = () => typeof window !== 'undefined' && 'indexedDB' in window;

const requestToPromise = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const transactionToPromise = (transaction) =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

const openDraftDb = () =>
  new Promise((resolve, reject) => {
    if (!canUseIndexedDB()) {
      reject(new Error('IndexedDB is not available.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localKey' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const readFallbackDrafts = () => {
  try {
    return JSON.parse(localStorage.getItem(FALLBACK_KEY)) || [];
  } catch (error) {
    console.error('Unable to read local draft fallback:', error);
    return [];
  }
};

const writeFallbackDrafts = (drafts) => {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(drafts));
};

export const getDraftDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
};

export const createDraftId = (draftType = DRAFT_TYPES.SAVED_CART) =>
  `${draftType}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const createActiveDraftId = (userId, draftType = DRAFT_TYPES.SAVED_CART) =>
  `${draftType}-${userId}-active`;

const getLocalKey = ({ userId, draftType, draftId }) => `${userId}:${draftType}:${draftId}`;

export const normalizeDraft = (draft) => {
  const now = new Date().toISOString();
  const draftType = draft.draftType || DRAFT_TYPES.SAVED_CART;
  const userId = draft.userId;
  const draftId = draft.draftId || createActiveDraftId(userId, draftType);
  const cartItems = (draft.cartItems || draft.cart || []).map((item) => {
    const product = item.product || {
      _id: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.availableQuantity || item.quantity,
      image: item.image,
      barcode: item.barcode,
    };

    return {
      ...item,
      product,
      quantity: item.quantity || 1,
    };
  });

  return {
    draftId,
    draftType,
    localKey: getLocalKey({ userId, draftType, draftId }),
    userId,
    cashierId: draft.cashierId || userId,
    status: draft.status || (draftType === DRAFT_TYPES.HELD_ORDER ? 'held' : 'active'),
    cartItems,
    selectedCustomer: draft.selectedCustomer || null,
    discounts: Array.isArray(draft.discounts) ? draft.discounts : [],
    paymentSelection: draft.paymentSelection || null,
    notes: draft.notes || '',
    totals: draft.totals || {},
    sourceDeviceId: draft.sourceDeviceId || getDraftDeviceId(),
    syncVersion: draft.syncVersion || 1,
    metadata: draft.metadata || {},
    updatedAt: draft.updatedAt || now,
    createdAt: draft.createdAt || now,
    syncStatus: draft.syncStatus || 'pending',
  };
};

export const saveDraftLocal = async (draft) => {
  const normalizedDraft = normalizeDraft(draft);

  try {
    const db = await openDraftDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(normalizedDraft);
    await transactionToPromise(transaction);
    db.close();
  } catch (error) {
    const drafts = readFallbackDrafts();
    const nextDrafts = drafts.filter((item) => item.localKey !== normalizedDraft.localKey);
    nextDrafts.push(normalizedDraft);
    writeFallbackDrafts(nextDrafts);
  }

  return normalizedDraft;
};

export const getAllDraftsLocal = async () => {
  try {
    const db = await openDraftDb();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const drafts = await requestToPromise(transaction.objectStore(STORE_NAME).getAll());
    db.close();
    return drafts || [];
  } catch (error) {
    return readFallbackDrafts();
  }
};

export const getDraftsForUserLocal = async (userId, statuses = ['active', 'held']) => {
  const drafts = await getAllDraftsLocal();
  return drafts
    .filter((draft) => draft.userId === userId && statuses.includes(draft.status))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
};

export const getLatestDraftForUserLocal = async (userId, draftTypes = Object.values(DRAFT_TYPES)) => {
  const drafts = await getDraftsForUserLocal(userId);
  return drafts.find((draft) => draftTypes.includes(draft.draftType));
};

export const deleteDraftLocal = async ({ userId, draftType, draftId }) => {
  const localKey = getLocalKey({ userId, draftType, draftId });

  try {
    const db = await openDraftDb();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(localKey);
    await transactionToPromise(transaction);
    db.close();
  } catch (error) {
    writeFallbackDrafts(readFallbackDrafts().filter((draft) => draft.localKey !== localKey));
  }
};

export const saveDraftRemote = async (draft) => {
  const normalizedDraft = normalizeDraft(draft);
  const response = await fetch(`${config.apiUrl}/api/drafts/${normalizedDraft.draftType}/${normalizedDraft.draftId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizedDraft),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Draft sync failed.' }));
    throw new Error(errorData.message || 'Draft sync failed.');
  }

  const data = await response.json();
  return data.draft;
};

export const saveDraft = async (draft) => {
  const localDraft = await saveDraftLocal({ ...draft, updatedAt: new Date().toISOString(), syncStatus: 'pending' });

  if (typeof navigator === 'undefined' || !navigator.onLine) {
    return localDraft;
  }

  try {
    await saveDraftRemote(localDraft);
    return saveDraftLocal({ ...localDraft, syncStatus: 'synced', updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Draft saved locally but failed to sync:', error);
    return saveDraftLocal({ ...localDraft, syncStatus: 'error' });
  }
};

const decorateServerDrafts = (drafts = [], draftType) =>
  drafts.map((draft) =>
    normalizeDraft({
      ...draft,
      draftType,
      userId: String(draft.userId),
      draftId: draft.draftId,
      syncStatus: 'synced',
    })
  );

export const fetchDraftsRemote = async (userId) => {
  const response = await fetch(`${config.apiUrl}/api/drafts/user/${userId}`);

  if (!response.ok) {
    throw new Error('Unable to fetch server drafts.');
  }

  const data = await response.json();
  return [
    ...decorateServerDrafts(data.savedCarts, DRAFT_TYPES.SAVED_CART),
    ...decorateServerDrafts(data.draftSales, DRAFT_TYPES.DRAFT_SALE),
    ...decorateServerDrafts(data.heldOrders, DRAFT_TYPES.HELD_ORDER),
  ].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
};

export const mergeDraftLists = (localDrafts = [], remoteDrafts = []) => {
  const byKey = new Map();

  [...localDrafts, ...remoteDrafts].forEach((draft) => {
    const normalizedDraft = normalizeDraft(draft);
    const existingDraft = byKey.get(normalizedDraft.localKey);
    if (!existingDraft || new Date(normalizedDraft.updatedAt) > new Date(existingDraft.updatedAt)) {
      byKey.set(normalizedDraft.localKey, normalizedDraft);
    }
  });

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );
};

export const syncPendingDrafts = async (userId) => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return [];
  }

  const drafts = await getDraftsForUserLocal(userId, ['active', 'held', 'completed', 'abandoned']);
  const pendingDrafts = drafts.filter((draft) => draft.syncStatus !== 'synced');

  return Promise.allSettled(
    pendingDrafts.map(async (draft) => {
      await saveDraftRemote(draft);
      return saveDraftLocal({ ...draft, syncStatus: 'synced', updatedAt: new Date().toISOString() });
    })
  );
};

export const completeDraft = async ({ userId, draftType, draftId }) => {
  if (!userId || !draftType || !draftId) return;

  await saveDraftLocal({
    userId,
    draftType,
    draftId,
    status: 'completed',
    cartItems: [],
    syncStatus: 'pending',
    metadata: { completedAt: new Date().toISOString() },
  });

  if (typeof navigator === 'undefined' || !navigator.onLine) {
    return;
  }

  try {
    await fetch(`${config.apiUrl}/api/drafts/${draftType}/${draftId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    await deleteDraftLocal({ userId, draftType, draftId });
  } catch (error) {
    console.error('Unable to mark server draft completed:', error);
  }
};
