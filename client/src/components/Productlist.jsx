import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Modal,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaBox, FaSearch, FaPlus, FaTimes, FaBarcode, FaTrashAlt, FaRedo, FaThLarge, FaList } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import api from '../utils/api';
import { uploadToCloudinary } from "../config/cloudinary";
import config from '../config';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
  const [formValues, setFormValues] = useState({
    name: "",
    price: "",
    costPrice: "",
    quantity: "",
    barcode: "",
    sku: "",
    category: "others",
    lowStockThreshold: 5,
    image: "",
  });
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const debounceTimerRef = useRef(null);
  const API_BASE_URL = `${config.apiUrl}/api`;

  // Debounce search query (300ms)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await api.get(`${API_BASE_URL}/products${queryString}`);

      const data = Array.isArray(response.data) ? response.data : response.data.products || [];
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      const msg = error.response?.data?.message || "Failed to load products. Check network or permissions.";
      setFetchError(msg);
      setSnackbarMessage(msg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleOpenModal = (product = null) => {
    setSelectedProduct(product);
    setFormValues(
      product
        ? {
            name: product.name || "",
            price: product.price ?? "",
            costPrice: product.costPrice ?? "",
            quantity: product.quantity ?? "",
            barcode: product.barcode || "",
            sku: product.sku || "",
            category: product.category || "others",
            lowStockThreshold: product.lowStockThreshold ?? 5,
            image: product.image || "",
          }
        : {
            name: "",
            price: "",
            costPrice: "",
            quantity: "",
            barcode: "",
            sku: "",
            category: "others",
            lowStockThreshold: 5,
            image: "",
          }
    );
    setImage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!formValues.name?.trim() || !formValues.price || formValues.quantity === "" || !formValues.barcode?.trim()) {
      setSnackbarMessage("Please fill in all required fields (Name, Price, Quantity, Barcode).");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!image && !selectedProduct && !formValues.image) {
      setSnackbarMessage("Please upload a product photo or provide an image URL.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = formValues.image || selectedProduct?.image || "";

      if (image && image instanceof File) {
        imageUrl = await uploadToCloudinary(image);
      }

      const productData = {
        name: formValues.name.trim(),
        price: Number(formValues.price),
        costPrice: Number(formValues.costPrice || 0),
        quantity: Number(formValues.quantity),
        barcode: formValues.barcode.trim(),
        sku: formValues.sku?.trim() || undefined,
        category: (formValues.category || "others").trim().toLowerCase(),
        lowStockThreshold: Number(formValues.lowStockThreshold || 5),
        image: imageUrl || "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      };

      if (selectedProduct) {
        await api.put(`${API_BASE_URL}/products/${selectedProduct._id}`, productData);
        setSnackbarMessage("Product updated successfully.");
      } else {
        await api.post(`${API_BASE_URL}/registerProduct`, productData);
        setSnackbarMessage("Product registered successfully.");
      }

      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      const msg = error.response?.data?.message || error.message || "Failed to save product.";
      setSnackbarMessage(`Error: ${msg}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to deactivate this product from the catalog?")) {
      return;
    }
    try {
      setSubmitting(true);
      await api.delete(`${API_BASE_URL}/products/${productId}`);
      setSnackbarMessage("Product deactivated successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      const msg = error.response?.data?.message || "Failed to delete product.";
      setSnackbarMessage(`Error: ${msg}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="w-full font-sans text-slate-800 space-y-6">
      {/* Title & Actions Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Inventory & Catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Product Management</h2>
          <p className="text-slate-500 text-sm mt-1">Configure pricing, barcodes, reorder thresholds, and active stock.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter dropdown */}
          <select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-lg text-xs bg-white font-semibold transition-all shadow-sm"
          >
            <option value="all">All Categories</option>
            <option value="beverages">Beverages / Drinks</option>
            <option value="snacks">Snacks & Confectionery</option>
            <option value="grocery">Grocery & Canned Goods</option>
            <option value="dairy">Dairy & Bakery</option>
            <option value="others">Others / General</option>
          </select>

          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search name, barcode, SKU…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:border-emerald-600 focus:outline-none rounded-lg text-xs bg-white font-medium transition-all shadow-sm"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-2 rounded text-xs transition-colors ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <FaList size={12} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded text-xs transition-colors ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <FaThLarge size={12} />
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all shadow-sm active:scale-95"
          >
            <FaPlus size={11} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center justify-between text-xs">
          <span>{fetchError}</span>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-1.5 bg-white border border-rose-300 px-2.5 py-1 rounded text-rose-700 font-semibold hover:bg-rose-100"
          >
            <FaRedo size={10} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading catalog items…</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white border border-slate-200 rounded-xl space-y-4"
            >
              <FaBox className="text-4xl text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">No Products Found</h4>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  {debouncedSearch || selectedCategory !== "all"
                    ? "No products match your active search or category filters."
                    : "Your catalog is empty. Register your first product to begin selling."}
                </p>
              </div>
              <button
                onClick={() => (debouncedSearch || selectedCategory !== "all" ? (setSearchQuery(""), setSelectedCategory("all")) : handleOpenModal())}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-all shadow-sm active:scale-95"
              >
                {debouncedSearch || selectedCategory !== "all" ? "Clear Filters" : "Add Your First Product"}
              </button>
            </motion.div>
          ) : viewMode === "table" ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">Barcode / SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Cost Price</th>
                      <th className="py-3 px-4 text-right">Selling Price</th>
                      <th className="py-3 px-4 text-center">Margin</th>
                      <th className="py-3 px-4 text-center">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                      const isOutOfStock = product.quantity <= 0;
                      const isLowStock = !isOutOfStock && product.quantity <= (product.lowStockThreshold || 5);
                      const margin = (product.price && product.costPrice && Number(product.price) > 0)
                        ? (((Number(product.price) - Number(product.costPrice)) / Number(product.price)) * 100).toFixed(1)
                        : null;

                      return (
                        <tr key={product._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <FaBox className="text-slate-300 text-xs" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block truncate max-w-[200px]">{product.name}</span>
                              {product.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{product.barcode || "—"}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                              {product.category || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {product.costPrice !== undefined && product.costPrice !== null ? `₱${Number(product.costPrice).toFixed(2)}` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            ₱{Number(product.price).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {margin !== null ? (
                              <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${Number(margin) >= 20 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                {margin}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isOutOfStock
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : isLowStock
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {isOutOfStock ? "Out of Stock" : isLowStock ? `${product.quantity} left` : `${product.quantity} units`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleOpenModal(product)}
                              className="px-2.5 py-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded text-xs transition-colors"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {products.map((product) => {
                const isOutOfStock = product.quantity <= 0;
                const isLowStock = !isOutOfStock && product.quantity <= (product.lowStockThreshold || 5);

                return (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-sm hover:shadow transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-full h-36 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50 relative">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaBox className="text-slate-300 text-3xl" />
                        )}
                        <span
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full font-bold text-[10px] shadow-sm ${
                            isOutOfStock
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isLowStock
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : isLowStock ? `Low: ${product.quantity} left` : `Stock: ${product.quantity}`}
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-900 text-sm truncate block" title={product.name}>
                          {product.name}
                        </span>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span className="uppercase font-semibold tracking-wider">{product.category || "General"}</span>
                          <span className="font-mono">{product.barcode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Retail Price</p>
                        <p className="font-bold text-slate-900 text-base">₱{Number(product.price).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-all active:scale-95"
                      >
                        Edit
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Product Add / Edit Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal} aria-labelledby="product-modal-title">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "92%",
            maxWidth: 460,
            bgcolor: "white",
            borderRadius: "16px",
            boxShadow: "0 18px 50px rgba(15, 23, 42, 0.16)",
            p: 3.5,
            outline: "none",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-5">
            <h3 className="font-bold text-slate-900 text-base" id="product-modal-title">
              {selectedProduct ? "Edit Product Details" : "Register Catalog Product"}
            </h3>
            <button
              onClick={handleCloseModal}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <FaTimes size={13} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                maxLength={100}
                placeholder="e.g. San Miguel Pale Pilsen 330ml"
                value={formValues.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Selling Price (₱) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="price"
                  required
                  placeholder="₱0.00"
                  value={formValues.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Cost Price (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="costPrice"
                  placeholder="₱0.00"
                  value={formValues.costPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Estimated Margin Indicator */}
            {formValues.price && Number(formValues.price) > 0 && formValues.costPrice !== "" && Number(formValues.costPrice) >= 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-800">Gross Margin:</span>
                <span className="font-mono font-bold text-emerald-900">
                  {(((Number(formValues.price) - Number(formValues.costPrice)) / Number(formValues.price)) * 100).toFixed(1)}%
                  <span className="text-[10px] text-emerald-700 ml-1.5 font-normal">
                    (+₱{(Number(formValues.price) - Number(formValues.costPrice)).toFixed(2)}/unit)
                  </span>
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Stock Units *</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="quantity"
                  required
                  placeholder="0"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Low Stock Alert Min</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="lowStockThreshold"
                  placeholder="5"
                  value={formValues.lowStockThreshold}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase flex items-center gap-1">
                  <FaBarcode /> Barcode *
                </label>
                <input
                  type="text"
                  name="barcode"
                  required
                  maxLength={50}
                  placeholder="480001234567"
                  value={formValues.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-medium font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block uppercase">Category</label>
                <select
                  name="category"
                  value={formValues.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-emerald-600 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-medium"
                >
                  <option value="beverages">Beverages / Drinks</option>
                  <option value="snacks">Snacks & Confectionery</option>
                  <option value="grocery">Grocery & Canned Goods</option>
                  <option value="dairy">Dairy & Bakery</option>
                  <option value="others">Others / General</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">Product Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {selectedProduct ? (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDelete(selectedProduct._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-650 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <FaTrashAlt size={11} />
                  <span>Deactivate</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCloseModal}
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving…" : selectedProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </div>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ProductList;
