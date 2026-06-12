import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  InputAdornment,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Person as PersonIcon, Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import config from '../config';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUserDetails, setOpenUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState({ paid: [], payLater: [] });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/api/users`);
        const filteredUsers = response.data.filter((user) => !user.isAdmin);
        setUsers(filteredUsers);
      } catch (error) {
        setError(error.message);
        setSnackbarMessage("Error fetching users.");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchTransactionHistory = async (userId) => {
    try {
      const response = await axios.get(`${config.apiUrl}/api/${userId}/transactions`);
      setTransactions({ paid: response.data.paid, payLater: response.data.payLater });
    } catch (error) {
      console.error("Error fetching transaction history:", error.message);
      setTransactions({ paid: [], payLater: [] });
    }
  };

  const handleOpenUserDetails = async (user) => {
    setSelectedUser(user);
    setOpenUserDetails(true);
    await fetchTransactionHistory(user._id);
  };

  const handleCloseUserDetails = () => {
    setOpenUserDetails(false);
    setTransactions({ paid: [], payLater: [] });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
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
          User Management
        </Typography>

        <motion.div variants={itemVariants}>
          <TextField
            label="Search Users"
            variant="outlined"
            value={searchTerm}
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
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user._id}>
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
                    <Avatar
                      src={user.image || ''}
                      alt={`${user.firstname} ${user.lastname}`}
                      sx={{
                        width: 80,
                        height: 80,
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
                        {user.firstname} {user.lastname}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        {user.email}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: user.isVerified ? "#4caf50" : "#f44336",
                          fontWeight: "500",
                        }}
                      >
                        {user.isVerified ? "Verified" : "Not Verified"}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      padding: "15px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => handleOpenUserDetails(user)}
                      sx={{
                        backgroundColor: "#1a2a6c",
                        color: "white",
                        borderRadius: "12px",
                        "&:hover": {
                          backgroundColor: "#b21f1f",
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* User Details Dialog */}
        <Dialog
          open={openUserDetails}
          onClose={handleCloseUserDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            },
          }}
        >
          {selectedUser && (
            <>
              <DialogTitle
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "20px",
                }}
              >
                <Avatar
                  src={selectedUser.image || ''}
                  alt={`${selectedUser.firstname} ${selectedUser.lastname}`}
                  sx={{
                    width: 60,
                    height: 60,
                    border: "3px solid #1a2a6c",
                  }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "600" }}>
                    {selectedUser.firstname} {selectedUser.lastname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </DialogTitle>

              <DialogContent dividers>
                <Box sx={{ padding: "20px" }}>
                  <Typography variant="h6" sx={{ marginBottom: "20px", fontWeight: "600" }}>
                    Transaction History
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#4caf50",
                              marginBottom: "15px",
                              fontWeight: "600",
                            }}
                          >
                            Paid Items
                          </Typography>
                          <List>
                            {transactions.paid.map((item) => (
                              <ListItem
                                key={item._id}
                                sx={{
                                  borderBottom: "1px solid #f0f0f0",
                                  padding: "10px 0",
                                }}
                              >
                                <ListItemText
                                  primary={item.name}
                                  secondary={`₱${item.price.toFixed(2)}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card
                        sx={{
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h6"
                            sx={{
                              color: "#ff9800",
                              marginBottom: "15px",
                              fontWeight: "600",
                            }}
                          >
                            Pay Later Items
                          </Typography>
                          <List>
                            {transactions.payLater.map((item) => (
                              <ListItem
                                key={item._id}
                                sx={{
                                  borderBottom: "1px solid #f0f0f0",
                                  padding: "10px 0",
                                }}
                              >
                                <ListItemText
                                  primary={item.name}
                                  secondary={`₱${item.price.toFixed(2)}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>

              <DialogActions sx={{ padding: "20px" }}>
                <Button
                  onClick={handleCloseUserDetails}
                  sx={{
                    borderRadius: "12px",
                    padding: "8px 20px",
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="error"
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

export default UserList;
