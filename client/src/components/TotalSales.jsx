import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Snackbar,
  CircularProgress,
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
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const reportTitle = [
      ['SUELTO RETAIL SYSTEMS - OFFICIAL SALES REPORT'],
      ['SALES REPORT'],
      [''],
      ['Report Generated:', dayjs().format('MMMM D, YYYY, h:mm A')],
      ['Report Period:', dayjs(selectedDate).format('MMMM D, YYYY')],
      ['']
    ];

    const salesSummary = [
      ['SALES SUMMARY'],
      [''],
      ['Category', 'Amount', 'Percentage'],
      ['Total Sales', `₱${data.totalSales.toLocaleString()}`, '100%'],
      ['Paid Sales', `₱${data.paidSales.toLocaleString()}`,
        data.totalSales > 0 ? `${((data.paidSales / data.totalSales) * 105).toFixed(2)}%` : '0%'],
      ['Pay Later Sales', `₱${data.payLaterSales.toLocaleString()}`,
        data.totalSales > 0 ? `${((data.payLaterSales / data.totalSales) * 105).toFixed(2)}%` : '0%'],
      ['']
    ];

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

    const totalRow = [
      '',
      'TOTAL',
      data.salesDetails.reduce((sum, item) => sum + (item.quantitySold || 0), 0),
      '',
      `₱${data.totalSales.toLocaleString()}`,
      ''
    ];

    const salesDetailsData = [...salesDetailsHeader, ...salesDetailsRows];

    if (salesDetailsRows.length > 0) {
      salesDetailsData.push(['']);
      salesDetailsData.push(totalRow);
    }

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

    const userTotalRow = [
      '',
      'TOTAL',
      '',
      `₱${data.totalSales.toLocaleString()}`,
      `₱${data.paidSales.toLocaleString()}`,
      `₱${data.payLaterSales.toLocaleString()}`
    ];

    const userPurchasesData = [...userPurchasesHeader, ...userPurchasesRows];

    if (userPurchasesRows.length > 0) {
      userPurchasesData.push(['']);
      userPurchasesData.push(userTotalRow);
    }

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

    const transactionLogHeader = [
      ['CHRONOLOGICAL TRANSACTION LOG'],
      [''],
      ['Time', 'Product', 'Buyer', 'Quantity', 'Price', 'Total', 'Payment Status']
    ];

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

    allTransactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

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

    const ws1 = XLSX.utils.aoa_to_sheet([...reportTitle, ...salesSummary]);
    const ws2 = XLSX.utils.aoa_to_sheet(salesDetailsData);
    const ws3 = XLSX.utils.aoa_to_sheet(userPurchasesData);
    const ws4 = XLSX.utils.aoa_to_sheet(detailedPurchasesData);
    const ws5 = XLSX.utils.aoa_to_sheet(transactionLogData);

    const setCellWidths = (worksheet) => {
      const columnWidths = [
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];
      worksheet['!cols'] = columnWidths;
    };

    setCellWidths(ws1);
    setCellWidths(ws2);
    setCellWidths(ws3);
    setCellWidths(ws4);
    setCellWidths(ws5);

    XLSX.utils.book_append_sheet(wb, ws1, 'Sales Summary');
    XLSX.utils.book_append_sheet(wb, ws2, 'Products Sold');
    XLSX.utils.book_append_sheet(wb, ws3, 'User Purchases');
    XLSX.utils.book_append_sheet(wb, ws4, 'Detailed Purchases');
    XLSX.utils.book_append_sheet(wb, ws5, 'Transaction Timeline');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `SUELTO_Sales_Report_${selectedDate}.xlsx`);

    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto font-sans text-slate-800 space-y-6">
      
      {/* Title & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sales Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Filter sales transactions and export data tables.</p>
        </div>

        <div className="flex items-center gap-3">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Report Date"
              value={dayjs(selectedDate)}
              onChange={(newValue) => {
                setSelectedDate(newValue.format('YYYY-MM-DD'));
              }}
              format="MMMM D, YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  sx: {
                    maxWidth: 240,
                    backgroundColor: 'white',
                  }
                }
              }}
              disableFuture
            />
          </LocalizationProvider>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <CircularProgress />
            <span className="text-slate-500 font-medium text-sm">Fetching report data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            <ErrorIcon className="text-4xl mb-2" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            
            {/* Stats Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Total sales */}
              <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <Avatar className="bg-slate-100 text-slate-800 w-12 h-12 rounded-lg">
                  <MonetizationOnIcon />
                </Avatar>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Sales</span>
                  <span className="text-xl font-bold text-slate-900 block mt-0.5">₱{data.totalSales.toLocaleString()}</span>
                </div>
              </motion.div>

              {/* Paid sales */}
              <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <Avatar className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-lg">
                  <PaymentIcon />
                </Avatar>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Paid Cash/Digital</span>
                  <span className="text-xl font-bold text-slate-900 block mt-0.5">₱{data.paidSales.toLocaleString()}</span>
                </div>
              </motion.div>

              {/* Pay later */}
              <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
                <Avatar className="bg-amber-50 text-amber-600 w-12 h-12 rounded-lg">
                  <HourglassEmptyIcon />
                </Avatar>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Credit / Pay Later</span>
                  <span className="text-xl font-bold text-slate-900 block mt-0.5">₱{data.payLaterSales.toLocaleString()}</span>
                </div>
              </motion.div>

            </div>

            {/* Main Tabs Details Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  mb: 4,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '14px', color: '#64748b' },
                  '& .Mui-selected': { color: '#0f172a' },
                  '& .MuiTabs-indicator': { backgroundColor: '#0f172a', height: 2.5 }
                }}
              >
                <Tab label="Products Sold" icon={<ShoppingCartIcon className="text-sm" />} iconPosition="start" />
                <Tab label="User Purchases" icon={<PersonIcon className="text-sm" />} iconPosition="start" />
                <Tab label="Visual Analytics" icon={<BarChartIcon className="text-sm" />} iconPosition="start" />
              </Tabs>

              {/* Products Sold list tab */}
              {tabValue === 0 && (
                <div className="overflow-x-auto pr-1 scrollbar-thin">
                  {data.salesDetails.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ErrorIcon className="text-4xl mb-2 text-slate-300" />
                      <p className="text-sm">No products sold recorded for this date.</p>
                    </div>
                  ) : (
                    <Table size="medium" sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow className="bg-slate-50">
                          <TableCell className="font-bold text-xs uppercase text-slate-500">No.</TableCell>
                          <TableCell className="font-bold text-xs uppercase text-slate-500">Product Name</TableCell>
                          <TableCell className="font-bold text-xs uppercase text-slate-500">Qty Sold</TableCell>
                          <TableCell className="font-bold text-xs uppercase text-slate-500">Unit Price</TableCell>
                          <TableCell className="font-bold text-xs uppercase text-slate-500">Total revenue</TableCell>
                          <TableCell className="font-bold text-xs uppercase text-slate-500">Cashier Buyers</TableCell>
                          <TableCell className="font-bold text-xs uppercase text-slate-500">Timestamps</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.salesDetails.map((item, idx) => (
                          <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <TableCell className="text-slate-600 text-xs font-semibold">{idx + 1}</TableCell>
                            <TableCell className="text-slate-800 text-sm font-semibold">{item.productName || 'Unnamed'}</TableCell>
                            <TableCell className="text-slate-700 text-sm font-medium">{item.quantitySold}</TableCell>
                            <TableCell className="text-slate-700 text-sm font-semibold">₱{item.priceSold?.toLocaleString()}</TableCell>
                            <TableCell className="text-slate-900 text-sm font-bold">₱{item.totalRevenue?.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {item.buyers && item.buyers.map((b, bidx) => (
                                  <span key={bidx} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {item.transactions && item.transactions.map((t, tidx) => (
                                  <Tooltip key={tidx} title={`${t.buyer} - ${t.paymentStatus}`}>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border inline-flex items-center gap-1 font-semibold max-w-[80px] ${
                                      t.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                      {t.paymentStatus === 'Paid' ? <AttachMoneyIcon className="text-[10px]" /> : <AccessTimeIcon className="text-[10px]" />}
                                      {dayjs(t.timestamp).format('hh:mm A')}
                                    </span>
                                  </Tooltip>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}

              {/* User purchases list tab */}
              {tabValue === 1 && (
                <div>
                  {data.userPurchases.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ErrorIcon className="text-4xl mb-2 text-slate-300" />
                      <p className="text-sm">No purchases recorded for this date.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.userPurchases.map((userPurchase, idx) => (
                        <Accordion key={idx} elevation={0} className="border border-slate-200 rounded-xl overflow-hidden before:hidden">
                          <AccordionSummary expandIcon={<ExpandMoreIcon className="text-slate-400" />} className="bg-slate-50 hover:bg-slate-100/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar className="bg-slate-900 text-white w-9 h-9">
                                <PersonIcon />
                              </Avatar>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">{userPurchase.userName}</h4>
                                <span className="text-slate-400 text-xs">{userPurchase.email}</span>
                              </div>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails className="p-4 bg-white border-t border-slate-100 space-y-3">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="border border-slate-250 bg-slate-50/50 rounded-lg p-2.5">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Spent Today</span>
                                <span className="text-sm font-bold text-slate-800 mt-1 block">₱{userPurchase.totalSpent.toLocaleString()}</span>
                              </div>
                              <div className="border border-slate-250 bg-emerald-50/30 rounded-lg p-2.5">
                                <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Paid Share</span>
                                <span className="text-sm font-bold text-emerald-600 mt-1 block">₱{userPurchase.paidAmount.toLocaleString()}</span>
                              </div>
                              <div className="border border-slate-250 bg-amber-50/30 rounded-lg p-2.5">
                                <span className="text-[10px] text-amber-700 uppercase font-semibold block">Unpaid Share</span>
                                <span className="text-sm font-bold text-amber-600 mt-1 block">₱{userPurchase.payLaterAmount.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="border border-slate-100 rounded-lg overflow-hidden space-y-0.5 divide-y divide-slate-100">
                              {userPurchase.products.map((p, pidx) => (
                                <div key={pidx} className="flex justify-between items-center p-3 text-xs bg-white">
                                  <div>
                                    <span className="font-semibold text-slate-800 text-xs block">{p.name}</span>
                                    <span className="text-slate-400 block mt-0.5">{p.quantity} items | {dayjs(p.timestamp).format('hh:mm:ss A')}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900">₱{p.totalPrice.toLocaleString()}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                      p.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                    }`}>
                                      {p.paymentStatus}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Visual Analytics charts tab */}
              {tabValue === 2 && (
                <div>
                  {data.salesDetails.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ErrorIcon className="text-4xl mb-2 text-slate-300" />
                      <p className="text-sm">No sales data available for this date to chart.</p>
                    </div>
                  ) : (
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={8}>
                        <Card elevation={0} className="border border-slate-200 rounded-xl p-4">
                          <CardContent>
                            <h4 className="font-bold text-slate-900 text-sm mb-4">Product Revenue & Volume</h4>
                            <div className="w-full h-[300px]">
                              <ResponsiveContainer>
                                <BarChart
                                  data={data.salesDetails.map(item => ({
                                    name: (item.productName || '').length > 12 ? (item.productName || '').slice(0, 10) + '...' : (item.productName || ''),
                                    Revenue: item.totalRevenue || 0,
                                    Quantity: item.quantitySold || 0
                                  }))}
                                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} />
                                  <YAxis yAxisId="left" orientation="left" stroke="#0f172a" label={{ value: 'Revenue (₱)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: '11px', fill: '#64748b' } }} style={{ fontSize: '11px' }} />
                                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Qty Sold', angle: 90, position: 'insideRight', offset: 0, style: { fontSize: '11px', fill: '#64748b' } }} style={{ fontSize: '11px' }} />
                                  <ChartTooltip formatter={(value, name) => [name === 'Revenue (₱)' ? `₱${value.toLocaleString()}` : value, name]} />
                                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                  <Bar yAxisId="left" dataKey="Revenue" fill="#0f172a" name="Revenue (₱)" radius={[4, 4, 0, 0]} />
                                  <Bar yAxisId="right" dataKey="Quantity" fill="#10b981" name="Quantity Sold" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Card elevation={0} className="border border-slate-200 rounded-xl p-4 h-full flex flex-col justify-between">
                          <CardContent className="flex flex-col items-center justify-center flex-1">
                            <h4 className="font-bold text-slate-900 text-sm mb-4 align-self-start w-full">Payment breakdown</h4>
                            {data.paidSales === 0 && data.payLaterSales === 0 ? (
                              <div className="text-slate-400 py-10 text-xs">No split data to display.</div>
                            ) : (
                              <>
                                <div className="w-full h-[180px] flex justify-center items-center">
                                  <ResponsiveContainer>
                                    <PieChart>
                                      <Pie
                                        data={[
                                          { name: 'Paid Sales', value: data.paidSales },
                                          { name: 'Pay Later', value: data.payLaterSales }
                                        ].filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                      >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#f59e0b" />
                                      </Pie>
                                      <ChartTooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="space-y-2.5 w-full mt-4 border-t border-slate-50 pt-4">
                                  <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                      <span className="font-medium text-slate-500">Paid Sales</span>
                                    </div>
                                    <span className="font-bold text-slate-900">₱{data.paidSales.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                      <span className="font-medium text-slate-500">Pay Later</span>
                                    </div>
                                    <span className="font-bold text-slate-900">₱{data.payLaterSales.toLocaleString()}</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  )}
                </div>
              )}

            </div>

            {/* Export Report Actions Footer */}
            <div className="flex justify-center pt-4">
              <button
                disabled={data.totalSales === 0 && data.paidSales === 0 && data.payLaterSales === 0}
                onClick={handleExportToExcel}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow active:scale-98 disabled:cursor-not-allowed"
              >
                <DownloadIcon className="text-base" />
                <span>Export Report to Excel</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ borderRadius: '12px', fontSize: '13px', fontWeight: '500' }}
        >
          Sales report for {dayjs(selectedDate).format('MMMM D, YYYY')} has been exported!
        </Alert>
      </Snackbar>

    </div>
  );
}

export default TotalSales;
