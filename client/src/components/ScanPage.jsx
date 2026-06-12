import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { Grid, Badge } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';
import {
  Box,
  Button,
  Typography,
  Modal,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  FaUserCircle,
  FaEdit,
  FaBarcode,
  FaSignOutAlt,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaMinus,
} from 'react-icons/fa';
import {
  completeDraft,
  createActiveDraftId,
  createDraftId,
  DRAFT_TYPES,
  fetchDraftsRemote,
  getDraftsForUserLocal,
  mergeDraftLists,
  saveDraft,
  saveDraftLocal,
  syncPendingDrafts,
} from '../utils/draftStorage';

function ScanPage() {
  const [user, setUser] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [paidItems, setPaidItems] = useState([]);
  const [payLaterItems, setPayLaterItems] = useState([]);
  const [selectedPayLaterItem, setSelectedPayLaterItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [restoreDrafts, setRestoreDrafts] = useState([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const cartRecoveryReadyRef = useRef(false);
  const cartSaveTimerRef = useRef(null);

  // Fetch user data and transactions
  const fetchUserData = async () => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      console.error('No user data found in localStorage');
      navigate('/login-selection');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch transactions from the API after user data is set
      await fetchTransactions(parsedUser._id);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login-selection');
    }
  };

  const fetchTransactions = async (userId) => {
    setLoading(true); // Set loading state to true while fetching data

    try {
      const response = await fetch(`${config.apiUrl}/api/${userId}/transactions`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      console.log('Fetched Transactions:', data); // Debug log for transactions

      if (data?.paid && data?.payLater) {
        // Filter the products based on paymentStatus
        const paidItems = data.paid.filter(item => item.paymentStatus === 'Paid');
        const payLaterItems = data.payLater.filter(item => item.paymentStatus === 'Pay Later');

        setPaidItems(paidItems);
        setPayLaterItems(payLaterItems);
      } else {
        console.error('Invalid response structure:', data);
        setPaidItems([]);
        setPayLaterItems([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setPaidItems([]);
      setPayLaterItems([]);
    } finally {
      setLoading(false); // Set loading to false after the data fetch is done
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login-selection');
      return;
    }

    if (user) {
      // Fetch transactions only if the user exists
      fetchTransactions(user._id);
      fetchAvailableProducts();
    } else {
      // Fetch user data to populate the user state
      fetchUserData();
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user?._id) return;

    let isCancelled = false;

    const loadRecoverableDrafts = async () => {
      try {
        const localDrafts = await getDraftsForUserLocal(user._id);
        let remoteDrafts = [];

        if (navigator.onLine) {
          try {
            remoteDrafts = await fetchDraftsRemote(user._id);
            await Promise.all(remoteDrafts.map((draft) => saveDraftLocal(draft)));
            await syncPendingDrafts(user._id);
          } catch (error) {
            console.error('Unable to fetch server drafts:', error);
          }
        }

        const drafts = mergeDraftLists(localDrafts, remoteDrafts).filter(
          (draft) => (draft.cartItems || []).length > 0
        );

        if (!isCancelled && drafts.length > 0 && cart.length === 0) {
          setRestoreDrafts(drafts);
          setShowRestoreModal(true);
        }
      } catch (error) {
        console.error('Unable to load recoverable drafts:', error);
      } finally {
        cartRecoveryReadyRef.current = true;
      }
    };

    const handleOnline = () => {
      syncPendingDrafts(user._id).catch((error) => console.error('Unable to sync drafts:', error));
    };

    loadRecoverableDrafts();
    window.addEventListener('online', handleOnline);

    return () => {
      isCancelled = true;
      window.removeEventListener('online', handleOnline);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || !cartRecoveryReadyRef.current || cart.length === 0) return;

    if (cartSaveTimerRef.current) {
      clearTimeout(cartSaveTimerRef.current);
    }

    cartSaveTimerRef.current = setTimeout(() => {
      saveDraft({
        userId: user._id,
        draftType: DRAFT_TYPES.SAVED_CART,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.SAVED_CART),
        cartItems: cart,
        totals: {
          subtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
          itemCount: cart.reduce((total, item) => total + item.quantity, 0),
        },
        metadata: { source: 'scan-page-auto-save' },
      }).catch((error) => console.error('Unable to auto-save cart:', error));
    }, 500);

    return () => {
      if (cartSaveTimerRef.current) {
        clearTimeout(cartSaveTimerRef.current);
      }
    };
  }, [cart, user?._id]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchProductDetails();
    }
  };



  const handleScanClick = () => {
    setShowScanner(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setShowScanner(false);
  };

  const fetchProductDetails = async () => {
    const trimmedBarcode = barcode.trim();

    if (!trimmedBarcode) {
      setError('Please scan or enter a valid barcode.');
      return;
    }

    console.log('Attempting to fetch product with barcode:', trimmedBarcode);

    try {
      const response = await fetch(`${config.apiUrl}/api/products/barcode/${encodeURIComponent(trimmedBarcode)}`);

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Product not found!');
      }

      const product = await response.json();
      console.log('Successfully fetched product:', product);

      // Check if product is in stock
      if (product.quantity <= 0) {
        setError(`${product.name} is out of stock.`);
        return;
      }

      // Add product to cart with quantity 1
      addToCart(product);

      // Show enhanced success message with price
      setSnackbarMessage(`${product.name} (₱${product.price.toFixed(2)}) added to cart!`);
      setSnackbarOpen(true);
      setError('');
    } catch (error) {
      console.error('Error fetching product:', error);
      const errorMessage = error.message || 'Failed to fetch product details. Please try again.';
      setError(errorMessage);

      // Show error in snackbar
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarOpen(true);
    } finally {
      setBarcode('');
      setShowScanner(false);
    }
  };

  // Function to add product to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      // Check if product is already in cart
      const existingProductIndex = prevCart.findIndex(item => item.product._id === product._id);

      if (existingProductIndex >= 0) {
        // Product exists, increment quantity
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += 1;
        return updatedCart;
      } else {
        // Product doesn't exist, add new item
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  // Function to remove product from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
  };

  // Function to update product quantity in cart
  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product._id === productId) {
          // Make sure we don't exceed available stock
          const maxQuantity = item.product.quantity;
          const safeQuantity = Math.min(newQuantity, maxQuantity);
          return { ...item, quantity: safeQuantity };
        }
        return item;
      });
    });
  };

  // Function to proceed to checkout
  const proceedToCheckout = () => {
    if (cart.length === 0) {
      setError('Your cart is empty. Please scan products first.');
      return;
    }

    navigate('/payment', {
      state: {
        cart,
        draftType: DRAFT_TYPES.SAVED_CART,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.SAVED_CART),
      },
    });
  };

  const handleHoldOrder = async () => {
    if (!user?._id || cart.length === 0) {
      setError('Your cart is empty. Please scan products first.');
      return;
    }

    try {
      await saveDraft({
        userId: user._id,
        draftType: DRAFT_TYPES.HELD_ORDER,
        draftId: createDraftId(DRAFT_TYPES.HELD_ORDER),
        status: 'held',
        cartItems: cart,
        totals: {
          subtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
          itemCount: cart.reduce((total, item) => total + item.quantity, 0),
        },
        metadata: { source: 'scan-page-hold-order' },
      });

      await completeDraft({
        userId: user._id,
        draftType: DRAFT_TYPES.SAVED_CART,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.SAVED_CART),
      });

      setCart([]);
      setShowCartModal(false);
      setSnackbarMessage('Order held successfully. It can be restored on this cashier account.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Unable to hold order:', error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleRestoreDraft = (draft) => {
    const draftCart = draft.cartItems || [];
    setCart(draftCart);
    setShowRestoreModal(false);

    if (draft.draftType === DRAFT_TYPES.DRAFT_SALE) {
      navigate('/payment', {
        state: {
          cart: draftCart,
          draftType: draft.draftType,
          draftId: draft.draftId,
          paymentSelection: draft.paymentSelection,
        },
      });
      return;
    }

    setShowCartModal(true);
    setSnackbarMessage('Previous transaction restored.');
    setSnackbarOpen(true);
  };

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setAvailableProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAvailableProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user?._id) {
      navigate(`/edit-profile/${user._id}`);
    }
  };

  const handleLogout = () => {
    const purchasedData = localStorage.getItem('purchasedData');
    localStorage.clear();
    if (purchasedData) {
      localStorage.setItem('purchasedData', purchasedData);
    }
    navigate('/login-selection');
  };

  const handlePayLaterClick = (item) => {
    console.log('Selected Pay Later Item:', item);
    setSelectedPayLaterItem(item);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayLaterItem) {
      console.error('No item selected for payment.');
      return;
    }

    const payload = {
      userId: user?._id,
      itemId: selectedPayLaterItem?._id,
    };

    console.log('Payload being sent:', payload);

    try {
      const response = await fetch(`${config.apiUrl}/api/transactions/pay-later/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm payment.');
      }

      const data = await response.json();
      console.log('Payment Confirmed:', data);

      // Update the lists
      setPayLaterItems((prev) => prev.filter((i) => i._id !== selectedPayLaterItem._id));
      setPaidItems((prev) => [...prev, selectedPayLaterItem]);

      // Close the modal
      setShowPaymentModal(false);

      // Store the item name for the success message
      const itemName = selectedPayLaterItem.name;
      const itemPrice = selectedPayLaterItem.price.toFixed(2);

      // Reset the selected item
      setSelectedPayLaterItem(null);

      // Show success message with item details
      setSnackbarMessage(`Payment successful! ₱${itemPrice} paid for ${itemName}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error confirming payment:', error.message);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
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
        padding: "20px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          maxWidth: "1400px",
          margin: "0 auto",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1,
            display: "flex",
            gap: 2
          }}
        >
          <Tooltip title={`Shopping Cart (${cart.length})`}>
            <IconButton
              onClick={() => setShowCartModal(true)}
              sx={{
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.2)",
                },
              }}
            >
              <Badge badgeContent={cart.length} color="primary">
                <FaShoppingCart />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: "#f44336",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.2)",
                },
              }}
            >
              <FaSignOutAlt />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            minHeight: "100vh",
          }}
        >
          {/* Left Section */}
          <motion.div
            variants={itemVariants}
            style={{
              flex: 1,
              padding: "30px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            }}
          >
            {/* User Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              {user?.image ? (
                <Box
                  component="img"
                  src={user.image}
                  alt="User"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid #1a2a6c",
                    marginRight: "20px",
                  }}
                />
              ) : (
                <FaUserCircle
                  style={{
                    fontSize: "80px",
                    color: "#1a2a6c",
                    marginRight: "20px",
                  }}
                />
              )}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "600",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  {user?.firstname} {user?.lastname}
                </Typography>
                <Button
                  startIcon={<FaEdit />}
                  onClick={handleEditProfile}
                  sx={{
                    borderRadius: "12px",
                    textTransform: "none",
                    color: "#1a2a6c",
                    borderColor: "#1a2a6c",
                    "&:hover": {
                      backgroundColor: "#1a2a6c",
                      color: "white",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>

            {/* Items Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: "20px",
              }}
            >
              {/* Paid Items */}
              <motion.div
                variants={itemVariants}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FaCheckCircle
                    style={{
                      fontSize: "24px",
                      color: "#4caf50",
                      marginRight: "10px",
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Paid Items
                  </Typography>
                </Box>
                <Box
                  sx={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#888",
                      borderRadius: "4px",
                    },
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : paidItems.length > 0 ? (
                    paidItems.map((item) => (
                      <motion.div
                        key={item._id}
                        variants={itemVariants}
                        style={{
                          padding: "15px",
                          marginBottom: "10px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "12px",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: "500",
                            color: "#333",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#4caf50",
                            fontWeight: "600",
                          }}
                        >
                          ₱{item.price.toFixed(2)}
                        </Typography>
                      </motion.div>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "#888",
                        padding: "20px",
                      }}
                    >
                      No paid items
                    </Typography>
                  )}
                </Box>
              </motion.div>

              {/* Pay Later Items */}
              <motion.div
                variants={itemVariants}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <FaClock
                    style={{
                      fontSize: "24px",
                      color: "#ff9800",
                      marginRight: "10px",
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    Pay Later Items
                  </Typography>
                </Box>
                <Box
                  sx={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                      background: "#f1f1f1",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#888",
                      borderRadius: "4px",
                    },
                  }}
                >
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : payLaterItems.length > 0 ? (
                    payLaterItems.map((item) => (
                      <motion.div
                        key={item._id}
                        variants={itemVariants}
                        onClick={() => handlePayLaterClick(item)}
                        style={{
                          padding: "15px",
                          marginBottom: "10px",
                          backgroundColor: "#fff3e0",
                          borderRadius: "12px",
                          border: "1px solid #ffe0b2",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: "500",
                            color: "#333",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#ff9800",
                            fontWeight: "600",
                          }}
                        >
                          ₱{item.price.toFixed(2)}
                        </Typography>
                      </motion.div>
                    ))
                  ) : (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: "#888",
                        padding: "20px",
                      }}
                    >
                      No pay later items
                    </Typography>
                  )}
                </Box>
              </motion.div>
            </Box>
            {/* Available Products Section with Images */}
