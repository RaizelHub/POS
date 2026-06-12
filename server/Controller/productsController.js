import Product from '../Models/product.js';
import path from 'path';
import mongoose from 'mongoose';

// Register a new product
export const registerProduct = async (req, res) => {
  try {
    const { name, price, quantity, barcode, sku, category, image } = req.body;

    // Validation checks
    if (!name || !price || !quantity || !barcode || !category || !image) {
      return res.status(400).json({ message: 'Please provide name, price, quantity, barcode, category, and image.' });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number.' });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    // Check for duplicate barcode
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) {
      return res.status(400).json({ message: 'A product with this barcode already exists.' });
    }

    // Handle SKU generation if not provided
    let uniqueSku = sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let existingSkuProduct = await Product.findOne({ sku: uniqueSku });
    while (existingSkuProduct) {
      uniqueSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      existingSkuProduct = await Product.findOne({ sku: uniqueSku });
    }

    // Save new product
    const newProduct = new Product({
      name,
      price,
      quantity,
      barcode,
      category,
      sku: uniqueSku,
      image, // This is now the Cloudinary URL
    });

    const product = await newProduct.save();

    res.status(201).json({
      message: 'Product registered successfully!',
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        barcode: product.barcode,
        category: product.category,
        image: product.image || null,  // Cloudinary URL
      },
    });
  } catch (error) {
    console.error('Error registering product:', error);
    res.status(500).json({ message: `Error registering product: ${error.message}` });
  }
};

// Get all products
export const getProduct = async (req, res) => {
  try {
    const { category } = req.query;

    let filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: `Error fetching products: ${error.message}` });
  }
};

// Get product by ID
export const getProductbyId = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: `Error fetching product: ${error.message}` });
  }
};

// Get product by barcode
export const getProductByBarcode = async (req, res) => {
  try {
    const barcode = req.params.barcode.trim();
    console.log('Searching product with barcode:', barcode);

    const product = await Product.findOne({ barcode });

    if (!product) {
      console.log('No product found for barcode:', barcode);
      return res.status(404).json({ message: 'Product not found!' });
    }

    console.log('Product retrieved successfully:', product);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update product by ID
// Assuming the model file is named this way

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProductData = { ...req.body }; // image is now a URL

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedProductData, {
      new: true,
    });

    if (!updatedProduct) return res.status(404).json({ message: 'Failed to update product.' });

    res.status(200).json({
      message: 'Product updated successfully!',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: `Error updating product: ${error.message}` });
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error deleting product: ${error.message}` });
  }
};

// Decrease product quantity after a purchase
export const decrementProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity value. It must be greater than 0.' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity === 0) {
      return res.status(400).json({
        message: `Product "${product.name}" is not available. Stock is 0.`,
      });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        message: `Not enough stock available. Current stock: ${product.quantity}`,
      });
    }

    product.quantity -= quantity;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: 'Product quantity updated successfully!',
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: `Error updating product quantity: ${error.message}` });
  }
};
export const deleteAllProducts = async (req, res) => {
  try {
    // Delete all products from the database
    const result = await Product.deleteMany({});

    // Check if any products were deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No products found to delete." });
    }

    // Send success response
    return res.status(200).json({
      message: `${result.deletedCount} products deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting products:", error);
    return res.status(500).json({ message: "Server error, could not delete products." });
  }
};