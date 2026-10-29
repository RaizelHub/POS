import Product from '../Models/product.js';
import InventoryMovement from '../Models/inventoryMovement.js';
import AuditLog from '../Models/auditLog.js';
import mongoose from 'mongoose';
import { toCents } from '../utils/money.js';
import { buildOrgBranchFilter } from '../utills/orgBranchFilter.js';

/**
 * Register a new product in the store catalog.
 * Validates inputs, enforces branch-scoped barcode/SKU uniqueness,
 * and records initial inventory movement and audit provenance.
 */
export const registerProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      barcode,
      sku,
      category = 'others',
      image,
      costPrice = 0,
      lowStockThreshold = 5,
    } = req.body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedBarcode = typeof barcode === 'string' ? barcode.trim() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim().toLowerCase() : 'others';
    const numPrice = Number(price);
    const numCostPrice = Number(costPrice);
    const numQuantity = Number(quantity);
    const numLowStock = Number(lowStockThreshold);

    // Validation checks
    if (!trimmedName || trimmedName.length > 100) {
      return res.status(400).json({ message: 'Product name is required (max 100 characters).' });
    }

    if (!trimmedBarcode || trimmedBarcode.length > 50) {
      return res.status(400).json({ message: 'Barcode is required (max 50 characters).' });
    }

    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number greater than 0.' });
    }

    if (!Number.isFinite(numCostPrice) || numCostPrice < 0) {
      return res.status(400).json({ message: 'Cost price must be a non-negative number.' });
    }

    if (!Number.isInteger(numQuantity) || numQuantity < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a non-negative whole integer.' });
    }

    if (!image || typeof image !== 'string' || !image.trim()) {
      return res.status(400).json({ message: 'A valid product image URL is required.' });
    }

    const orgBranch = buildOrgBranchFilter(req.auth);

    // Check for duplicate barcode within organization and branch
    const existingBarcodeProduct = await Product.findOne({
      ...orgBranch,
      barcode: trimmedBarcode,
      isActive: { $ne: false },
    });
    if (existingBarcodeProduct) {
      return res.status(400).json({ message: 'A product with this barcode already exists in this branch.' });
    }

    // Handle SKU generation or uniqueness check
    let uniqueSku = sku ? String(sku).trim() : `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    if (sku) {
      const existingSkuProduct = await Product.findOne({
        ...orgBranch,
        sku: uniqueSku,
        isActive: { $ne: false },
      });
      if (existingSkuProduct) {
        return res.status(400).json({ message: 'A product with this SKU already exists in this branch.' });
      }
    } else {
      while (await Product.findOne({ ...orgBranch, sku: uniqueSku })) {
        uniqueSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
    }

    const priceCents = toCents(numPrice);
    const costPriceCents = toCents(numCostPrice);

    // Save new product
    const newProduct = new Product({
      name: trimmedName,
      price: numPrice,
      priceCents,
      costPrice: numCostPrice,
      costPriceCents,
      quantity: numQuantity,
      barcode: trimmedBarcode,
      sku: uniqueSku,
      category: trimmedCategory || 'others',
      lowStockThreshold: Number.isInteger(numLowStock) && numLowStock >= 0 ? numLowStock : 5,
      image: image.trim(),
      organizationId: req.auth?.organizationId || 'default',
      branchId: req.auth?.branchId || 'main',
      isActive: true,
    });

    const product = await newProduct.save();

    // Log initial inventory movement if initial quantity was provided
    if (numQuantity > 0) {
      await InventoryMovement.create({
        organizationId: product.organizationId,
        branchId: product.branchId,
        productId: product._id,
        type: 'receiving',
        quantityDelta: numQuantity,
        resultingQuantity: numQuantity,
        reason: 'Initial inventory on product registration',
        referenceType: 'product-registration',
        referenceId: product._id.toString(),
        performedBy: req.auth?.userId || new mongoose.Types.ObjectId(),
        unitCostCents: costPriceCents,
      }).catch((err) => console.error('Error logging initial inventory movement:', err));
    }

    // Audit log
    await AuditLog.create({
      organizationId: product.organizationId,
      branchId: product.branchId,
      actorId: req.auth?.userId || new mongoose.Types.ObjectId(),
      action: 'product.created',
      entityType: 'product',
      entityId: product._id.toString(),
      summary: `Registered product ${product.name} with ${numQuantity} initial units`,
      metadata: { barcode: product.barcode, sku: product.sku, price: numPrice, quantity: numQuantity },
      ipAddress: req.ip,
    }).catch((err) => console.error('Error logging product creation audit:', err));

    return res.status(201).json({
      message: 'Product registered successfully!',
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        costPrice: product.costPrice,
        quantity: product.quantity,
        barcode: product.barcode,
        sku: product.sku,
        category: product.category,
        lowStockThreshold: product.lowStockThreshold,
        image: product.image,
      },
    });
  } catch (error) {
    console.error('Error during product registration:', error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'A product with duplicate barcode or SKU already exists.' });
    }
    return res.status(500).json({ message: 'Internal server error while registering product.' });
  }
};

/**
 * Get catalog products with search, category filtering, low stock filtering,
 * sorting, and bounded pagination.
 */
export const getProduct = async (req, res) => {
  try {
    const {
      category,
      search,
      stockStatus,
      sortBy = 'name',
      sortOrder = 'asc',
      page,
      limit,
      paginated,
    } = req.query;

    const filter = {
      ...buildOrgBranchFilter(req.auth),
      isActive: { $ne: false },
    };

    if (category && category !== 'all') {
      filter.category = String(category).trim().toLowerCase();
    }

    if (search && String(search).trim()) {
      const sanitized = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { barcode: { $regex: sanitized, $options: 'i' } },
        { sku: { $regex: sanitized, $options: 'i' } },
      ];
    }

    if (stockStatus === 'out') {
      filter.quantity = { $lte: 0 };
    } else if (stockStatus === 'low') {
      filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    } else if (stockStatus === 'in') {
      filter.$expr = { $gt: ['$quantity', '$lowStockThreshold'] };
    }

    // Determine sort
    const order = sortOrder === 'desc' ? -1 : 1;
    const sort = {};
    if (['name', 'price', 'quantity', 'createdAt'].includes(sortBy)) {
      sort[sortBy] = order;
    } else {
      sort.name = 1;
    }

    const isPaginated = paginated === 'true' || page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(Math.max(1, Number(limit) || 20), 100);

    if (isPaginated) {
      const [total, products] = await Promise.all([
        Product.countDocuments(filter),
        Product.find(filter)
          .sort(sort)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean(),
      ]);

      const totalPages = Math.ceil(total / limitNum) || 1;

      res.setHeader('X-Total-Count', total);
      res.setHeader('X-Page', pageNum);
      res.setHeader('X-Total-Pages', totalPages);

      return res.status(200).json({
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
        },
      });
    }

    // Unpaginated response (capped at 500 for safety against OOM)
    const products = await Product.find(filter).sort(sort).limit(500).lean();
    res.setHeader('X-Total-Count', products.length);
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: `Error fetching products: ${error.message}` });
  }
};

/**
 * Get product by ID with ObjectId validation.
 */
export const getProductbyId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format.' });
    }

    const product = await Product.findOne({
      _id: id,
      ...buildOrgBranchFilter(req.auth),
      isActive: { $ne: false },
    }).lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get product by Barcode.
 */
export const getProductByBarcode = async (req, res) => {
  try {
    const barcode = req.params.barcode ? String(req.params.barcode).trim() : '';
    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required.' });
    }

    const product = await Product.findOne({
      barcode,
      ...buildOrgBranchFilter(req.auth),
      isActive: { $ne: false },
    }).lean();

    if (!product) {
      return res.status(404).json({ message: 'No active product found with this barcode.' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update product by ID.
 * Validates inputs, handles price/cost in cents, prevents duplicate barcode/SKU collisions,
 * and records stock adjustments in the inventory movement log.
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format.' });
    }

    const orgBranch = buildOrgBranchFilter(req.auth);
    const existing = await Product.findOne({ _id: id, ...orgBranch });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found in this branch.' });
    }

    const allowedFields = [
      'name', 'price', 'costPrice', 'quantity', 'category', 'lowStockThreshold',
      'barcode', 'sku', 'image', 'isActive',
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Validation
    if (updates.name !== undefined) {
      const trimmed = String(updates.name).trim();
      if (!trimmed || trimmed.length > 100) {
        return res.status(400).json({ message: 'Product name must be between 1 and 100 characters.' });
      }
      updates.name = trimmed;
    }

    if (updates.price !== undefined) {
      const p = Number(updates.price);
      if (!Number.isFinite(p) || p <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number greater than 0.' });
      }
      updates.price = p;
      updates.priceCents = toCents(p);
    }

    if (updates.costPrice !== undefined) {
      const c = Number(updates.costPrice);
      if (!Number.isFinite(c) || c < 0) {
        return res.status(400).json({ message: 'Cost price must be a non-negative number.' });
      }
      updates.costPrice = c;
      updates.costPriceCents = toCents(c);
    }

    let quantityDelta = 0;
    if (updates.quantity !== undefined) {
      const q = Number(updates.quantity);
      if (!Number.isInteger(q) || q < 0) {
        return res.status(400).json({ message: 'Quantity must be a non-negative whole integer.' });
      }
      quantityDelta = q - existing.quantity;
      updates.quantity = q;
    }

    if (updates.lowStockThreshold !== undefined) {
      const t = Number(updates.lowStockThreshold);
      if (!Number.isInteger(t) || t < 0) {
        return res.status(400).json({ message: 'Low stock threshold must be a non-negative whole integer.' });
      }
      updates.lowStockThreshold = t;
    }

    if (updates.barcode !== undefined) {
      const b = String(updates.barcode).trim();
      if (!b) return res.status(400).json({ message: 'Barcode cannot be empty.' });
      if (b !== existing.barcode) {
        const barcodeConflict = await Product.findOne({
          ...orgBranch,
          barcode: b,
          _id: { $ne: id },
          isActive: { $ne: false },
        });
        if (barcodeConflict) {
          return res.status(400).json({ message: 'Barcode is already assigned to another product in this branch.' });
        }
      }
      updates.barcode = b;
    }

    if (updates.sku !== undefined) {
      const s = String(updates.sku).trim();
      if (s && s !== existing.sku) {
        const skuConflict = await Product.findOne({
          ...orgBranch,
          sku: s,
          _id: { $ne: id },
          isActive: { $ne: false },
        });
        if (skuConflict) {
          return res.status(400).json({ message: 'SKU is already assigned to another product in this branch.' });
        }
      }
      updates.sku = s;
    }

    if (updates.category !== undefined) {
      updates.category = String(updates.category).trim().toLowerCase() || 'others';
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, ...orgBranch },
      updates,
      { new: true }
    );

    // If stock quantity manually changed, record inventory adjustment
    if (quantityDelta !== 0) {
      await InventoryMovement.create({
        organizationId: updatedProduct.organizationId,
        branchId: updatedProduct.branchId,
        productId: updatedProduct._id,
        type: 'adjustment',
        quantityDelta,
        resultingQuantity: updatedProduct.quantity,
        reason: 'Manual quantity update via product editor',
        referenceType: 'product-update',
        referenceId: updatedProduct._id.toString(),
        performedBy: req.auth?.userId || new mongoose.Types.ObjectId(),
        unitCostCents: updatedProduct.costPriceCents || 0,
      }).catch((err) => console.error('Error logging inventory movement on product update:', err));
    }

    await AuditLog.create({
      organizationId: updatedProduct.organizationId,
      branchId: updatedProduct.branchId,
      actorId: req.auth?.userId || new mongoose.Types.ObjectId(),
      action: 'product.updated',
      entityType: 'product',
      entityId: updatedProduct._id.toString(),
      summary: `Updated product ${updatedProduct.name}`,
      metadata: { fields: Object.keys(updates), quantityDelta },
      ipAddress: req.ip,
    }).catch((err) => console.error('Error logging product update audit:', err));

    return res.status(200).json({
      message: 'Product updated successfully!',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'A product with duplicate barcode or SKU already exists.' });
    }
    return res.status(500).json({ message: `Error updating product: ${error.message}` });
  }
};

/**
 * Soft-delete product by ID.
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID format.' });
    }

    const orgBranch = buildOrgBranchFilter(req.auth);
    const deletedProduct = await Product.findOneAndUpdate(
      { _id: id, ...orgBranch },
      { isActive: false },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found in this branch.' });
    }

    await AuditLog.create({
      organizationId: deletedProduct.organizationId,
      branchId: deletedProduct.branchId,
      actorId: req.auth?.userId || new mongoose.Types.ObjectId(),
      action: 'product.deactivated',
      entityType: 'product',
      entityId: deletedProduct._id.toString(),
      summary: `Deactivated product ${deletedProduct.name}`,
      ipAddress: req.ip,
    }).catch((err) => console.error('Error logging product deactivation audit:', err));

    return res.status(200).json({ message: 'Product deactivated successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: `Error deactivating product: ${error.message}` });
  }
};

/**
 * Authoritative low-stock products endpoint.
 */
export const getLowStockProducts = async (req, res) => {
  try {
    const lowStockItems = await Product.find({
      ...buildOrgBranchFilter(req.auth),
      isActive: { $ne: false },
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    })
      .sort({ quantity: 1, name: 1 })
      .lean();

    return res.status(200).json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return res.status(500).json({ message: 'Could not fetch low stock products.', error: error.message });
  }
};