<motion.div
  variants={itemVariants}
  style={{
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  }}
>
  <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
    <FaBox style={{ fontSize: "24px", color: "#1a2a6c", marginRight: "10px" }} />
    <Typography variant="h6" sx={{ fontWeight: "600", color: "#333" }}>
      Available Products
    </Typography>
  </Box>

  <Box
    sx={{
      maxHeight: "400px",
      overflowY: "auto",
      "&::-webkit-scrollbar": { width: "8px" },
      "&::-webkit-scrollbar-track": { background: "#f1f1f1", borderRadius: "4px" },
      "&::-webkit-scrollbar-thumb": { background: "#888", borderRadius: "4px" },
    }}
  >
    {productsLoading ? (
      <Box sx={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <CircularProgress />
      </Box>
    ) : availableProducts.length > 0 ? (
      <Grid container spacing={2}>
        {availableProducts.map((product) => (
          <Grid item xs={12} sm={6} key={product._id}>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "1px solid #e9ecef",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", gap: "15px", alignItems: "center" }}>
                {product.image ? (
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                ) : (
                  <FaBox style={{ fontSize: "40px", color: "#ccc" }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: "600", color: "#333" }}>
                    {product.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: product.quantity > 0 ? "#27ae60" : "#e74c3c",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                    }}
                  >
                    Stock: {product.quantity}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                    Barcode: {product.barcode}
                  </Typography>
                </Box>
                <Typography
                  sx={{ color: "#1a2a6c", fontWeight: "600", fontSize: "1.1rem" }}
                >
                  ₱{product.price?.toFixed(2)}
                </Typography>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography sx={{ textAlign: "center", color: "#888", padding: "20px" }}>
        No products available
      </Typography>
    )}
  </Box>
</motion.div>

          </motion.div>

          {/* Right Section */}
          <motion.div
            variants={itemVariants}
            style={{
              flex: 1,
              padding: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: "white",
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                width: "100%",
                maxWidth: "500px",
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
                Scan Product
              </Typography>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  startIcon={<FaBarcode />}
                  onClick={handleScanClick}
                  sx={{
                    padding: "12px 24px",
                    fontSize: "18px",
                    borderRadius: "12px",
                    textTransform: "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Start Scanning
                </Button>
              </motion.div>

              {showScanner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: "20px" }}
                >
                  <input
  ref={inputRef}
  type="text"
  value={barcode}
  onChange={(e) => setBarcode(e.target.value)} // ONLY use this to manage input state
  onKeyDown={handleKeyDown}
  onBlur={handleBlur}
  placeholder="Scan barcode or enter manually"
  style={{
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    border: "2px solid #1a2a6c",
    borderRadius: "12px",
    outline: "none",
    transition: "all 0.3s ease",
  }}
/>

                </motion.div>
              )}

              {error && (
                <Typography
                  sx={{
                    color: "#f44336",
                    marginTop: "10px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </Typography>
              )}
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* Payment Confirmation Modal */}
      <Modal
        open={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        aria-labelledby="restore-transaction-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "92%" : 520,
            maxHeight: "80vh",
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            p: 4,
            overflow: "auto",
          }}
        >
          <Typography id="restore-transaction-title" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Restore Previous Transaction
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
            Unfinished carts and held orders were found for this cashier.
          </Typography>

          <List sx={{ border: "1px solid #eee", borderRadius: 2, mb: 3 }}>
            {restoreDrafts.map((draft, index) => {
              const draftCart = draft.cartItems || [];
              const total = draftCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
              const label = draft.draftType === DRAFT_TYPES.HELD_ORDER ? "Held Order" : "Saved Cart";

              return (
                <React.Fragment key={draft.localKey || draft.draftId}>
                  <ListItem
                    secondaryAction={
                      <Button size="small" variant="contained" onClick={() => handleRestoreDraft(draft)}>
                        Restore
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={`${label} - ${draftCart.length} item${draftCart.length === 1 ? "" : "s"}`}
                      secondary={`Total: ₱${total.toFixed(2)} | Last saved: ${new Date(draft.updatedAt).toLocaleString()}`}
                    />
                  </ListItem>
                  {index < restoreDrafts.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => setShowRestoreModal(false)}>
              Continue Without Restoring
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        aria-labelledby="payment-modal-title"
        aria-describedby="payment-modal-description"
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
            id="payment-modal-title"
            variant="h6"
            component="h2"
            sx={{
              marginBottom: "24px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Confirm Payment
          </Typography>
          {selectedPayLaterItem && (
            <Box>
              <Typography variant="body1" sx={{ marginBottom: "16px" }}>
                Are you sure you want to pay for:
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "600",
                  color: "#1a2a6c",
                  marginBottom: "8px",
                }}
              >
                {selectedPayLaterItem.name}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "600",
                  color: "#b21f1f",
                  marginBottom: "24px",
                }}
              >
                ₱{selectedPayLaterItem.price.toFixed(2)}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              gap: "16px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => setShowPaymentModal(false)}
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
              onClick={handleConfirmPayment}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
              }}
            >
              Confirm Payment
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes('Error') ? "error" : "success"}
          icon={snackbarMessage.includes('Payment successful') ? <FaCheckCircle /> : undefined}
          variant="filled"
          sx={{
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            minWidth: "300px",
            padding: "16px 24px",
            "& .MuiAlert-icon": {
              fontSize: "24px",
              marginRight: "16px",
            },
            "& .MuiAlert-message": {
              fontSize: "16px",
              fontWeight: "500",
            },
            "& .MuiAlert-action": {
              paddingTop: "8px",
            },
            ...(snackbarMessage.includes('Payment successful') && {
              background: "linear-gradient(135deg, #2ecc71, #27ae60)",
            }),
            ...(snackbarMessage.includes('Error') && {
              background: "linear-gradient(135deg, #e74c3c, #c0392b)",
            }),
            animation: "slideUp 0.5s ease-out forwards",
            "@keyframes slideUp": {
              "0%": {
                opacity: 0,
                transform: "translateY(20px)",
              },
              "100%": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Shopping Cart Modal */}
      <Modal
        open={showCartModal}
        onClose={() => setShowCartModal(false)}
        aria-labelledby="cart-modal-title"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : 600,
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <Typography id="cart-modal-title" variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
            Shopping Cart
          </Typography>

          {cart.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <FaShoppingCart style={{ fontSize: 60, color: '#ccc', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Scan products to add them to your cart
              </Typography>
            </Box>
          ) : (
            <>
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  maxHeight: '50vh',
                  mb: 3,
                  border: '1px solid #eee',
                  borderRadius: 2
                }}
              >
                <List>
                  {cart.map((item, index) => (
                    <React.Fragment key={item.product._id}>
                      <ListItem>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {item.product.image ? (
                            <Box
                              component="img"
                              src={item.product.image}
                              alt={item.product.name}
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 1,
                                objectFit: 'cover',
                                mr: 2
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 1,
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2
                              }}
                            >
                              <FaBox />
                            </Box>
                          )}

                          <Box sx={{ flex: 1 }}>
                            <ListItemText
                              primary={item.product.name}
                              secondary={`₱${item.product.price.toFixed(2)} each`}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => updateCartItemQuantity(item.product._id, item.quantity - 1)}
                                sx={{ border: '1px solid #ddd' }}
                              >
                                <FaMinus size={12} />
                              </IconButton>

                              <Typography sx={{ mx: 2 }}>
                                {item.quantity}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={() => updateCartItemQuantity(item.product._id, item.quantity + 1)}
                                sx={{ border: '1px solid #ddd' }}
                                disabled={item.quantity >= item.product.quantity}
                              >
                                <FaPlus size={12} />
                              </IconButton>
                            </Box>
                          </Box>

                          <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              ₱{(item.product.price * item.quantity).toFixed(2)}
                            </Typography>

                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFromCart(item.product._id)}
                              sx={{ mt: 1 }}
                            >
                              <FaTrash size={14} />
                            </IconButton>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < cart.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Total:
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ₱{cart.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowCartModal(false)}
                  sx={{ borderRadius: 2 }}
                >
                  Continue Shopping
                </Button>

                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleHoldOrder}
                  sx={{ borderRadius: 2 }}
                >
                  Hold Order
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={proceedToCheckout}
                  startIcon={<FaCheckCircle />}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(45deg, #1a2a6c, #b21f1f)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </motion.div>
  );
}

export default ScanPage;
