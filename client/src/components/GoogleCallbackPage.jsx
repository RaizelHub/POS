import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Google,
  Error,
} from '@mui/icons-material';
import bsuLogo from '../images/BSU LOGO.png';
import cotLogo from '../images/COT.png';

const GoogleLoginCallback = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`https://clean-u8gn.onrender.com/auth/google/callback`, { withCredentials: true })
      .then(response => {
        if (response.status === 200 && response.data && response.data.error === false) {
          navigate('/login-selection');
        } else {
          setError(response.data.message || "Unknown error");
        }
      })
      .catch(error => {
        setError(error.message || "Login failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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

      <motion.div
        variants={itemVariants}
        style={{
          maxWidth: "500px",
          width: "100%",
          margin: "0 auto",
          padding: isMobile ? "20px" : "40px",
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
            padding: "40px",
            textAlign: "center",
          }}
        >
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

          <Typography
            variant="h4"
            sx={{
              fontWeight: "600",
              background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            Google Authentication
          </Typography>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <CircularProgress
                    size={60}
                    sx={{
                      color: "#1a2a6c",
                    }}
                  />
                  <Typography color="text.secondary">
                    Completing Google authentication...
                  </Typography>
                </Box>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert
                  severity="error"
                  icon={<Error />}
                  sx={{
                    borderRadius: "12px",
                    mb: 3,
                  }}
                >
                  {error}
                </Alert>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Please try logging in again or contact support if the problem persists.
                </Typography>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Google
                    sx={{
                      fontSize: 60,
                      color: "#4285f4",
                      mb: 2,
                    }}
                  />
                  <Typography color="text.secondary">
                    Redirecting to your dashboard...
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </motion.div>
    </motion.div>
  );
};

export default GoogleLoginCallback;




