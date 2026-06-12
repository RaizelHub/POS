import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  Avatar,
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Card,
  Grid,
} from "@mui/material";
import { FaUsers, FaBox, FaChartLine } from "react-icons/fa";
import { IoLogOut, IoMenu, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import UserList from "./Userlist";
import ProductList from "./Productlist";
import TotalSales from "./TotalSales";
import AdminProfile from "./AdminProfile";
import axios from "axios";
import PersonIcon from "@mui/icons-material/Person";
import { People as PeopleIcon, Inventory2 as InventoryIcon, BarChart as BarChartIcon } from '@mui/icons-material';
import config from '../config';



function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = 240;
  const [stats, setStats] = useState({ users: 0, products: 0, sales: 0 });

  // Fetch admin data based on the current token in localStorage
  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/"); // Redirect to login if no token is found
        return;
      }

      try {
        const response = await axios.get(`${config.apiUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure response.data contains the correct admin details
        console.log("Admin data received:", response.data);

        // Make sure you are correctly updating the state with the fetched data
        setAdmin(response.data); // Set the admin data to the state
        setLoading(false); // Set loading state to false after data is fetched
      } catch (err) {
        console.error("Error fetching admin data:", err);
        navigate("/admin-login"); // Redirect to login if the token is invalid or expired
      }


    };


    fetchAdminData();
  }, [navigate]); // This effect depends on navigation changes and will run whenever the page is loaded or token changes

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersRes, productsRes, salesRes] = await Promise.all([
          axios.get(`${config.apiUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${config.apiUrl}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${config.apiUrl}/api/total-sales-details`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats({
          users: usersRes.data.length,
          products: productsRes.data.length,
          sales: salesRes.data.totalSales || 0,
        });
      } catch (err) {
        // ignore errors for stats
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token on logout
    setAdmin(null); // Clear admin data
    setLoading(true); // Reset loading state
    navigate("/"); // Redirect to login page
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const drawerContent = (
    <motion.div
      variants={containerVariants}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
        color: "white",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Avatar
            src={admin?.image}
            alt={admin?.firstname}
            sx={{
              width: 50,
              height: 50,
              border: "2px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "600",
                fontSize: "1.1rem",
                marginBottom: "2px",
              }}
            >
              {admin?.firstname} {admin?.lastname}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.8,
                fontSize: "0.85rem",
              }}
            >
              Administrator
            </Typography>
          </Box>
        </motion.div>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          gap: "10px",
        }}
      >
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <ListItem
            button
            component={Link}
            to="/admin-profile"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
                transform: "translateX(5px)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.1)",
                marginBottom: "8px",
              }}
            >
              <PersonIcon />
            </Avatar>
            <Typography variant="body1" sx={{ marginTop: "8px" }}>
              Profile
            </Typography>
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/user-list"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
                transform: "translateX(5px)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.1)",
                marginBottom: "8px",
              }}
            >
              <FaUsers />
            </Avatar>
            <Typography variant="body1" sx={{ marginTop: "8px" }}>
              Users
            </Typography>
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/product-list"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
                transform: "translateX(5px)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.1)",
                marginBottom: "8px",
              }}
            >
              <FaBox />
            </Avatar>
            <Typography variant="body1" sx={{ marginTop: "8px" }}>
              Products
            </Typography>
          </ListItem>

          <ListItem
            button
            component={Link}
            to="/total-sales"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              color: "white",
              padding: "12px",
              marginBottom: "16px",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
                transform: "translateX(5px)",
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: "rgba(255,255,255,0.1)",
                marginBottom: "8px",
              }}
            >
              <FaChartLine />
            </Avatar>
            <Typography variant="body1" sx={{ marginTop: "8px" }}>
              Sales
            </Typography>
          </ListItem>
        </motion.div>
      </Box>

      <Box sx={{ padding: "16px" }} className="bg-white dark:bg-gray-800">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{
                backgroundColor: "rgba(255,0,0,0.8)",
                color: "white",
                width: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255,0,0,1)",
                  transform: "translateY(-2px)",
                },
                padding: "16px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              <IoLogOut />
            </IconButton>
          </Tooltip>
        </motion.div>
      </Box>
    </motion.div>
  );

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>; // Loading state while fetching admin data
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Mobile App Bar */}
      {isMobile && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            bgcolor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            padding: "8px 16px",
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {mobileOpen ? <IoClose /> : <IoMenu />}
          </IconButton>
            <Typography variant="h6" noWrap component="div">
              Admin Dashboard
            </Typography>
            <ThemeToggle />
        </Box>
      )}

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <AnimatePresence>
          {(mobileOpen || !isMobile) && (
            <motion.div
              initial={{ x: -drawerWidth }}
              animate={{ x: 0 }}
              exit={{ x: -drawerWidth }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={mobileOpen || !isMobile}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true,
                }}
                sx={{
                  display: { xs: "block", sm: "block" },
                  "& .MuiDrawer-paper": {
                    boxSizing: "border-box",
                    width: drawerWidth,
                    border: "none",
                  },
                }}
              >
                {drawerContent}
              </Drawer>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: isMobile ? "64px" : 0,
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
        }}
      >
        {/* Dashboard Welcome & Stats Section (only on main dashboard route) */}
        {window.location.pathname === "/admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: 40 }}
          >
            <Box
              sx={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: "24px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                padding: { xs: 3, md: 5 },
                mb: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Welcome, {admin?.firstname} {admin?.lastname}!
              </Typography>
              <Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
                Here's a quick overview of your store's performance today.
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#1a2a6c", width: 56, height: 56 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.users}</Typography>
                      <Typography variant="body2" color="text.secondary">Users</Typography>
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#b21f1f", width: 56, height: 56 }}>
                      <InventoryIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{stats.products}</Typography>
                      <Typography variant="body2" color="text.secondary">Products</Typography>
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2, p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#fdbb2d", width: 56, height: 56, color: "#1a2a6c" }}>
                      <BarChartIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>₱{stats.sales.toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Sales</Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        )}
        <Routes>
          <Route path="/user-list" element={<UserList />} />
          <Route path="/product-list" element={<ProductList />} />
          <Route path="/total-sales" element={<TotalSales />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default Dashboard;
