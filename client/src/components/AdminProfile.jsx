import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Avatar,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCamera, Save, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../config/cloudinary";
import config from '../config';

function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    pin: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setErrorMessage("Authentication token not found. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${config.apiUrl}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        if (response && response.data) {
          setAdmin(response.data);
          setFormData({
            firstname: response.data.firstname || "",
            lastname: response.data.lastname || "",
            email: response.data.email || "",
            pin: "",
            image: null,
          });
          setImagePreview(response.data.image);
        } else {
          setErrorMessage("Failed to fetch admin data.");
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setErrorMessage("Failed to fetch admin data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = admin?.image;

      if (formData.image && formData.image instanceof File) {
        imageUrl = await uploadToCloudinary(formData.image);
      }

      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        image: imageUrl,
      };

      if (formData.pin) {
        updateData.pin = formData.pin;
      }

      const token = localStorage.getItem("token");
      await axios.put(`${config.apiUrl}/api/admin`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setErrorMessage("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!admin) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Typography color="error">Admin data not available</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        padding: 0,
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.15)",
          position: "relative",
          py: { xs: 2, md: 6 },
        }}
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: "absolute", top: 32, left: 32, zIndex: 2 }}
        >
          <Tooltip title="Go Back">
            <IconButton
              onClick={() => navigate("/dashboard")}
              sx={{
                bgcolor: "white",
                boxShadow: 3,
                "&:hover": {
                  bgcolor: "grey.100",
                  transform: "scale(1.1)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
        </motion.div>

        <Card
          component={motion.div}
          variants={itemVariants}
          sx={{
            maxWidth: 500,
            width: "100%",
            boxShadow: "0px 12px 32px rgba(26,42,108,0.15)",
            borderRadius: "24px",
            background: "rgba(255,255,255,0.98)",
            padding: { xs: 2, md: 4 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardContent>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={2}
            >
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
                style={{ position: "relative" }}
              >
                <Avatar
                  src={imagePreview}
                  alt="Admin Profile"
                  sx={{
                    width: 130,
                    height: 130,
                    border: "5px solid #1a2a6c",
                    boxShadow: "0px 8px 24px rgba(26,42,108,0.15)",
                    background: "#f4f5f7",
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="icon-button-file">
                  <Tooltip title="Change Photo">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "white",
                        boxShadow: 2,
                        "&:hover": {
                          backgroundColor: "grey.100",
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </Tooltip>
                </label>
              </motion.div>
              <Typography
                variant="h4"
                align="center"
                fontWeight="bold"
                gutterBottom
                sx={{
                  color: "#1a2a6c",
                  mt: 2,
                  mb: 0.5,
                  letterSpacing: 1,
                }}
              >
                {admin.firstname} {admin.lastname}
              </Typography>
              <Typography
                variant="subtitle1"
                align="center"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {admin.email}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h6"
              sx={{
                color: "#b21f1f",
                fontWeight: 600,
                mb: 2,
                letterSpacing: 1,
              }}
            >
              Profile Details
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    fullWidth
                    size="small"
                    sx={{
                      backgroundColor: "#f4f5f7",
                      borderRadius: "12px",
                    }}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="New PIN (optional)"
                    name="pin"
                    type="password"
                    value={formData.pin}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                    }}
                    inputProps={{
                      maxLength: 6,
                      pattern: "[0-9]*",
                      inputMode: "numeric",
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                      sx={{
                        padding: "12px 24px",
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "1rem",
                        background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                        boxShadow: "0 4px 16px rgba(26,42,108,0.08)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 1000,
              }}
            >
              <Alert
                severity="success"
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {successMessage}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                bottom: 20,
                right: 20,
                zIndex: 1000,
              }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {errorMessage}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
}

export default AdminProfile;
