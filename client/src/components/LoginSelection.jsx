import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BSULOGO from '../images/BSU LOGO.png';
import COTLOGO from '../images/COT.png';
import styles from './css/LoginSelection.module.css';
import { formatDistanceToNow } from 'date-fns';
import { Modal, Typography } from '@mui/material';
import { getApiUrl } from '../utils/getApiUrl';

function LoginSelectionPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isForgotPin, setIsForgotPin] = useState(false);
  const [email, setEmail] = useState('');
  const [resetError, setResetError] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('pinReset') === 'true') {
      setSnackbarMessage('PIN reset successful!');
    }
    fetchUsers();
  }, [location]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users.');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    if (user.isVerified) {
      setSelectedUser(user);
      setPin('');
      setError(null);
      setIsForgotPin(false);
      setEmail('');
    } else {
      setError('This user is not verified. Please verify your account first.');
    }
  };

  const handlePinSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email, pin }),
      });

      if (!res.ok) throw new Error('Invalid PIN or login failed.');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/scan', {
        state: { userId: data.user._id, firstname: data.user.firstname },
      });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    if (!email) {
      setResetError('Please enter a valid email address.');
      return;
    }

    if (email !== selectedUser.email) {
      setResetError('Email does not match the selected user.');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/forgot-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: selectedUser.email }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      setSnackbarMessage('Reset link sent to your email!');

      // Close the modal after a short delay
      setTimeout(() => {
        closeModal();
      }, 1500);

    } catch (error) {
      setResetError('There was an issue resetting the PIN.');
      setSnackbarMessage('Error resetting PIN.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setPin('');
    setError(null);
    setIsForgotPin(false);
    setEmail('');
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
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        padding: "20px",
      }}
    >
      <motion.header
        className={styles.header}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          marginBottom: "30px",
        }}
      >
        <motion.div className={styles.logoContainer} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link to="/" className={styles.backIcon}>
            <motion.i
              className="fas fa-arrow-left"
              whileHover={{ scale: 1.2, rotate: -10 }}
              whileTap={{ scale: 0.9 }}
              style={{ color: "white", fontSize: "24px" }}
            ></motion.i>
          </Link>
          <motion.img
            src={BSULOGO}
            alt="Bukidnon State University"
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ height: "60px", objectFit: "contain" }}
          />
          <motion.img
            src={COTLOGO}
            alt="College of Technologies"
            className={styles.logo}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            style={{ height: "60px", objectFit: "contain" }}
          />
        </motion.div>
        <Link to="/register">
          <motion.button
            className={styles.registerButton}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: "12px 24px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              border: "2px solid white",
              borderRadius: "12px",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Register
          </motion.button>
        </Link>
      </motion.header>

      {loading && (
        <motion.p
          className={styles.loadingMessage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading users...
        </motion.p>
      )}

      {!loading && !error && (
        <motion.div
          variants={containerVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "20px",
            padding: "20px",
            width: "100%",
            maxWidth: "1200px",
            margin: "0 auto"
          }}
        >
          {users.map((user) => (
            <motion.div
              key={user._id}
              variants={itemVariants}
              whileHover={{ scale: 1.04 }}
              onClick={() => handleUserClick(user)}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "20px",
                cursor: "pointer",
                border: "2px solid rgba(255, 255, 255, 0.25)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                marginBottom: "16px",
                textAlign: "center",
                overflow: "hidden",
              }}
            >
              <motion.img
                src={user.image ? (user.image.startsWith('http') ? user.image : `${getApiUrl()}/${user.image}`) : ''}
                alt={`${user.firstname}'s avatar`}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid white",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  marginBottom: "16px",
                }}
              />
              <div style={{ width: "100%" }}>
                <Typography
                  style={{
                    color: "white",
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    marginBottom: "8px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap"
                  }}
                >
                  {user.firstname} {user.lastname}
                </Typography>
                <Typography
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    fontSize: "0.9rem",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    maxWidth: "100%"
                  }}
                >
                  {user.email}
                </Typography>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        open={!!selectedUser}
        onClose={closeModal}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "20px",
            width: "90%",
            maxWidth: "400px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {selectedUser && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                zIndex: 0
              }}
            />
          )}
          {!isForgotPin ? (
            <>
              <div style={{ position: "relative", zIndex: 1, marginBottom: "40px", textAlign: "center" }}>
                {selectedUser && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ marginBottom: "15px" }}
                  >
                    <img
                      src={selectedUser.image ? (selectedUser.image.startsWith('http') ? selectedUser.image : `${getApiUrl()}/${selectedUser.image}`) : ''}
                      alt={`${selectedUser.firstname}'s avatar`}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid white",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        margin: "0 auto",
                        display: "block",
                        marginTop: "20px"
                      }}
                    />
                    <Typography
                      variant="h5"
                      style={{
                        marginTop: "15px",
                        fontWeight: "700",
                        color: "#1a2a6c",
                        textAlign: "center"
                      }}
                    >
                      {selectedUser.firstname} {selectedUser.lastname}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{
                        color: "#666",
                        marginTop: "5px",
                        textAlign: "center"
                      }}
                    >
                      {selectedUser.email}
                    </Typography>
                  </motion.div>
                )}
                <Typography
                  variant="h6"
                  style={{
                    marginTop: "20px",
                    fontWeight: "600",
                    color: "#333",
                    textAlign: "center"
                  }}
                >
                  Enter Your PIN
                </Typography>
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <input
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
                  placeholder="Enter your 6-digit PIN"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="6"
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "12px",
                    border: "2px solid #e0e0e0",
                    marginBottom: "15px",
                    fontSize: "18px",
                    textAlign: "center",
                    letterSpacing: "8px",
                    backgroundColor: "#f8f9fa",
                    transition: "all 0.3s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1a2a6c";
                    e.target.style.boxShadow = "0 0 0 3px rgba(26, 42, 108, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                />

                {/* PIN indicator dots */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "20px"
                }}>
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: index < pin.length ? "#1a2a6c" : "#e0e0e0",
                        transition: "all 0.2s ease"
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: "rgba(220, 53, 69, 0.1)",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      marginBottom: "20px"
                    }}
                  >
                    <Typography color="error" style={{ fontSize: "14px", textAlign: "center" }}>
                      {error}
                    </Typography>
                  </motion.div>
                )}

                <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "10px" }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "12px",
                      border: "1px solid #e0e0e0",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "15px",
                      color: "#666",
                      transition: "all 0.3s ease",
                      width: "45%",
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.03 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={handlePinSubmit}
                    disabled={loading}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)",
                      color: "white",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "15px",
                      transition: "all 0.3s ease",
                      width: "45%",
                      boxShadow: "0 4px 10px rgba(26, 42, 108, 0.2)",
                      opacity: loading ? 0.8 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                  >
                    {loading ? (
                      <>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      "Login"
                    )}
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsForgotPin(true)}
                  className={styles.forgotPinButton}
                  style={{
                    marginTop: "20px",
                    width: "100%",
                    textAlign: "center",
                    background: "none",
                    border: "none",
                    color: "#1a2a6c",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    textDecoration: "underline",
                    padding: "8px 0",
                  }}
                >
                  Forgot PIN?
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div style={{ position: "relative", zIndex: 1, marginBottom: "30px", textAlign: "center" }}>
                {selectedUser && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    style={{ marginBottom: "15px" }}
                  >
                    <img
                      src={selectedUser.image ? (selectedUser.image.startsWith('http') ? selectedUser.image : `${getApiUrl()}/${selectedUser.image}`) : ''}
                      alt={`${selectedUser.firstname}'s avatar`}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid white",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        margin: "0 auto",
                        display: "block",
                        marginTop: "20px"
                      }}
                    />
                    <Typography
                      variant="h5"
                      style={{
                        marginTop: "15px",
                        fontWeight: "700",
                        color: "#1a2a6c",
                        textAlign: "center"
                      }}
                    >
                      {selectedUser.firstname} {selectedUser.lastname}
                    </Typography>
                  </motion.div>
                )}
                <Typography
                  variant="h6"
                  style={{
                    marginTop: "20px",
                    fontWeight: "600",
                    color: "#333",
                    textAlign: "center"
                  }}
                >
                  Forgot Your PIN?
                </Typography>
                <Typography
                  style={{
                    marginTop: "10px",
                    fontSize: "14px",
                    color: "#666",
                    textAlign: "center",
                    maxWidth: "90%",
                    margin: "0 auto"
                  }}
                >
                  Please enter your email address to receive a PIN reset link.
                </Typography>
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: "12px",
                      border: "2px solid #e0e0e0",
                      marginBottom: "20px",
                      fontSize: "16px",
                      backgroundColor: "#f8f9fa",
                      transition: "all 0.3s ease",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#1a2a6c";
                      e.target.style.boxShadow = "0 0 0 3px rgba(26, 42, 108, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  {resetError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        backgroundColor: "rgba(220, 53, 69, 0.1)",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        marginBottom: "20px"
                      }}
                    >
                      <Typography color="error" style={{ fontSize: "14px", textAlign: "center" }}>
                        {resetError}
                      </Typography>
                    </motion.div>
                  )}

                  <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "10px" }}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsForgotPin(false)}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "12px",
                        border: "1px solid #e0e0e0",
                        backgroundColor: "white",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "15px",
                        color: "#666",
                        transition: "all 0.3s ease",
                        width: "45%",
                      }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: loading ? 1 : 1.03 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      onClick={handleForgotPin}
                      disabled={loading}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)",
                        color: "white",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        fontSize: "15px",
                        transition: "all 0.3s ease",
                        width: "45%",
                        boxShadow: "0 4px 10px rgba(26, 42, 108, 0.2)",
                        opacity: loading ? 0.8 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      {loading ? (
                        <>
                          <div
                            style={{
                              width: "16px",
                              height: "16px",
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTop: "2px solid white",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                          <span>Sending...</span>
                        </>
                      ) : (
                        "Reset PIN"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      </Modal>

      <AnimatePresence>
        {snackbarMessage && (
          <motion.div
            className={`${styles.snackbar} ${snackbarMessage.includes('success') || snackbarMessage.includes('sent') ? styles.success : styles.error}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: "fixed",
              bottom: "30px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: snackbarMessage.includes('success') || snackbarMessage.includes('sent')
                ? "rgba(46, 204, 113, 0.95)"
                : "rgba(231, 76, 60, 0.95)",
              color: "white",
              padding: "16px 24px",
              borderRadius: "12px",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              zIndex: 2000,
              minWidth: "280px",
              textAlign: "center",
              justifyContent: "center"
            }}
          >
            <i
              className={snackbarMessage.includes('success') || snackbarMessage.includes('sent')
                ? "fas fa-check-circle"
                : "fas fa-exclamation-circle"}
              style={{ fontSize: "20px" }}
            />
            <span style={{ fontWeight: "500" }}>{snackbarMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LoginSelectionPage;
