import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Modal,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { FaBox, FaSearch, FaPlus, FaTimes, FaTags, FaBarcode, FaCheckCircle, FaTrashAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { uploadToCloudinary } from "../config/cloudinary";
import config from '../config';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    price: "",
    quantity: "",
    barcode: "",
    category: "",
    image: "",
  });
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = `${config.apiUrl}/api`;

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === "all"
          ? `${API_BASE_URL}/products`
          : `${API_BASE_URL}/products?category=${selectedCategory}`;

      const response = await axios.get(url);

      const filteredProducts = response.data.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filteredProducts);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setSnackbarMessage("Error fetching products. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
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
        ? { ...product }
        : { name: "", price: "", quantity: "", barcode: "", category: "", image: "" }
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setImage(null);
    setFormValues({ name: "", price: "", quantity: "", barcode: "", category: "", image: "" });
  };

  const handleSubmit = async () => {
    if (!formValues.name || !formValues.price || !formValues.quantity || !formValues.barcode || !formValues.category) {
      setSnackbarMessage("Please fill all the required fields.");
      setSnackbarOpen(true);
      return;
    }

    if (!image && !selectedProduct) {
      setSnackbarMessage("Please upload an image.");
      setSnackbarOpen(true);
      return;
    }

    try {
      let imageUrl = selectedProduct?.image;

      if (image && image instanceof File) {
        imageUrl = await uploadToCloudinary(image);
      }

      const productData = {
        ...formValues,
        image: imageUrl
      };

      if (selectedProduct) {
        await axios.put(
          `${API_BASE_URL}/products/${selectedProduct._id}`,
          productData
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/registerProduct`,
          productData
        );
      }

      setSnackbarMessage("Product saved successfully.");
      setSnackbarOpen(true);
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error.response?.data || error.message);
      setSnackbarMessage(`Error: ${error.response?.data?.message || error.message}`);
      setSnackbarOpen(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading catalog inventory...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800 space-y-6">
      
      {/* Title & Actions Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Products Inventory</h2>
          <p className="text-slate-500 text-sm mt-0.5">Maintain cafe items catalog, pricing list, and stock counts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 focus:border-slate-450 focus:outline-none rounded-lg text-xs bg-white font-semibold transition-all"
          >
            <option value="all">All Categories</option>
            <option value="drinks">Drinks</option>
            <option value="junkfood">Junk Food</option>
            <option value="others">Others</option>
          </select>

          {/* Search bar */}
          <div className="relative max-w-[200px]">
            <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3.5 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-white font-semibold transition-all"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-650 text-white font-bold rounded-lg text-xs transition-all shadow-sm active:scale-97"
          >
            <FaPlus />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Catalog items Cards list Grid */}
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
              <p className="text-slate-450 text-xs max-w-xs mx-auto">There are no items recorded in this category or matching your search.</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all active:scale-95 shadow-sm"
            >
              Add Your First Product
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {products.map((product) => {
              const isOutOfStock = product.quantity === 0;
              return (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  className="bg-white border border-slate-200 hover:border-slate-350 rounded-xl p-4 shadow-sm hover:shadow transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 flex items-center justify-center bg-slate-50">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <FaBox className="text-slate-300 text-lg" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 text-xs truncate block">{product.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase mt-0.5">{product.category}</span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          isOutOfStock ? 'bg-red-50 text-red-650 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : `Qty: ${product.quantity}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                    <span className="font-extrabold text-slate-900 text-sm">₱{Number(product.price).toFixed(2)}</span>
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="px-3 py-1.5 border border-slate-250 hover:border-slate-350 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-all active:scale-97"
                    >
                      Configure Item
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="product-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 420,
            bgcolor: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            p: 4,
            outline: "none",
          }}
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-6">
            <h3 className="font-bold text-slate-900 text-sm" id="product-modal-title">
              {selectedProduct ? "Modify Product Details" : "Register Catalog Item"}
            </h3>
            <button
              onClick={handleCloseModal}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
                        {/* Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block uppercase">Product Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="San Miguel Pale Pilsen"
                value={formValues.name}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
              />
            </div>

            {/* Price & Quantity Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">Price (₱)</label>
                <input
                  type="number"
                  name="price"
                  required
                  placeholder="₱0.00"
                  value={formValues.price}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">Initial Stock</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  placeholder="24"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
            </div>
            {/* Barcode & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase flex items-center gap-1">
                  <FaBarcode />
                  <span>Barcode SKU</span>
                </label>
                <input
                  type="text"
                  name="barcode"
                  required
                  placeholder="480001234567"
                  value={formValues.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">Category</label>
                <select
                  name="category"
                  required
                  value={formValues.category}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                >
                  <option value="">Select...</option>
                  <option value="drinks">Drinks</option>
                  <option value="junkfood">Junk Food</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            {/* File Upload Image */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 block uppercase">Product Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50 transition-all cursor-pointer"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 text-xs font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-650 text-white font-bold rounded-lg text-xs transition-all shadow-sm active:scale-95"
              >
                {selectedProduct ? "Save Changes" : "Create Item"}
              </button>
            </div>

          </form>

        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: "12px", fontSize: "12px", fontWeight: "650" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );
}

export default ProductList;
