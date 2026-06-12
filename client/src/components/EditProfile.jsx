import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  ArrowBack,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { uploadToCloudinary } from '../config/cloudinary';
import config from '../config';

function EditProfile() {
  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    email: '',
    image: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedUser = response.data;
        setUser(fetchedUser);
        setPreviewImage(fetchedUser.image || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please log in again.');
        setLoading(false);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setUser((prevUser) => ({ ...prevUser, image: file }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in and try again.');
      setSaving(false);
      return;
    }

    let imageUrl = user.image;
    if (user.image instanceof File) {
      try {
        imageUrl = await uploadToCloudinary(user.image);
      } catch (err) {
        setError('Image upload failed. Please try again.');
        setSaving(false);
        return;
      }
    }

    const payload = {
      firstname: user.firstname,
      lastname: user.lastname,
      pin: pin,
      image: imageUrl,
    };

    try {
      const response = await axios.put(`${config.apiUrl}/api/user/me`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      setPreviewImage(updatedUser.image || '');
      setSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setTimeout(() => navigate('/scan'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
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
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          padding: isMobile ? "20px" : "40px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <IconButton
            onClick={handleBack}
            sx={{
              marginRight: "16px",
              color: "#1a2a6c",
              "&:hover": {
                backgroundColor: "rgba(26, 42, 108, 0.1)",
              },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "600",
              background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Edit Profile
          </Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "120px",
                  height: "120px",
                }}
              >
                <Avatar
                  src={previewImage}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "4px solid #1a2a6c",
                  }}
                />
                <Tooltip title="Change Photo">
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "#1a2a6c",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#b21f1f",
                      },
                    }}
                  >
              <input
                type="file"
                      hidden
                accept="image/*"
                onChange={handleImageChange}
                    />
                    <PhotoCamera />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <TextField
              label="First Name"
                name="firstname"
                value={user.firstname}
                onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <Person sx={{ color: "#1a2a6c", mr: 1 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            <TextField
              label="Last Name"
                name="lastname"
                value={user.lastname}
                onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <Person sx={{ color: "#1a2a6c", mr: 1 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            <TextField
              label="Email"
                name="email"
                value={user.email}
              fullWidth
              InputProps={{
                startAdornment: <Email sx={{ color: "#1a2a6c", mr: 1 }} />,
                readOnly: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
            />

            <TextField
              label="New PIN (optional)"
              name="pin"
    type="password"
    value={pin}
    onChange={(e) => {
      const value = e.target.value;
      if (/^\d*$/.test(value) && value.length <= 6) {
        setPin(value);
      }
    }}
              fullWidth
              InputProps={{
                startAdornment: <Lock sx={{ color: "#1a2a6c", mr: 1 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
              inputProps={{
                maxLength: 6,
                pattern: "[0-9]*",
                inputMode: "numeric",
              }}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert severity="error" sx={{ borderRadius: "12px" }}>
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert severity="success" sx={{ borderRadius: "12px" }}>
                    {success}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              sx={{
                padding: "12px 24px",
                borderRadius: "12px",
                textTransform: "none",
                background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                "&:hover": {
                  background: "linear-gradient(45deg, #b21f1f, #1a2a6c)",
                },
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </motion.form>
        )}
      </Box>
    </motion.div>
  );
}

export default EditProfile;

