import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Modal,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
  Snackbar,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
  Divider,
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { uploadToCloudinary } from "../config/cloudinary";
import { FaBox } from "react-icons/fa";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    setFormValues({ name: "", price: "", quantity: "", barcode: "", category: "", image: "" });
    document.querySelector('input[type="file"]').value = '';
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

      let productResponse;

      if (selectedProduct) {
        productResponse = await axios.put(
          `${API_BASE_URL}/products/${selectedProduct._id}`,
          productData
        );
      } else {
        productResponse = await axios.post(
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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        padding: "30px",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          padding: "30px",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "600",
            marginBottom: "30px",
            background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Product Management
        </Typography>

        <motion.div variants={itemVariants}>
          <TextField
            label="Search Products"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            fullWidth
            size="small"
            sx={{
              maxWidth: isMobile ? "100%" : "400px",
              marginBottom: "24px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </motion.div>

        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12} sx={{ textAlign: "center", padding: "40px" }}>
              <CircularProgress />
            </Grid>
          ) : (
            products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  style={{ height: "100%" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        padding: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <img
                        src={product.image || '/default-avatar.png'}
                        alt={product.name}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "12px",
                          objectFit: "cover",
                          border: "3px solid #1a2a6c",
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "600",
                            color: "#333",
                            marginBottom: "4px",
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666",
                            marginBottom: "8px",
                          }}
                        >
                          {product.category}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: product.quantity > 0 ? "#4caf50" : "#f44336",
                            fontWeight: "500",
                          }}
                        >
                          Stock: {product.quantity}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#1a2a6c",
                            fontWeight: "600",
                          }}
                        >
                          ₱{product.price}
                        </Typography>
                        <Box sx={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => handleOpenModal(product)}
                              sx={{
                                color: "#1a2a6c",
                                "&:hover": {
                                  backgroundColor: "rgba(26, 42, 108, 0.1)",
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        <motion.div variants={itemVariants} style={{ marginTop: "30px", textAlign: "right" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            Add New Product
          </Button>
        </motion.div>

        {/* Add/Edit Product Modal */}
        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="product-modal-title"
          aria-describedby="product-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: isMobile ? "90%" : 400,
              bgcolor: "background.paper",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              p: 4,
            }}
          >
            <Typography
              id="product-modal-title"
              variant="h6"
              component="h2"
              sx={{
                marginBottom: "24px",
                fontWeight: "600",
                color: "#333",
              }}
            >
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </Typography>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Product Name"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Price"
                    name="price"
                    type="number"
                    value={formValues.price}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formValues.quantity}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Barcode"
                    name="barcode"
                    value={formValues.barcode}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formValues.category}
                      onChange={handleInputChange}
                      label="Category"
                      sx={{
                        borderRadius: "12px",
                      }}
                    >
                      <MenuItem value="drinks">Drinks</MenuItem>
                      <MenuItem value="junkfood">Junk Food</MenuItem>
                      <MenuItem value="others">Others</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Upload Product Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "16px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      onClick={handleCloseModal}
                      variant="text"
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {selectedProduct ? "Update" : "Add"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Modal>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </motion.div>
  );
}

export default ProductList;
