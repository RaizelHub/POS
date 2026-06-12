import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Snackbar,
  CircularProgress,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  useMediaQuery,
  Alert,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Tooltip,
} from '@mui/material';
import config from '../config';
import {
  MonetizationOn as MonetizationOnIcon,
  Payment as PaymentIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as AttachMoneyIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import bsuLogo from '../images/BSU LOGO.png';
import cotLogo from '../images/COT.png';

// ✅ New imports
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


function TotalSales() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState({
    totalSales: 0,
    paidSales: 0,
    payLaterSales: 0,
    salesDetails: [],
    userPurchases: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
    }
    setAvailableDates(dates);

    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}/api/total-sales-details?date=${selectedDate}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }

        const result = await response.json();
        setData({
          totalSales: result.totalSales || 0,
          paidSales: result.paidSales || 0,
          payLaterSales: result.payLaterSales || 0,
          salesDetails: result.salesDetails || [],
          userPurchases: result.userPurchases || [],
        });
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setError('Error fetching total sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const formatDate = (date) => {
    return dayjs(date).format('MMM D');
  };

  const handleExportToExcel = () => {
  const wb = XLSX.utils.book_new();

  // Add report title and metadata
  const reportTitle = [
    ['BUKIDNON STATE UNIVERSITY - COLLEGE OF TECHNOLOGY'],
    ['SALES REPORT'],
    [''],
    ['Report Generated:', dayjs().format('MMMM D, YYYY, h:mm A')],
    ['Report Period:', dayjs(selectedDate).format('MMMM D, YYYY')],
    ['']
  ];

  // Sales Summary with better formatting
  const salesSummary = [
    ['SALES SUMMARY'],
    [''],
    ['Category', 'Amount', 'Percentage'],
    ['Total Sales', `₱${data.totalSales.toLocaleString()}`, '100%'],
    ['Paid Sales', `₱${data.paidSales.toLocaleString()}`,
      data.totalSales > 0 ? `${((data.paidSales / data.totalSales) * 100).toFixed(2)}%` : '0%'],
    ['Pay Later Sales', `₱${data.payLaterSales.toLocaleString()}`,
      data.totalSales > 0 ? `${((data.payLaterSales / data.totalSales) * 100).toFixed(2)}%` : '0%'],
    ['']
  ];

  // Product sales details with improved headers and numbering
  const salesDetailsHeader = [
    ['PRODUCTS SOLD'],
    [''],
    ['No.', 'Product Name', 'Quantity Sold', 'Unit Price', 'Total Revenue', 'Buyers']
  ];

  const salesDetailsRows = data.salesDetails.map((item, index) => {
    return [
      index + 1,
      item.productName || 'Unnamed Product',
      item.quantitySold || 0,
      `₱${(item.priceSold || 0).toLocaleString()}`,
      `₱${(item.totalRevenue || 0).toLocaleString()}`,
      item.buyers ? item.buyers.join(', ') : 'N/A',
    ];
  });

  // Add a total row at the bottom of products
  const totalRow = [
    '',
    'TOTAL',
    data.salesDetails.reduce((sum, item) => sum + (item.quantitySold || 0), 0),
    '',
    `₱${data.totalSales.toLocaleString()}`,
    ''
  ];

  const salesDetailsData = [...salesDetailsHeader, ...salesDetailsRows];

  // Add the total row if there's data
  if (salesDetailsRows.length > 0) {
    salesDetailsData.push(['']);
    salesDetailsData.push(totalRow);
  }

  // User purchase details with improved formatting
  const userPurchasesHeader = [
    ['USER PURCHASE DETAILS'],
    [''],
    ['No.', 'User Name', 'Email', 'Total Spent', 'Paid Amount', 'Pay Later Amount']
  ];

  const userPurchasesRows = data.userPurchases.map((user, index) => {
    return [
      index + 1,
      user.userName,
      user.email,
      `₱${user.totalSpent.toLocaleString()}`,
      `₱${user.paidAmount.toLocaleString()}`,
      `₱${user.payLaterAmount.toLocaleString()}`
    ];
  });

  // Add a total row for user purchases
  const userTotalRow = [
    '',
    'TOTAL',
    '',
    `₱${data.totalSales.toLocaleString()}`,
    `₱${data.paidSales.toLocaleString()}`,
    `₱${data.payLaterSales.toLocaleString()}`
  ];

  const userPurchasesData = [...userPurchasesHeader, ...userPurchasesRows];

  // Add the total row if there's data
  if (userPurchasesRows.length > 0) {
    userPurchasesData.push(['']);
    userPurchasesData.push(userTotalRow);
  }

  // Detailed product purchases by user
  const detailedPurchasesHeader = [
    ['DETAILED PRODUCT PURCHASES BY USER'],
    [''],
    ['User', 'Product', 'Quantity', 'Price', 'Total', 'Payment Status', 'Transaction Time']
  ];

  const detailedPurchasesRows = [];
  data.userPurchases.forEach(user => {
    user.products.forEach(product => {
      detailedPurchasesRows.push([
        user.userName,
        product.name,
        product.quantity,
        `₱${product.price.toLocaleString()}`,
        `₱${product.totalPrice.toLocaleString()}`,
        product.paymentStatus,
        product.timestamp ? dayjs(product.timestamp).format('MMM D, YYYY - hh:mm A') : 'N/A'
      ]);
    });
  });

  const detailedPurchasesData = [...detailedPurchasesHeader, ...detailedPurchasesRows];

  // Create a chronological transaction log
  const transactionLogHeader = [
    ['CHRONOLOGICAL TRANSACTION LOG'],
    [''],
    ['Time', 'Product', 'Buyer', 'Quantity', 'Price', 'Total', 'Payment Status']
  ];

  // Collect all transactions with timestamps
  const allTransactions = [];
  data.salesDetails.forEach(product => {
    if (product.transactions && product.transactions.length > 0) {
      product.transactions.forEach(transaction => {
        allTransactions.push({
          timestamp: transaction.timestamp,
          product: product.productName,
          buyer: transaction.buyer,
          quantity: transaction.quantity,
          price: product.priceSold,
          total: product.priceSold * transaction.quantity,
          paymentStatus: transaction.paymentStatus
        });
      });
    }
  });

  // Sort transactions by timestamp
  allTransactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Create transaction log rows
  const transactionLogRows = allTransactions.map(transaction => [
    dayjs(transaction.timestamp).format('MMM D, YYYY - hh:mm:ss A'),
    transaction.product,
    transaction.buyer,
    transaction.quantity,
    `₱${transaction.price.toLocaleString()}`,
    `₱${transaction.total.toLocaleString()}`,
    transaction.paymentStatus
  ]);

  const transactionLogData = [...transactionLogHeader, ...transactionLogRows];

  // Create worksheets
  const ws1 = XLSX.utils.aoa_to_sheet([...reportTitle, ...salesSummary]);
  const ws2 = XLSX.utils.aoa_to_sheet(salesDetailsData);
  const ws3 = XLSX.utils.aoa_to_sheet(userPurchasesData);
  const ws4 = XLSX.utils.aoa_to_sheet(detailedPurchasesData);
  const ws5 = XLSX.utils.aoa_to_sheet(transactionLogData);

  // Set column widths for better readability
  const setCellWidths = (worksheet) => {
    const columnWidths = [
      { wch: 25 }, // A - Time (wider for timestamps)
      { wch: 25 }, // B - Product/Name
      { wch: 25 }, // C - Buyer/Quantity
      { wch: 15 }, // D - Quantity/Price
      { wch: 15 }, // E - Price/Total
      { wch: 15 }, // F - Total/Status
      { wch: 15 }  // G - Status/Extra
    ];
    worksheet['!cols'] = columnWidths;
  };

  setCellWidths(ws1);
  setCellWidths(ws2);
  setCellWidths(ws3);
  setCellWidths(ws4);
  setCellWidths(ws5);

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws1, 'Sales Summary');
  XLSX.utils.book_append_sheet(wb, ws2, 'Products Sold');
  XLSX.utils.book_append_sheet(wb, ws3, 'User Purchases');
  XLSX.utils.book_append_sheet(wb, ws4, 'Detailed Purchases');
  XLSX.utils.book_append_sheet(wb, ws5, 'Transaction Timeline');

  // Generate and save the Excel file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `BSU_Sales_Report_${selectedDate}.xlsx`);

  setSnackbarOpen(true);
};


  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <motion.img
            src={bsuLogo}
            alt="BSU Logo"
            style={{ height: "60px", marginRight: "20px" }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src={cotLogo}
            alt="COT Logo"
            style={{ height: "60px" }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </Box>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            marginBottom: '10px',
            fontWeight: '700',
            background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Sales Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#666',
          }}
        >
          View your store's sales performance and export reports for any day.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Date"
              value={dayjs(selectedDate)}
              onChange={(newValue) => {
                setSelectedDate(newValue.format('YYYY-MM-DD'));
              }}
              format="MMMM D, YYYY"
              sx={{
                maxWidth: 300,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
              disableFuture
            />
          </LocalizationProvider>
        </Box>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                <CircularProgress size={60} sx={{ color: "#1a2a6c" }} />
                <Typography variant="h6" sx={{ marginTop: '20px', color: '#1a2a6c' }}>
                  Loading data, please wait...
                </Typography>
              </Box>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Box sx={{ textAlign: 'center', marginTop: '30px' }}>
                <ErrorIcon sx={{ fontSize: '50px', color: '#b21f1f' }} />
                <Typography variant="h6" sx={{ color: '#b21f1f', marginTop: '10px' }}>
                  {error}
                </Typography>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Grid container spacing={3} sx={{ marginBottom: '30px' }}>
                <Grid item xs={12} sm={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: '16px',
                        background: 'white',
                        color: 'black',
                        padding: '20px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#1a2a6c", width: 56, height: 56, mr: 2 }}>
                        <MonetizationOnIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                          Total Sales
                        </Typography>
                        <Typography variant="h4" sx={{ marginTop: '10px', fontWeight: '600', color: '#1a2a6c' }}>
                          ₱{data.totalSales.toLocaleString()}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: '16px',
                        background: 'white',
                        color: 'black',
                        padding: '20px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#43a047", width: 56, height: 56, mr: 2 }}>
                        <PaymentIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                          Paid Sales
                        </Typography>
                        <Typography variant="h4" sx={{ marginTop: '10px', fontWeight: '600', color: '#43a047' }}>
                          ₱{data.paidSales.toLocaleString()}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: '16px',
                        background: 'white',
                        color: 'black',
                        padding: '20px',
                        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': {
                          transform: 'translateY(-5px)',
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#ff9800", width: 56, height: 56, mr: 2 }}>
                        <HourglassEmptyIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>
                          Pay Later Sales
                        </Typography>
                        <Typography variant="h4" sx={{ marginTop: '10px', fontWeight: '600', color: '#ff9800' }}>
                          ₱{data.payLaterSales.toLocaleString()}
                        </Typography>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
              <Divider sx={{ my: 4, borderColor: '#e0e0e0' }} />
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  backdropFilter: 'blur(10px)',
                  marginTop: '20px',
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                    },
                    '& .Mui-selected': {
                      color: '#1a2a6c',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#1a2a6c',
                      height: 3,
                    }
                  }}
                >
                  <Tab
                    label="Products Sold"
                    icon={<ShoppingCartIcon />}
                    iconPosition="start"
                  />
                  <Tab
                    label="User Purchases"
                    icon={<PersonIcon />}
                    iconPosition="start"
                  />
                </Tabs>

                {/* Products Tab */}
                {tabValue === 0 && (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Typography variant="h6" sx={{ fontWeight: '600', marginBottom: '20px', color: '#1a2a6c' }}>
                      Products Sold
                    </Typography>
                    {data.salesDetails.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6, color: '#aaa' }}>
                        <ErrorIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="body1">No sales data for this date.</Typography>
                      </Box>
                    ) : (
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell>No.</TableCell>
                            <TableCell>Product Name</TableCell>
                            <TableCell>Quantity Sold</TableCell>
                            <TableCell>Price Sold</TableCell>
                            <TableCell>Total Revenue</TableCell>
                            <TableCell>Buyers</TableCell>
                            <TableCell>Transaction Times</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.salesDetails.map((item, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                              }}
                            >
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{item.productName || 'Unnamed Product'}</TableCell>
                              <TableCell>{item.quantitySold}</TableCell>
                              <TableCell>₱{(item.priceSold || 0).toLocaleString()}</TableCell>
                              <TableCell>₱{(item.totalRevenue || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                {item.buyers && item.buyers.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {item.buyers.map((buyer, idx) => (
                                      <Chip
                                        key={idx}
                                        label={buyer}
                                        size="small"
                                        sx={{
                                          backgroundColor: '#1a2a6c',
                                          color: 'white',
                                          fontSize: '0.75rem'
                                        }}
                                      />
                                    ))}
                                  </Box>
                                ) : (
                                  'N/A'
                                )}
                              </TableCell>
                              <TableCell>
                                {item.transactions && item.transactions.length > 0 ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {item.transactions.map((transaction, idx) => (
                                      <Tooltip
                                        key={idx}
                                        title={`${transaction.buyer} - ${transaction.quantity} items - ${transaction.paymentStatus}`}
                                        arrow
                                      >
                                        <Chip
                                          label={dayjs(transaction.timestamp).format('hh:mm A')}
                                          size="small"
                                          sx={{
                                            backgroundColor: transaction.paymentStatus === 'Paid' ? '#e8f5e9' : '#fff3e0',
                                            color: transaction.paymentStatus === 'Paid' ? '#2e7d32' : '#e65100',
                                            fontSize: '0.75rem',
                                            mb: 0.5
                                          }}
                                          icon={transaction.paymentStatus === 'Paid' ?
                                            <AttachMoneyIcon style={{ fontSize: '0.875rem' }} /> :
                                            <AccessTimeIcon style={{ fontSize: '0.875rem' }} />
                                          }
                                        />
                                      </Tooltip>
                                    ))}
                                  </Box>
                                ) : (
                                  'N/A'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </Box>
                )}

                {/* Users Tab */}
                {tabValue === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: '600', marginBottom: '20px', color: '#1a2a6c' }}>
                      User Purchase Details
                    </Typography>
                    {data.userPurchases.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6, color: '#aaa' }}>
                        <ErrorIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="body1">No user purchase data for this date.</Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={3}>
                        {data.userPurchases.map((user, index) => (
                          <Grid item xs={12} key={index}>
                            <Accordion
                              sx={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                '&:before': {
                                  display: 'none',
                                },
                                mb: 2
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                sx={{
                                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                                  borderBottom: '1px solid #eee'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                  <Avatar sx={{ bgcolor: '#1a2a6c', mr: 2 }}>
                                    <PersonIcon />
                                  </Avatar>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                      {user.userName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {user.email}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a2a6c' }}>
                                      ₱{user.totalSpent.toLocaleString()}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Chip
                                        size="small"
                                        label={`Paid: ₱${user.paidAmount.toLocaleString()}`}
                                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: '0.7rem' }}
                                      />
                                      <Chip
                                        size="small"
                                        label={`Pay Later: ₱${user.payLaterAmount.toLocaleString()}`}
                                        sx={{ bgcolor: '#fff3e0', color: '#e65100', fontSize: '0.7rem' }}
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails sx={{ p: 0 }}>
                                <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                                  {user.products.map((product, idx) => (
                                    <ListItem
                                      key={idx}
                                      divider={idx < user.products.length - 1}
                                      sx={{
                                        backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                                        py: 1
                                      }}
                                    >
                                      <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: product.paymentStatus === 'Paid' ? '#4caf50' : '#ff9800' }}>
                                          {product.paymentStatus === 'Paid' ? <AttachMoneyIcon /> : <AccessTimeIcon />}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {product.name}
                                          </Typography>
                                        }
                                        secondary={
                                          <Box>
                                            <Typography variant="body2" component="span">
                                              {product.quantity} x ₱{product.price.toLocaleString()} =
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              component="span"
                                              sx={{
                                                fontWeight: 600,
                                                color: product.paymentStatus === 'Paid' ? '#2e7d32' : '#e65100',
                                                ml: 0.5
                                              }}
                                            >
                                              ₱{product.totalPrice.toLocaleString()}
                                            </Typography>
                                            {product.timestamp && (
                                              <Typography
                                                variant="caption"
                                                display="block"
                                                sx={{
                                                  mt: 0.5,
                                                  color: 'text.secondary',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 0.5
                                                }}
                                              >
                                                <AccessTimeIcon sx={{ fontSize: '0.875rem' }} />
                                                {dayjs(product.timestamp).format('MMM D, YYYY - hh:mm A')}
                                              </Typography>
                                            )}
                                          </Box>
                                        }
                                      />
                                      <Chip
                                        label={product.paymentStatus}
                                        size="small"
                                        sx={{
                                          bgcolor: product.paymentStatus === 'Paid' ? '#e8f5e9' : '#fff3e0',
                                          color: product.paymentStatus === 'Paid' ? '#2e7d32' : '#e65100',
                                        }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </AccordionDetails>
                            </Accordion>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '30px',
                gap: 2
              }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportToExcel}
                    sx={{
                      borderRadius: "12px",
                      padding: "12px 24px",
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      background: "linear-gradient(45deg, #1a2a6c, #b21f1f)",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                      },
                    }}
                    disabled={data.totalSales === 0 && data.paidSales === 0 && data.payLaterSales === 0}
                  >
                    Export to Excel
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{
            width: '100%',
            fontSize: '1rem',
            alignItems: 'center'
          }}
          icon={<DownloadIcon fontSize="inherit" />}
        >
          Sales report for {dayjs(selectedDate).format('MMMM D, YYYY')} has been successfully exported to Excel
        </Alert>
      </Snackbar>
    </motion.div>
  );
}

export default TotalSales;
