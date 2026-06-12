import React, { useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Google from "../images/google.png";
import config from '../config';

import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Alert,
  Tooltip,
  CircularProgress,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    pin: ["", "", "", "", "", ""],
    confirmPin: ["", "", "", "", "", ""],
    image: null,
  });
  // No need to store token in state for v2
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const pinRefs = useRef([]);
  pinRefs.current = Array(6).fill().map((_, i) => pinRefs.current[i] || React.createRef());
  const confirmPinRefs = useRef([]);
  confirmPinRefs.current = Array(6).fill().map((_, i) => confirmPinRefs.current[i] || React.createRef());

  const handleChange = (e, field) => {
    const { value, name } = e.target;
    const index = parseInt(name);

    // Only allow numeric input - strictly enforce this
    if (value && !/^[0-9]$/.test(value)) {
      // If non-numeric, don't update the state and prevent default behavior
      e.preventDefault();
      return;
    }

    const digit = value;

    // If backspace is pressed (empty value) and not the first field, move focus to previous field
    if (digit === '' && index > 0) {
      const newPin = [...formData[field]];
      newPin[index] = '';
      setFormData({ ...formData, [field]: newPin });

      if (field === "pin") {
        pinRefs.current[index - 1].current.focus();
      } else {
        confirmPinRefs.current[index - 1].current.focus();
      }
      return;
    }

    // Update the pin array with the new digit
    if (digit.length <= 1) {
      const newPin = [...formData[field]];
      newPin[index] = digit;
      setFormData({ ...formData, [field]: newPin });

      // Move to next input if a digit was entered and not the last field
      if (digit.length === 1 && index < 5) {
        if (field === "pin") {
          pinRefs.current[index + 1].current.focus();
        } else {
          confirmPinRefs.current[index + 1].current.focus();
        }
      }
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Collect missing fields
    const missingFields = [];

    // Validate text fields
    if (!formData.firstname.trim()) missingFields.push("First Name");
    if (!formData.lastname.trim()) missingFields.push("Last Name");
    if (!formData.email.trim()) missingFields.push("Email");

    // Validate PIN fields
    const pin = formData.pin.join("");
    const confirmPin = formData.confirmPin.join("");

    // Check if PIN is complete
    if (pin.length !== 6) {
      missingFields.push("Complete 6-digit PIN");
    } else if (!/^\d+$/.test(pin)) {
      setError("PIN must contain only digits.");
      return;
    }

    // Check if Confirm PIN is complete
    if (confirmPin.length !== 6) {
      missingFields.push("Confirm PIN");
    }

    // Continue with PIN validation if both PINs are complete
    if (pin.length === 6 && confirmPin.length === 6) {
      // Check if PINs match
      if (pin !== confirmPin) {
        setError("PINs do not match. Please try again.");
        return;
      }
    }

    // Validate email domain
    const allowedDomains = ["buksu.edu.ph", "student.buksu.edu.ph"];
    const emailParts = formData.email.split("@");

    if (emailParts.length !== 2 || !allowedDomains.includes(emailParts[1])) {
      setError("Only emails from buksu.edu.ph or student.buksu.edu.ph are allowed.");
      return;
    }

    // Final check for all missing fields
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}.`);
      return;
    }

    // Prepare data to send as JSON
    const dataToSend = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
      pin: pin // Send PIN as a string
    };

    try {
      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/api/register`, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      setLoading(false);
      setMessage(response.data.message);

      // Reset form
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        pin: ["", "", "", "", "", ""],
        confirmPin: ["", "", "", "", "", ""],
        image: null,
      });

      // Redirect after successful registration
      setTimeout(() => navigate("/login-selection"), 5000);
    } catch (error) {
      setLoading(false);
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Error during registration. Please try again.");
    }
  };

  const googleAuth = () => {
    try {
      // Use the full URL to avoid localhost issues with Google OAuth
      window.open(`https://clean-u8gn.onrender.com/auth/google`, "_self");
    } catch (error) {
      setError("Google authentication failed. Please try again.");
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          width: "100%",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          background: "rgba(255,255,255,0.97)",
          p: 0,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Left Side: Illustration or Branding */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
            color: "white",
            flexDirection: "column",
            minWidth: 320,
            p: 4,
          }}
        >
          <Box sx={{ mb: 3 }}>
            <i className="fas fa-user-plus" style={{ fontSize: 64, opacity: 0.9 }}></i>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1 }}>
            Welcome!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Join our store community and enjoy exclusive features.
          </Typography>
        </Box>
        {/* Right Side: Registration Form */}
        <Box sx={{ flex: 2, p: { xs: 3, md: 5 }, position: "relative" }}>
          <motion.button
            onClick={() => navigate("/")}
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              background: "none",
              border: "none",
              color: "#1a2a6c",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-arrow-left"></i> Back
          </motion.button>
          <Box sx={{ textAlign: "center", mb: 3, mt: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Register
            </Typography>
            <Typography variant="body1" sx={{ color: "#666" }}>
              Create your account to access the store.
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                    PIN
                  </Typography>
                  <Tooltip title="6-digit numeric PIN for login security">
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  {formData.pin.map((digit, index) => (
                    <TextField
                      key={index}
                      type="password"
                      name={index.toString()}
                      value={digit}
                      onChange={(e) => handleChange(e, "pin")}
                      onKeyDown={(e) => {
                        // Handle backspace to move to previous field
                        if (e.key === 'Backspace' && index > 0 && digit === '') {
                          pinRefs.current[index - 1].current.focus();
                        }

                        // Prevent non-numeric input - strictly enforce numeric only
                        if (!/^[0-9]$/.test(e.key) &&
                            e.key !== 'Backspace' &&
                            e.key !== 'Delete' &&
                            e.key !== 'ArrowLeft' &&
                            e.key !== 'ArrowRight' &&
                            e.key !== 'Tab' &&
                            !e.ctrlKey &&
                            !e.metaKey) {
                          e.preventDefault();
                        }
                      }}
                      inputProps={{
                        maxLength: 1,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        style: {
                          textAlign: "center",
                          fontSize: "1.2rem",
                          fontWeight: "bold"
                        },
                        // Additional attribute to enforce numeric input on mobile
                        onInput: (e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }
                      }}
                      inputRef={pinRefs.current[index]}
                      required
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: digit ? "#e8f0fe" : "#f5f5f5",
                        transition: "all 0.2s ease",
                        "& .MuiOutlinedInput-root": {
                          height: "100%",
                          "& fieldset": {
                            borderColor: digit ? "#1a2a6c" : "#e0e0e0",
                            borderWidth: digit ? 2 : 1,
                          },
                          "&:hover fieldset": {
                            borderColor: "#1a2a6c",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#1a2a6c",
                            borderWidth: 2,
                          },
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>
                    Confirm PIN
                  </Typography>
                  <Tooltip title="Re-enter your 6-digit PIN">
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </Box>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  {formData.confirmPin.map((digit, index) => (
                    <TextField
                      key={index}
                      type="password"
                      name={index.toString()}
                      value={digit}
                      onChange={(e) => handleChange(e, "confirmPin")}
                      onKeyDown={(e) => {
                        // Handle backspace to move to previous field
                        if (e.key === 'Backspace' && index > 0 && digit === '') {
                          confirmPinRefs.current[index - 1].current.focus();
                        }

                        // Prevent non-numeric input - strictly enforce numeric only
                        if (!/^[0-9]$/.test(e.key) &&
                            e.key !== 'Backspace' &&
                            e.key !== 'Delete' &&
                            e.key !== 'ArrowLeft' &&
                            e.key !== 'ArrowRight' &&
                            e.key !== 'Tab' &&
                            !e.ctrlKey &&
                            !e.metaKey) {
                          e.preventDefault();
                        }
                      }}
                      inputProps={{
                        maxLength: 1,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        style: {
                          textAlign: "center",
                          fontSize: "1.2rem",
                          fontWeight: "bold"
                        },
                        // Additional attribute to enforce numeric input on mobile
                        onInput: (e) => {
                          e.target.value = e.target.value.replace(/[^0-9]/g, '');
                        }
                      }}
                      inputRef={confirmPinRefs.current[index]}
                      required
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: digit ? "#e8f0fe" : "#f5f5f5",
                        transition: "all 0.2s ease",
                        "& .MuiOutlinedInput-root": {
                          height: "100%",
                          "& fieldset": {
                            borderColor: digit ? "#1a2a6c" : "#e0e0e0",
                            borderWidth: digit ? 2 : 1,
                          },
                          "&:hover fieldset": {
                            borderColor: "#1a2a6c",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#1a2a6c",
                            borderWidth: 2,
                          },
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  sx={{
                    borderRadius: "12px",
                    padding: "12px 0",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(26,42,108,0.08)",
                    mb: 2
                  }}
                  startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  onClick={googleAuth}
                  sx={{
                    borderRadius: "12px",
                    padding: "10px 0",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    color: "#1a2a6c",
                    borderColor: "#1a2a6c",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    background: "#fff",
                    '&:hover': {
                      borderColor: "#b21f1f",
                      color: "#b21f1f",
                    },
                  }}
                  startIcon={<img src={Google} alt="Google" style={{ width: 24, height: 24 }} />}
                >
                  Continue with Google
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" align="center">
                  Already have an account?{' '}
                  <Link to="/login-selection" style={{ color: "#1a2a6c", fontWeight: 600 }}>
                    Login here
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Card>
    </motion.div>
  );
}

export default RegisterPage;
