import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Logout,
  ShoppingCart,
} from '@mui/icons-material';
import axios from 'axios';
import bsuLogo from '../images/BSU LOGO.png';
import cotLogo from '../images/COT.png';
import config from '../config';

function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const baseURL = config.apiUrl;
  // Retrieve purchase details from location.state or fallback to localStorage
  const {
    product,
    cartItems,
    quantity,
    totalPrice,
    paymentMethod,
    user,
    isMultipleProducts,
    receiptUrl,
    receiptStatus,
    emailSent
  } = location.state || JSON.parse(localStorage.getItem('lastPurchase')) || {};

  useEffect(() => {
    // If state is missing, check localStorage for fallback data
    if ((!product && !cartItems) || !user) {
      const fallbackData = JSON.parse(localStorage.getItem('lastPurchase'));
      if (!fallbackData) {
        // Redirect to home if no fallback data
        navigate('/login-selection');
      }
    } else {
      // Save current purchase details in localStorage for backup
      localStorage.setItem(
        'lastPurchase',
        JSON.stringify({
          product,
          cartItems,
          quantity,
          totalPrice,
          paymentMethod,
          user,
          isMultipleProducts,
          receiptUrl,
          receiptStatus,
          emailSent
        })
      );
    }
  }, [product, cartItems, user, quantity, totalPrice, paymentMethod, isMultipleProducts, receiptUrl, receiptStatus, emailSent, navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.clear(); // Clear all stored user data
    navigate('/login-selection'); // Redirect to login page
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

  // If no valid data is found, show the error
  if ((!product && !cartItems) || !user) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <motion.div variants={itemVariants}>
          <Card
            sx={{
              maxWidth: 400,
              textAlign: "center",
              borderRadius: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              padding: "24px",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#e74c3c",
                fontWeight: "600",
                mb: 2,
              }}
            >
              Error
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              No purchase details found.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{
                background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                "&:hover": {
                  background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
                },
                borderRadius: "12px",
                textTransform: "none",
                padding: "12px 24px",
              }}
            >
              Go Back Home
            </Button>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        padding: "20px",
        position: "relative",
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

      <IconButton
        onClick={handleLogout}
        sx={{
          position: "absolute",
          top: "20px",
          right: "20px",
          color: "#f44336",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(244, 67, 54, 0.2)",
          },
        }}
      >
        <Logout />
      </IconButton>

      <motion.div
        variants={itemVariants}
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: isMobile ? "20px" : "40px",
        }}
      >
        <Card
          sx={{
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 4,
              }}
            >
              <motion.img
                src={bsuLogo}
                alt="BSU Logo"
                style={{ height: "80px", marginRight: "20px" }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.img
                src={cotLogo}
                alt="COT Logo"
                style={{ height: "80px" }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle
                  sx={{
                    fontSize: 80,
                    color: "#2ecc71",
                    mb: 2,
                  }}
                />
              </motion.div>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "600",
                  background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                Thank You for Your Purchase!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Your transaction was successful.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="h5"
              sx={{
                textAlign: "center",
                fontWeight: "600",
                color: "#1a2a6c",
                mb: 3,
              }}
            >
              Receipt
            </Typography>

            {/* Customer Information */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="600">
                  Purchased By:
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: "right" }}>
                <Typography color="text.secondary">
                  {user.firstname} {user.lastname}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1" fontWeight="600">
                  Payment Method:
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: "right" }}>
                <Typography color="text.secondary">{paymentMethod}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
            </Grid>

            {/* Single Product Purchase */}
            {product && !isMultipleProducts && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      maxWidth: "200px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="600">
                      Product:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography color="text.secondary">{product.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="600">
                      Quantity:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography color="text.secondary">{quantity}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="600">
                      Price:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography color="text.secondary">
                      ₱{product.price.toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1" fontWeight="600">
                      Total Price:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography color="text.secondary">
                      ₱{totalPrice.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}

            {/* Multiple Products Purchase */}
            {cartItems && isMultipleProducts && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "600", color: "#1a2a6c" }}>
                  Items Purchased:
                </Typography>

                {cartItems.map((item, index) => (
                  <Card key={index} sx={{ mb: 2, borderRadius: "12px", overflow: "hidden" }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ width: "60px", height: "60px", mr: 2 }}>
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px"
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight="600">
                            {item.product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.quantity} x ₱{item.product.price.toFixed(2)} = ₱{(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    Total Price:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="600" color="#1a2a6c">
                    ₱{totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Receipt Section */}
            <Box sx={{ mb: 3 }}>
              {receiptUrl ? (
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="body1" sx={{ mb: 2, textAlign: "center", color: "success.main" }}>
                    Your receipt has been generated and sent to your email.
                  </Typography>
                  <Button
                    variant="outlined"
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      borderRadius: "12px",
                      textTransform: "none",
                      padding: "8px 16px",
                    }}
                  >
                    View Receipt PDF
                  </Button>
                </Box>
              ) : receiptStatus === 'email_only' ? (
                <Box sx={{
                  p: 2,
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: "500", color: "primary.main" }}>
                    Your receipt has been sent to your email.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Please check your inbox for the receipt details.
                  </Typography>
                </Box>
              ) : receiptStatus === 'failed' || receiptStatus === 'error' ? (
                <Box sx={{
                  p: 2,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: "500", color: "error.main" }}>
                    We encountered an issue generating your receipt.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Your payment was processed successfully, but the receipt could not be generated.
                    Please contact support if you need a receipt for this transaction.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{
                  p: 2,
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  borderRadius: "12px",
                  textAlign: "center"
                }}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: "500", color: "success.main" }}>
                    Your transaction was completed successfully.
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Thank you for your purchase!
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontStyle: "italic", color: "text.secondary" }}
              >
                We hope to see you again!
              </Typography>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={() => navigate('/scan')}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  padding: "12px 24px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Scan Another Product
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default ThankYou;
