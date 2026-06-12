import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  ThemeProvider,
  createTheme,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import bsuLogo from "../images/BSU LOGO.png";
import cotLogo from "../images/COT.png";
import config from '../config';

// Theme setup
const theme = createTheme({
  palette: {
    primary: {
      main: "#1a2a6c",
    },
    secondary: {
      main: "#b21f1f",
    },
    background: {
      default: "#f4f6f8",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 300,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "12px",
          padding: "12px 24px",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
          },
        },
      },
    },
  },
});

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !pin) {
      setErrorMessage("Please enter both email and PIN.");
      return;
    }

    if (pin.length !== 6) {
      setErrorMessage("PIN must be a 6-digit number.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/api/admin/login`, {
        email,
        pin,
      });

      console.log(response.data); // Check if the token is being returned in the response.

      if (response.status === 200) {

       console.log(localStorage.getItem("token")); // Check if token is set

        // Store the new token and admin data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));

        // Navigate to the dashboard
        navigate("/dashboard");
      } else {
        setErrorMessage(response.data.message || "Invalid login credentials.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Unauthorized access. Admin privileges required.");
        } else {
          setErrorMessage(error.response.data.message || "Invalid login credentials.");
        }
      } else if (error.request) {
        setErrorMessage("Server did not respond. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
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
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          padding: 3,
          position: "relative",
          background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
          overflow: "hidden",
        }}
      >
        {/* Background Animation */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)",
            zIndex: 1,
          }}
        />

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: "absolute", top: 20, left: 20, zIndex: 2 }}
        >
          <Tooltip title="Go Back" arrow>
            <IconButton
              sx={{
                bgcolor: "rgba(255,255,255,0.25)",
                color: "#ffffff",
                width: "40px",
                height: "40px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                boxShadow: "0 0 15px rgba(255,255,255,0.5)",
                textShadow: "0 0 12px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7)",
                filter: "brightness(1.5) drop-shadow(0 0 5px rgba(255,255,255,0.8))",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.4)",
                  transform: "translateY(-2px) scale(1.1)",
                  boxShadow: "0 0 20px rgba(255,255,255,0.7)",
                  filter: "brightness(1.8) drop-shadow(0 0 8px rgba(255,255,255,0.9))"
                }
              }}
              onClick={() => navigate(-1)}
            >
              <ArrowBackIcon fontSize="medium" sx={{ color: "#ffffff" }} />
            </IconButton>
          </Tooltip>
        </motion.div>

        {/* Login Box */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 500, zIndex: 2 }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 5,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              p: 4,
              textAlign: "center",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Logos */}
              <motion.div
                variants={itemVariants}
                style={{ marginBottom: "24px", display: "flex", justifyContent: "center", gap: "16px" }}
              >
                <motion.img
                  src={bsuLogo}
                  alt="BSU Logo"
                  style={{ height: 60 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.img
                  src={cotLogo}
                  alt="COT Logo"
                  style={{ height: 60 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              {/* Titles */}
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Bukidnon State University
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  College of Technologies
                </Typography>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    marginTop: "16px",
                  }}
                >
                  Markie Store Admin
                </Typography>
              </motion.div>

              {/* Error Alert */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        borderRadius: "12px",
                      }}
                    >
                      {errorMessage}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Login Form */}
              <motion.form
                variants={itemVariants}
                onSubmit={handleSubmit}
                style={{ marginTop: "24px" }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="PIN"
                  variant="outlined"
                  type="password"
                  value={pin}
                  onChange={(e) => {
                    // Only allow numeric input
                    const numericValue = e.target.value.replace(/\D/g, '');
                    // Limit to 6 digits
                    if (numericValue.length <= 6) {
                      setPin(numericValue);
                    }
                  }}
                  margin="normal"
                  required
                  inputProps={{
                    maxLength: 6,
                    inputMode: "numeric",
                    pattern: "[0-9]*"
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Enter a 6-digit PIN"
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ marginTop: "24px" }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      padding: "12px 24px",
                      borderRadius: "12px",
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLoginPage;
