import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { draftModels } from '../Models/draftOrder.js';

const draftTypeAliases = {
  savedCart: 'savedCart',
  savedCarts: 'savedCart',
  'saved-cart': 'savedCart',
  'saved-carts': 'savedCart',
  draftSale: 'draftSale',
  draftSales: 'draftSale',
  'draft-sale': 'draftSale',
  'draft-sales': 'draftSale',
  heldOrder: 'heldOrder',
  heldOrders: 'heldOrder',
  'held-order': 'heldOrder',
  'held-orders': 'heldOrder',
};

const normalizeDraftType = (draftType) => draftTypeAliases[draftType] || null;

const getDraftModel = (draftType) => {
  const normalizedType = normalizeDraftType(draftType);
  return normalizedType ? { Model: draftModels[normalizedType], normalizedType } : {};
};

const toObjectId = (id) => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

const normalizeCartItems = (cartItems = []) => {
  if (!Array.isArray(cartItems)) return [];

  return cartItems.map((item) => {
    const product = item.product || {};
    const productId = item.productId || product._id || product.id;
    const price = Number(item.price ?? product.price ?? 0);
    const quantity = Math.max(Number(item.quantity || 1), 1);

    return {
      ...item,
      productId: toObjectId(productId),
      product,
      name: item.name || product.name || 'Unnamed Product',
      price,
      quantity,
      totalPrice: Number(item.totalPrice ?? price * quantity),
    };
  });
};

const buildDraftPayload = (req, normalizedType) => {
  const body = req.body || {};
  const userId = toObjectId(body.userId || req.params.userId);

  if (!userId) {
    return { error: 'Valid userId is required.' };
  }

  const fallbackStatus = normalizedType === 'heldOrder' ? 'held' : 'active';
  const cartItems = normalizeCartItems(body.cartItems || body.cart || []);

  return {
    draftId: body.draftId || req.params.draftId || uuidv4(),
    userId,
    cashierId: toObjectId(body.cashierId) || userId,
    status: body.status || fallbackStatus,
    cartItems,
    selectedCustomer: body.selectedCustomer ?? null,
    discounts: Array.isArray(body.discounts) ? body.discounts : [],
    paymentSelection: body.paymentSelection ?? null,
    notes: body.notes || '',
    totals: body.totals || {},
    sourceDeviceId: body.sourceDeviceId || '',
    syncVersion: Number(body.syncVersion || 1),
    metadata: body.metadata || {},
    lastClientUpdatedAt: body.updatedAt ? new Date(body.updatedAt) : new Date(),
  };
};

export const upsertDraft = async (req, res) => {
  const { Model, normalizedType } = getDraftModel(req.params.draftType || req.body?.draftType);

  if (!Model) {
    return res.status(400).json({ message: 'Invalid draft type.' });
  }

  const payload = buildDraftPayload(req, normalizedType);
  if (payload.error) {
    return res.status(400).json({ message: payload.error });
  }

  try {
    const draft = await Model.findOneAndUpdate(
      { userId: payload.userId, draftId: payload.draftId },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Draft saved successfully.', draft, draftType: normalizedType });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Error saving draft.', error: error.message });
  }
};

export const getDraftsForUser = async (req, res) => {
  const { Model, normalizedType } = getDraftModel(req.params.draftType);
  const userId = toObjectId(req.params.userId);

  if (!Model) {
    return res.status(400).json({ message: 'Invalid draft type.' });
  }

  if (!userId) {
    return res.status(400).json({ message: 'Valid userId is required.' });
  }

  try {
    const statusFilter = req.query.status || ['active', 'held'];
    const statuses = Array.isArray(statusFilter) ? statusFilter : String(statusFilter).split(',');
    const drafts = await Model.find({ userId, status: { $in: statuses } }).sort({ updatedAt: -1 });

    res.status(200).json({ drafts, draftType: normalizedType });
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ message: 'Error fetching drafts.', error: error.message });
  }
};

export const getAllDraftsForUser = async (req, res) => {
  const userId = toObjectId(req.params.userId);

  if (!userId) {
    return res.status(400).json({ message: 'Valid userId is required.' });
  }

  try {
    const [savedCarts, draftSales, heldOrders] = await Promise.all([
      draftModels.savedCart.find({ userId, status: { $in: ['active', 'held'] } }).sort({ updatedAt: -1 }),
      draftModels.draftSale.find({ userId, status: { $in: ['active', 'held'] } }).sort({ updatedAt: -1 }),
      draftModels.heldOrder.find({ userId, status: { $in: ['active', 'held'] } }).sort({ updatedAt: -1 }),
    ]);

    res.status(200).json({ savedCarts, draftSales, heldOrders });
  } catch (error) {
    console.error('Error fetching all drafts:', error);
    res.status(500).json({ message: 'Error fetching drafts.', error: error.message });
  }
};

export const completeDraft = async (req, res) => {
  const { Model, normalizedType } = getDraftModel(req.params.draftType);
  const userId = toObjectId(req.body?.userId || req.params.userId);

  if (!Model) {
    return res.status(400).json({ message: 'Invalid draft type.' });
  }

  if (!userId || !req.params.draftId) {
    return res.status(400).json({ message: 'Valid userId and draftId are required.' });
  }

  try {
    const draft = await Model.findOneAndUpdate(
      { userId, draftId: req.params.draftId },
      { $set: { status: 'completed', metadata: { completedAt: new Date() } } },
      { new: true }
    );

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found.' });
    }

    res.status(200).json({ message: 'Draft completed successfully.', draft, draftType: normalizedType });
  } catch (error) {
    console.error('Error completing draft:', error);
    res.status(500).json({ message: 'Error completing draft.', error: error.message });
  }
};

export const deleteDraft = async (req, res) => {
  const { Model, normalizedType } = getDraftModel(req.params.draftType);
  const userId = toObjectId(req.params.userId);

  if (!Model) {
    return res.status(400).json({ message: 'Invalid draft type.' });
  }

  if (!userId || !req.params.draftId) {
    return res.status(400).json({ message: 'Valid userId and draftId are required.' });
  }

  try {
    const draft = await Model.findOneAndDelete({ userId, draftId: req.params.draftId });

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found.' });
    }

    res.status(200).json({ message: 'Draft deleted successfully.', draftType: normalizedType });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ message: 'Error deleting draft.', error: error.message });
  }
};
