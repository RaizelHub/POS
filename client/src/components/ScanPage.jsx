import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaShoppingCart, FaTrash, FaUserCircle, FaEdit, FaBarcode, FaSignOutAlt, FaCheckCircle, FaClock, FaPlus, FaMinus, FaSearch, FaChevronRight, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../config';
import novaLogo from '../images/nova_logo.png';
import {
  Box,
  Button,
  Typography,
  Modal,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  completeDraft,
  createActiveDraftId,
  createDraftId,
  DRAFT_TYPES,
  fetchDraftsRemote,
  getDraftsForUserLocal,
  mergeDraftLists,
  saveDraft,
  saveDraftLocal,
  syncPendingDrafts,
} from '../utils/draftStorage';
import TransactionsLedger from './TransactionsLedger';

function ScanPage() {
  const [user, setUser] = useState(null);
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const [paidItems, setPaidItems] = useState([]);
  const [payLaterItems, setPayLaterItems] = useState([]);
  const [selectedPayLaterItem, setSelectedPayLaterItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef();
  const [loading, setLoading] = useState(true);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [restoreDrafts, setRestoreDrafts] = useState([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const cartRecoveryReadyRef = useRef(false);
  const cartSaveTimerRef = useRef(null);

  // Redesign filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Shift state
  const [activeShift, setActiveShift] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [startingCash, setStartingCash] = useState(1000);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [endingCash, setEndingCash] = useState(0);

  // Cash Adjustment drawer states
  const [showCashAdjustmentModal, setShowCashAdjustmentModal] = useState(false);
  const [cashAdjustmentType, setCashAdjustmentType] = useState('Cash-In');
  const [cashAdjustmentAmount, setCashAdjustmentAmount] = useState(0);
  const [cashAdjustmentReason, setCashAdjustmentReason] = useState('');
  const [loggingAdjustment, setLoggingAdjustment] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Customer & Loyalty state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  const handleCustomerSearch = async (val) => {
    setCustomerSearchQuery(val);
    if (!val.trim()) {
      setCustomerResults([]);
      return;
    }
    try {
      const res = await fetch(`${config.apiUrl}/api/customers/search?query=${val}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerResults(data);
      }
    } catch (err) {
      console.error("Error searching customers:", err);
    }
  };

  const handleLogCashAdjustment = async () => {
    if (!activeShift) {
      setSnackbarMessage("Error: No active shift started.");
      setSnackbarOpen(true);
      return;
    }
    if (cashAdjustmentAmount <= 0) {
      setSnackbarMessage("Error: Amount must be greater than zero.");
      setSnackbarOpen(true);
      return;
    }
    if (!cashAdjustmentReason.trim()) {
      setSnackbarMessage("Error: A reason is required.");
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoggingAdjustment(true);
      const res = await fetch(`${config.apiUrl}/api/shifts/${activeShift._id}/cash-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: user._id,
          type: cashAdjustmentType,
          amount: Number(cashAdjustmentAmount),
          reason: cashAdjustmentReason
        })
      });

      if (res.ok) {
        setSnackbarMessage("Cash drawer adjustment logged successfully!");
        setSnackbarOpen(true);
        setShowCashAdjustmentModal(false);
      } else {
        const errData = await res.json();
        setSnackbarMessage(`Error: ${errData.message || 'Failed to log adjustment.'}`);
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error("Error logging cash adjustment:", err);
      setSnackbarMessage("Error connecting to server.");
      setSnackbarOpen(true);
    } finally {
      setLoggingAdjustment(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    try {
      const res = await fetch(`${config.apiUrl}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustomerName,
          phone: newCustomerPhone,
          email: newCustomerEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create customer.");
      }
      setSelectedCustomer(data.customer);
      setShowAddCustomerModal(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerEmail('');
      setCustomerSearchQuery('');
      setCustomerResults([]);
      setSnackbarMessage("Customer profile registered successfully!");
      setSnackbarOpen(true);
      setError('');
    } catch (err) {
      console.error("Error registering customer:", err);
      setError(err.message);
    }
  };

  const checkActiveShift = async (userId) => {
    try {
      const res = await fetch(`${config.apiUrl}/api/shifts/active/${userId}`);
      if (res.ok) {
        const shiftData = await res.json();
        if (shiftData) {
          setActiveShift(shiftData);
          localStorage.setItem('activeShiftId', shiftData._id);
          setShowShiftModal(false);
        } else {
          setActiveShift(null);
          localStorage.removeItem('activeShiftId');
          setShowShiftModal(true);
        }
      }
    } catch (err) {
      console.error("Error checking active shift:", err);
    }
  };

  const handleOpenShift = async () => {
    if (!user?._id || startingCash === undefined || startingCash < 0) {
      setError('Please enter a valid starting cash float.');
      return;
    }
    try {
      const response = await fetch(`${config.apiUrl}/api/shifts/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashierId: user._id,
          cashierName: `${user.firstname} ${user.lastname}`,
          startingCash: Number(startingCash),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to open shift.');
      }
      setActiveShift(data.shift);
      localStorage.setItem('activeShiftId', data.shift._id);
      setShowShiftModal(false);
      setSnackbarMessage('Shift started successfully!');
      setSnackbarOpen(true);
      setError('');
    } catch (err) {
      console.error('Error starting shift:', err);
      setError(err.message);
    }
  };

  const handleCloseShift = async () => {
    const shiftId = activeShift?._id;
    if (!shiftId || endingCash === undefined || endingCash < 0) {
      setError('Please enter a valid ending cash amount.');
      return;
    }
    try {
      const response = await fetch(`${config.apiUrl}/api/shifts/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId,
          endingCash: Number(endingCash),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to close shift.');
      }
      setActiveShift(null);
      localStorage.removeItem('activeShiftId');
      setShowCloseShiftModal(false);
      setSnackbarMessage(`Shift closed successfully! Discrepancy: ₱${data.discrepancy.toFixed(2)}`);
      setSnackbarOpen(true);
      setError('');
      // Trigger new shift dialog
      setShowShiftModal(true);
    } catch (err) {
      console.error('Error closing shift:', err);
      setError(err.message);
    }
  };

  // Fetch user data and transactions
  const fetchUserData = async () => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      console.error('No user data found in localStorage');
      navigate('/login-selection');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      await fetchTransactions(parsedUser._id);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login-selection');
    }
  };

  const fetchTransactions = async (userId) => {
    setLoading(true);

    try {
      const response = await fetch(`${config.apiUrl}/api/${userId}/transactions`);

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      console.log('Fetched Transactions:', data);

      if (data?.paid && data?.payLater) {
        const paidItems = data.paid.filter(item => item.paymentStatus === 'Paid');
        const payLaterItems = data.payLater.filter(item => item.paymentStatus === 'Pay Later');

        setPaidItems(paidItems);
        setPayLaterItems(payLaterItems);
      } else {
        console.error('Invalid response structure:', data);
        setPaidItems([]);
        setPayLaterItems([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setPaidItems([]);
      setPayLaterItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login-selection');
      return;
    }

    if (user) {
      fetchTransactions(user._id);
      fetchAvailableProducts();
      checkActiveShift(user._id);
    } else {
      fetchUserData();
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user?._id) return;

    let isCancelled = false;

    const loadRecoverableDrafts = async () => {
      try {
        const localDrafts = await getDraftsForUserLocal(user._id);
        let remoteDrafts = [];

        if (navigator.onLine) {
          try {
            remoteDrafts = await fetchDraftsRemote(user._id);
            await Promise.all(remoteDrafts.map((draft) => saveDraftLocal(draft)));
            await syncPendingDrafts(user._id);
          } catch (error) {
            console.error('Unable to fetch server drafts:', error);
          }
        }

        const drafts = mergeDraftLists(localDrafts, remoteDrafts).filter(
          (draft) => (draft.cartItems || []).length > 0
        );

        if (!isCancelled && drafts.length > 0 && cart.length === 0) {
          setRestoreDrafts(drafts);
          setShowRestoreModal(true);
        }
      } catch (error) {
        console.error('Unable to load recoverable drafts:', error);
      } finally {
        cartRecoveryReadyRef.current = true;
      }
    };

    const handleOnline = () => {
      syncPendingDrafts(user._id).catch((error) => console.error('Unable to sync drafts:', error));
    };

    loadRecoverableDrafts();
    window.addEventListener('online', handleOnline);

    return () => {
      isCancelled = true;
      window.removeEventListener('online', handleOnline);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || !cartRecoveryReadyRef.current || cart.length === 0) return;

    if (cartSaveTimerRef.current) {
      clearTimeout(cartSaveTimerRef.current);
    }

    cartSaveTimerRef.current = setTimeout(() => {
      saveDraft({
        userId: user._id,
        draftType: DRAFT_TYPES.SAVED_CART,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.SAVED_CART),
        cartItems: cart,
        totals: {
          subtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
          itemCount: cart.reduce((total, item) => total + item.quantity, 0),
        },
        metadata: { source: 'scan-page-auto-save' },
      }).catch((error) => console.error('Unable to auto-save cart:', error));
    }, 500);

    return () => {
      if (cartSaveTimerRef.current) {
        clearTimeout(cartSaveTimerRef.current);
      }
    };
  }, [cart, user?._id]);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchProductDetails();
    }
  };

  const fetchProductDetails = async () => {
    const trimmedBarcode = barcode.trim();

    if (!trimmedBarcode) {
      setError('Please scan or enter a valid barcode.');
      return;
    }

    console.log('Attempting to fetch product with barcode:', trimmedBarcode);

    try {
      const response = await fetch(`${config.apiUrl}/api/products/barcode/${encodeURIComponent(trimmedBarcode)}`);

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || 'Product not found!');
      }

      const product = await response.json();
      console.log('Successfully fetched product:', product);

      if (product.quantity <= 0) {
        setError(`${product.name} is out of stock.`);
        return;
      }

      addToCart(product);

      setSnackbarMessage(`${product.name} (₱${product.price.toFixed(2)}) added to cart!`);
      setSnackbarOpen(true);
      setError('');
    } catch (error) {
      console.error('Error fetching product:', error);
      const errorMessage = error.message || 'Failed to fetch product details. Please try again.';
      setError(errorMessage);
      setSnackbarMessage(`Error: ${errorMessage}`);
      setSnackbarOpen(true);
    } finally {
      setBarcode('');
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingProductIndex = prevCart.findIndex(item => item.product._id === product._id);

      if (existingProductIndex >= 0) {
        const currentQtyInCart = prevCart[existingProductIndex].quantity;
        if (currentQtyInCart >= product.quantity) {
          setError(`Cannot add more of ${product.name}. Only ${product.quantity} in stock.`);
          setSnackbarMessage(`Warning: Only ${product.quantity} in stock.`);
          setSnackbarOpen(true);
          return prevCart;
        }
        const updatedCart = [...prevCart];
        updatedCart[existingProductIndex].quantity += 1;
        return updatedCart;
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product._id === productId) {
          const maxQuantity = item.product.quantity;
          const safeQuantity = Math.min(newQuantity, maxQuantity);
          return { ...item, quantity: safeQuantity };
        }
        return item;
      });
    });
  };

  const proceedToCheckout = () => {
    if (!activeShift) {
      setError('You must start a shift to proceed.');
      setSnackbarMessage('Error: Start a cashier shift first.');
      setSnackbarOpen(true);
      setShowShiftModal(true);
      return;
    }
    if (cart.length === 0) {
      setError('Your cart is empty. Please scan or select products first.');
      return;
    }

    navigate('/payment', {
      state: {
        cart,
        draftType: DRAFT_TYPES.SAVED_CART,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.SAVED_CART),
        shiftId: activeShift._id,
        customer: selectedCustomer,
      },
    });
  };

  const handleHoldOrder = async () => {
    if (!user?._id || cart.length === 0) {
      setError('Your cart is empty. Please scan or select products first.');
      return;
    }

    try {
      await saveDraft({
        userId: user._id,
        draftType: DRAFT_TYPES.HELD_ORDER,
        draftId: createDraftId(DRAFT_TYPES.HELD_ORDER),
        status: 'held',
        cartItems: cart,
        totals: {
          subtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
          itemCount: cart.reduce((total, item) => total + item.quantity, 0),
        },
        metadata: { source: 'scan-page-hold-order' },
      });

      await completeDraft({
        userId: user._id,
        draftType: DRAFT_TYPES.SAVED_CART,
        draftId: createActiveDraftId(user._id, DRAFT_TYPES.SAVED_CART),
      });

      setCart([]);
      setSnackbarMessage('Order held successfully.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Unable to hold order:', error);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleRestoreDraft = (draft) => {
    const draftCart = draft.cartItems || [];
    setCart(draftCart);
    setShowRestoreModal(false);

    if (draft.draftType === DRAFT_TYPES.DRAFT_SALE) {
      navigate('/payment', {
        state: {
          cart: draftCart,
          draftType: draft.draftType,
          draftId: draft.draftId,
          paymentSelection: draft.paymentSelection,
        },
      });
      return;
    }

    setSnackbarMessage('Previous transaction restored.');
    setSnackbarOpen(true);
  };

  const fetchAvailableProducts = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setAvailableProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAvailableProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (user?._id) {
      navigate(`/edit-profile/${user._id}`);
    }
  };

  const handleLogout = () => {
    const purchasedData = localStorage.getItem('purchasedData');
    localStorage.clear();
    if (purchasedData) {
      localStorage.setItem('purchasedData', purchasedData);
    }
    navigate('/login-selection');
  };

  const handlePayLaterClick = (item) => {
    setSelectedPayLaterItem(item);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!activeShift) {
      setError('You must start a shift to proceed.');
      setSnackbarMessage('Error: Start a cashier shift first.');
      setSnackbarOpen(true);
      setShowShiftModal(true);
      return;
    }
    if (!selectedPayLaterItem) return;

    const payload = {
      userId: user?._id,
      itemId: selectedPayLaterItem?._id,
      shiftId: activeShift?._id,
    };

    try {
      const response = await fetch(`${config.apiUrl}/api/transactions/pay-later/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm payment.');
      }

      const data = await response.json();
      setPayLaterItems((prev) => prev.filter((i) => i._id !== selectedPayLaterItem._id));
      setPaidItems((prev) => [...prev, selectedPayLaterItem]);
      setShowPaymentModal(false);

      const itemName = selectedPayLaterItem.name;
      const itemPrice = selectedPayLaterItem.price.toFixed(2);
      setSelectedPayLaterItem(null);

      setSnackbarMessage(`Payment successful! ₱${itemPrice} paid for ${itemName}`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error confirming payment:', error.message);
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  // Redesign custom logic: Filter product list by category and search query
  const filteredProducts = availableProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={novaLogo} alt="SUELTO Logo" className="h-8 w-auto object-contain rounded-lg" />
          <h1 className="font-bold text-slate-900 tracking-tight text-lg">
            SUELTO POS Console
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleEditProfile}
            className="flex items-center gap-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 px-3 py-1.5 rounded-lg transition-all"
          >
            {user?.image ? (
              <img src={user.image} alt="User" className="w-7 h-7 rounded-full object-cover border border-slate-200" />
            ) : (
              <FaUserCircle className="text-slate-400 text-lg" />
            )}
            <span className="text-sm font-medium text-slate-700">{user?.firstname} {user?.lastname}</span>
          </button>
          {activeShift && (
            <>
              <button
                onClick={() => setShowLedgerModal(true)}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:bg-slate-50 border border-slate-250 hover:border-slate-355 px-3 py-2 rounded-lg font-semibold transition-all active:scale-95"
              >
                <FaReceipt />
                <span>Ledger & Credits</span>
              </button>
              <button
                onClick={() => {
                  setCashAdjustmentAmount(0);
                  setCashAdjustmentReason('');
                  setCashAdjustmentType('Cash-In');
                  setShowCashAdjustmentModal(true);
                }}
                className="flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100/80 px-3 py-2 rounded-lg font-semibold transition-all border border-teal-200 active:scale-95"
              >
                <FaMoneyBillWave />
                <span>Drawer Adjust</span>
              </button>
              <button
                onClick={() => {
                  setEndingCash(0);
                  setShowCloseShiftModal(true);
                }}
                className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100/80 px-3 py-2 rounded-lg font-semibold transition-all border border-amber-200 active:scale-95"
              >
                <FaClock />
                <span>Close Shift</span>
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 px-3 py-1.5 rounded-lg font-medium transition-all"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Panel: Catalog (Span 8) */}
        <section className="lg:col-span-8 space-y-6">

          {/* Product Catalog Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <FaBox className="text-slate-600 text-lg" />
                <h2 className="font-semibold text-slate-900 text-lg">Product Catalog</h2>
              </div>

              {/* Catalog Search & Category Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-3 text-slate-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search name or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 w-[200px] transition-all"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 border border-slate-200 rounded-lg">
                  {['all', 'drinks', 'junkfood', 'others'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${activeCategory === cat
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="flex-1 overflow-y-auto max-h-[550px] pr-1">
              {productsLoading ? (
                <div className="flex justify-center items-center py-20"><CircularProgress /></div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.quantity <= 0;
                    const isLowStock = product.quantity <= (product.lowStockThreshold || 5) && !isOutOfStock;

                    return (
                      <div
                        key={product._id}
                        onClick={() => {
                          if (!isOutOfStock) {
                            addToCart(product);
                            setSnackbarMessage(`${product.name} added to cart.`);
                            setSnackbarOpen(true);
                            setError('');
                          } else {
                            setError(`${product.name} is out of stock.`);
                            setSnackbarMessage(`Error: ${product.name} is out of stock.`);
                            setSnackbarOpen(true);
                          }
                        }}
                        className={`flex gap-4 p-4 border rounded-xl transition-all ${isOutOfStock
                          ? 'bg-slate-50/50 border-slate-100 cursor-not-allowed opacity-60'
                          : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-slate-300 cursor-pointer hover:shadow-sm'
                          }`}
                      >
                        {/* Image */}
                        <div className="w-[70px] h-[70px] bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <FaBox className="text-slate-300 text-2xl" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800 truncate text-sm">{product.name}</h4>
                            <span className="text-xs text-slate-400 font-mono block mt-0.5">BC: {product.barcode}</span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isOutOfStock
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : isLowStock
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low Stock: ${product.quantity}` : `Stock: ${product.quantity}`}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex flex-col justify-between items-end flex-shrink-0">
                          <span className="font-bold text-slate-900 text-base">₱{product.price.toFixed(2)}</span>
                          <span className="text-slate-400 text-xs flex items-center gap-0.5 hover:text-slate-700 transition-colors">
                            Add <FaChevronRight className="text-[10px]" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  <FaBox className="mx-auto text-4xl mb-4 text-slate-300" />
                  <p className="text-sm">No products found matching your filters.</p>
                </div>
              )}
            </div>
          </div>

        </section>

        {/* Right Panel: Checkout Panel (Span 4) */}
        <section className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-[calc(100vh-140px)] sticky top-24 overflow-hidden">

          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <FaShoppingCart className="text-slate-700 text-lg" />
            <h2 className="font-semibold text-slate-900 text-lg">Active Order</h2>
          </div>

          {/* Barcode / Scan Input Field */}
          <div className="relative mb-5 flex-shrink-0">
            <FaBarcode className="absolute left-3.5 top-3.5 text-slate-400 text-lg" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Scan barcode or enter manually (Enter)"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-sm bg-slate-50 focus:bg-white transition-all font-mono placeholder:font-sans"
            />
            {error && (
              <span className="text-red-500 text-xs block mt-1.5 font-medium pl-1">{error}</span>
            )}
          </div>

          {/* Customer Selection Field */}
          <div className="mb-4 flex-shrink-0 relative">
            {selectedCustomer ? (
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs">👤 {selectedCustomer.name}</h4>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">Points: {selectedCustomer.loyaltyPoints} | Phone: {selectedCustomer.phone || 'N/A'}</span>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-white w-6 h-6 border border-slate-200/60 shadow-sm rounded-full flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Assign Customer</label>
                  <button
                    onClick={() => {
                      setError('');
                      setShowAddCustomerModal(true);
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    + Register Profile
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by phone number or name..."
                    value={customerSearchQuery}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 focus:border-slate-350 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white transition-all"
                  />
                  {customerResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-[150px] overflow-y-auto z-20 divide-y divide-slate-50">
                      {customerResults.map((cust) => (
                        <div
                          key={cust._id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCustomerSearchQuery('');
                            setCustomerResults([]);
                          }}
                          className="px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-semibold text-slate-700">{cust.name}</span>
                          <span className="text-slate-400 font-medium font-mono">{cust.phone || 'No Phone'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Cart list scroll wrapper */}
          <div className="flex-1 overflow-y-auto border-t border-b border-slate-100 py-4 space-y-3 scrollbar-thin">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.product._id} className="flex gap-3 bg-slate-50 border border-slate-100 rounded-lg p-3">
                  {/* Cart Thumbnail */}
                  <div className="w-[50px] h-[50px] bg-white border border-slate-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaBox className="text-slate-300" />
                    )}
                  </div>

                  {/* Info and Quantity Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h5 className="font-semibold text-slate-800 text-xs truncate">{item.product.name}</h5>
                      <span className="text-slate-400 text-[10px]">₱{item.product.price.toFixed(2)} each</span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => updateCartItemQuantity(item.product._id, item.quantity - 1)}
                        className="w-6 h-6 border border-slate-200 hover:border-slate-300 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all active:scale-95"
                      >
                        <FaMinus className="text-[9px]" />
                      </button>
                      <span className="text-slate-800 text-xs font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.quantity}
                        className="w-6 h-6 border border-slate-200 hover:border-slate-300 rounded bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                      >
                        <FaPlus className="text-[9px]" />
                      </button>
                    </div>
                  </div>

                  {/* Total and Trash */}
                  <div className="text-right flex flex-col justify-between items-end flex-shrink-0 min-w-[70px]">
                    <span className="font-bold text-slate-800 text-sm">₱{(item.product.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-all"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="h-full flex flex-col justify-center items-center py-20 text-slate-400 text-center">
                <FaShoppingCart className="text-4xl mb-3 text-slate-300" />
                <h4 className="font-medium text-sm text-slate-500">Cart is Empty</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Scan a barcode or click catalog products to add them to this order.</p>
              </div>
            )}
          </div>

          {/* Pricing Totals & Checkout Button */}
          <div className="pt-4 mt-auto flex-shrink-0 space-y-4">
            <div className="flex justify-between items-center text-slate-800">
              <span className="text-sm font-medium">Cart Subtotal:</span>
              <span className="text-lg font-bold text-slate-900">₱{cartTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleHoldOrder}
                disabled={cart.length === 0}
                className="w-full py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                Hold Order
              </button>
              <button
                onClick={proceedToCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-teal-700 hover:bg-teal-650 text-white font-bold rounded-lg text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* Recover Drafts Modal */}
      <Modal
        open={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        aria-labelledby="restore-transaction-title"
      >
        <Box
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg max-w-[500px] w-[92%] p-6 focus:outline-none"
        >
          <h3 id="restore-transaction-title" className="font-bold text-slate-900 text-lg mb-1">
            Restore Previous Transaction
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Held orders and saved carts were found. Select an order to resume.
          </p>

          <div className="border border-slate-100 rounded-lg overflow-hidden max-h-[300px] overflow-y-auto mb-4 space-y-1 pr-1 scrollbar-thin">
            {restoreDrafts.map((draft, idx) => {
              const draftCart = draft.cartItems || [];
              const total = draftCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
              const label = draft.draftType === DRAFT_TYPES.HELD_ORDER ? "Held Order" : "Saved Cart";

              return (
                <div key={draft.localKey || draft.draftId} className="flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-sm">
                  <div>
                    <h5 className="font-semibold text-slate-800">{label} ({draftCart.length} item{draftCart.length === 1 ? '' : 's'})</h5>
                    <span className="text-xs text-slate-400 font-medium">Total: ₱{total.toFixed(2)} | {new Date(draft.updatedAt).toLocaleTimeString()}</span>
                  </div>
                  <button
                    onClick={() => handleRestoreDraft(draft)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-all active:scale-95"
                  >
                    Restore
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowRestoreModal(false)}
              className="text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors"
            >
              Continue Without Restoring
            </button>
          </div>
        </Box>
      </Modal>

      {/* Pay Later Payment Confirmation Modal */}
      <Modal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        aria-labelledby="payment-modal-title"
      >
        <Box
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg max-w-[400px] w-[90%] p-6 focus:outline-none"
        >
          <h3 id="payment-modal-title" className="font-bold text-slate-900 text-lg mb-3">
            Confirm Payment Settlement
          </h3>
          {selectedPayLaterItem && (
            <div className="space-y-4 mb-6">
              <p className="text-sm text-slate-500">
                Proceeding will change payment status to Paid for:
              </p>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-850 truncate mr-2">{selectedPayLaterItem.name}</span>
                <span className="text-slate-900 font-bold">₱{selectedPayLaterItem.price.toFixed(2)}</span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-slate-500 hover:text-slate-800 font-semibold text-sm px-3 py-1.5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              className="bg-teal-700 hover:bg-teal-655 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-all active:scale-95 shadow-sm"
            >
              Confirm Settlement
            </button>
          </div>
        </Box>
      </Modal>

      {/* Open Shift Modal */}
      <Modal
        open={showShiftModal}
        onClose={(event, reason) => {
          if (activeShift) {
            setShowShiftModal(false);
          }
        }}
        aria-labelledby="shift-modal-title"
        disableEscapeKeyDown={!activeShift}
      >
        <Box
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg max-w-[450px] w-[90%] p-6 focus:outline-none border border-slate-200"
        >
          <h3 id="shift-modal-title" className="font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
            🚀 Initialize Cashier Shift
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Before scanning items or collecting payments, please declare the starting cash float in your drawer.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-650 text-xs rounded-lg p-3 mb-4 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Cashier Operator
              </label>
              <input
                type="text"
                disabled
                value={user ? `${user.firstname} ${user.lastname}` : 'Loading...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Starting Cash Float (₱)
              </label>
              <input
                type="number"
                min="0"
                value={startingCash}
                onChange={(e) => setStartingCash(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                placeholder="Enter starting cash, e.g. 1000"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {!activeShift && (
              <button
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 font-semibold text-sm px-3.5 py-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                Logout
              </button>
            )}
            <button
              onClick={handleOpenShift}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all active:scale-95 shadow-sm"
            >
              Start Active Shift
            </button>
          </div>
        </Box>
      </Modal>

      {/* Close Shift Modal */}
      <Modal
        open={showCloseShiftModal}
        onClose={() => setShowCloseShiftModal(false)}
        aria-labelledby="close-shift-title"
      >
        <Box
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg max-w-[450px] w-[90%] p-6 focus:outline-none border border-slate-200"
        >
          <h3 id="close-shift-title" className="font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
            🛑 Close Cashier Shift
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Record ending cash in your physical drawer to calculate shift sales reconciliation logs.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-650 text-xs rounded-lg p-3 mb-4 font-medium">
              {error}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-250/60 rounded-xl p-4 mb-5 text-sm space-y-2.5">
            <div className="flex justify-between items-center text-slate-650 text-xs font-semibold">
              <span>Shift Started</span>
              <span className="text-slate-850 font-bold font-mono">
                {activeShift ? new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-650 text-xs font-semibold">
              <span>Opening Float</span>
              <span className="text-slate-850 font-bold">
                ₱{activeShift ? activeShift.startingCash.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-650 text-xs font-semibold">
              <span>Logged Transactions</span>
              <span className="text-slate-850 font-bold">
                {activeShift ? activeShift.transactionsCount : 0}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Physical Cash in Drawer (₱)
              </label>
              <input
                type="number"
                min="0"
                value={endingCash}
                onChange={(e) => setEndingCash(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                placeholder="Enter ending drawer cash"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCloseShiftModal(false)}
              className="text-slate-500 hover:bg-slate-50 font-semibold text-sm px-3.5 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCloseShift}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-all active:scale-95 shadow-sm"
            >
              Confirm Close Shift
            </button>
          </div>
        </Box>
      </Modal>

      {/* Register Customer Modal */}
      <Modal
        open={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        aria-labelledby="add-customer-title"
      >
        <Box
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg max-w-[450px] w-[90%] p-6 focus:outline-none border border-slate-200"
        >
          <h3 id="add-customer-title" className="font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
            👤 Register Customer Profile
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Create a profile to log loyalty points and purchase stats.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-650 text-xs rounded-lg p-3 mb-4 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                placeholder="e.g. 09123456789"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                placeholder="e.g. customer@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="text-slate-500 hover:bg-slate-50 font-semibold text-sm px-3.5 py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomer}
              className="bg-teal-700 hover:bg-teal-650 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Register Customer
            </button>
          </div>
        </Box>
      </Modal>

      {/* Cash Drawer Adjustments Modal */}
      <Modal
        open={showCashAdjustmentModal}
        onClose={() => !loggingAdjustment && setShowCashAdjustmentModal(false)}
        aria-labelledby="cash-adjust-title"
      >
        <Box
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg max-w-[450px] w-[90%] p-6 focus:outline-none border border-slate-200"
        >
          <h3 id="cash-adjust-title" className="font-extrabold text-slate-900 text-lg mb-1 flex items-center gap-2">
            💵 Cash Drawer Adjustment
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Record mid-shift cash transactions (change drop-in, coin load, supplier payouts).
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Adjustment Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCashAdjustmentType('Cash-In')}
                  className={`flex-1 py-2.5 border rounded-lg text-xs font-bold transition-all ${cashAdjustmentType === 'Cash-In' ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-350'}`}
                >
                  Cash-In (Deposit)
                </button>
                <button
                  type="button"
                  onClick={() => setCashAdjustmentType('Cash-Out')}
                  className={`flex-1 py-2.5 border rounded-lg text-xs font-bold transition-all ${cashAdjustmentType === 'Cash-Out' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-350'}`}
                >
                  Cash-Out (Payout)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Amount (₱) *
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={cashAdjustmentAmount || ''}
                onChange={(e) => setCashAdjustmentAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Reason *
              </label>
              <input
                type="text"
                value={cashAdjustmentReason}
                onChange={(e) => setCashAdjustmentReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-all"
                placeholder="e.g. Change replenishment, supplier payment"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCashAdjustmentModal(false)}
              disabled={loggingAdjustment}
              className="text-slate-500 hover:bg-slate-50 font-semibold text-sm px-3.5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleLogCashAdjustment}
              disabled={loggingAdjustment}
              className={`text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 ${cashAdjustmentType === 'Cash-In' ? 'bg-teal-700 hover:bg-teal-650' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {loggingAdjustment ? 'Logging...' : 'Submit Log'}
            </button>
          </div>
        </Box>
      </Modal>

      {/* Fullscreen Ledger Modal */}
      <Modal
        open={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        aria-labelledby="ledger-title"
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(248, 250, 252, 0.98)',
          }
        }}
      >
        <Box
          className="absolute inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl p-6 focus:outline-none border border-slate-200 overflow-y-auto"
        >
          <TransactionsLedger isModalView={true} limitToCashierId={user?._id} onClose={() => setShowLedgerModal(false)} />
        </Box>
      </Modal>

      {/* Enhanced Snackbar Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes('Error') ? "error" : "success"}
          variant="filled"
          sx={{
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );
}

export default ScanPage;
