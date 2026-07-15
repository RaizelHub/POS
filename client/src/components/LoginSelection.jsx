import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUserCircle, FaArrowLeft, FaBackspace, FaLock,
  FaCheckCircle, FaExclamationTriangle, FaSearch, FaUserPlus,
  FaQuestionCircle
} from 'react-icons/fa';

import { getApiUrl } from '../utils/getApiUrl';
import loginImage from '../images/login.jpg';
import novaLogo from '../images/nova_logo.png';
import Header from './login/Header';
import Footer from './login/Footer';
import CashierCard from './login/CashierCard';
import NumericKeypad from './login/NumericKeypad';
import ForgotPinModal from './login/ForgotPinModal';
import LoadingSkeleton from './login/LoadingSkeleton';
import CorporateHub from './login/CorporateHub';

const LoginSelectionPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isForgotPin, setIsForgotPin] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [isHelpDeskOpen, setIsHelpDeskOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('pinReset') === 'true') {
      setSnackbarMessage('PIN reset successful!');
      setTimeout(() => setSnackbarMessage(null), 4000);
    }
    fetchUsers();
  }, [location]);

  // Physical keyboard support
  useEffect(() => {
    if (!selectedUser || isForgotPin) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 6) {
          setPin(prev => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (pin.length === 6) {
          submitPin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser, pin, isForgotPin]);

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
    } else {
      setError('This cashier is not verified. Please verify email first.');
      setTimeout(() => setError(null), 4000);
    }
  };

  const submitPin = async (currentPin) => {
    if (loading) return;

    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email, pin: currentPin }),
      });

      if (!res.ok) throw new Error('Invalid PIN or login failed.');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSnackbarMessage(`Welcome back, ${data.user.firstname}!`);
      setTimeout(() => {
        setSnackbarMessage(null);
        navigate('/scan', {
          state: { userId: data.user._id, firstname: data.user.firstname },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length === 6) {
      submitPin(pin);
    }
  };

  const handleForgotPinSubmit = async (enteredEmail, enteredEmployeeId) => {
    if (!enteredEmail) {
      setResetError('Please enter a valid email address.');
      return;
    }

    if (enteredEmail !== selectedUser.email) {
      setResetError('Email does not match the selected user.');
      return;
    }

    const cashierNum = `C-${selectedUser._id.substring(selectedUser._id.length - 4).toUpperCase()}`;
    if (enteredEmployeeId && enteredEmployeeId.toUpperCase() !== cashierNum) {
      setResetError('Employee ID does not match selected profile.');
      return;
    }

    try {
      setLoading(true);
      setResetError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/forgot-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.email }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      setSnackbarMessage('Reset link sent to your email!');
      setTimeout(() => {
        closeModal();
        setSnackbarMessage(null);
      }, 1500);
    } catch (error) {
      setResetError('There was an issue resetting the PIN.');
      setSnackbarMessage('Error resetting PIN.');
      setTimeout(() => setSnackbarMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadPress = (val) => {
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (val === 'enter') {
      handlePinSubmit();
    } else {
      if (pin.length < 6) {
        setPin(prev => prev + val);
      }
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setPin('');
    setError(null);
    setIsForgotPin(false);
  };

  // Filter Cashier Lists
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstname || ''} ${user.lastname || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center font-sans text-slate-300 antialiased selection:bg-teal-500/20 selection:text-teal-400 overflow-hidden relative">

      {/* Radial Glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Success/Error toasts */}
      <AnimatePresence>
        {snackbarMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 bg-slate-900 border border-teal-550/30 text-teal-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-bold"
          >
            <FaCheckCircle className="text-teal-400 text-sm" />
            <span>{snackbarMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Screen Workspace Grid */}
      <div className="w-full h-full bg-slate-950 grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* Left Side Branding & Retail Visual (Full Screen Left Panel) */}
        <div className="hidden lg:block lg:col-span-5 h-full relative overflow-hidden">
          <img
            src={loginImage}
            alt="Retail Store Visual"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-between p-10 text-white border-r border-slate-900/60">

            {/* Top Logo */}
            <div className="flex items-center gap-2.5">
              <img
                src={novaLogo}
                alt="SUELTO Logo"
                className="h-10 w-auto object-contain rounded-xl shadow-sm"
              />
              <div className="text-left">
                <h2 className="font-extrabold text-white text-base leading-none tracking-tight">SUELTO POS</h2>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Retail Station Terminal</p>
              </div>
            </div>

            {/* Middle Active Workstation Corporate Hub */}
            <div className="flex-1 my-6 overflow-y-auto pr-2 no-scrollbar max-h-[68vh]">
              <CorporateHub theme="dark" />
            </div>

            {/* Bottom Slogan */}
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Suelto Workstation Client
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between overflow-y-auto bg-slate-50 h-full border-l border-slate-200">

          {/* Header info */}
          <Header theme="light" onHelpDeskClick={() => setIsHelpDeskOpen(true)} />

          {/* Main changing view */}
          <div className="flex-grow flex flex-col justify-center max-w-[500px] w-full mx-auto py-8">
            <motion.div
              layout
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-slate-800 relative overflow-hidden border-t-2 border-t-teal-700/80"
            >
              <AnimatePresence mode="wait">
                {!selectedUser ? (
                  /* CASHIER LIST / SELECTION TAB */
                  <motion.div
                    key="cashier-selection"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                        <FaLock className="text-sm" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">Cashier Authentication</h2>
                        <p className="text-slate-450 text-[10.5px] mt-1.5 font-medium">Select your cash management profile to continue</p>
                      </div>
                    </div>

                    {/* Search box filter */}
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search cashier profile..."
                        className="w-full bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl pl-9 pr-4 py-3 outline-none transition-all focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Cashiers list body */}
                    {loading ? (
                      <LoadingSkeleton />
                    ) : filteredUsers.length > 0 ? (
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                        {filteredUsers.map((user) => (
                          <CashierCard
                            key={user._id}
                            user={user}
                            isSelected={false}
                            onClick={() => handleUserClick(user)}
                            theme="light"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                        <FaUserCircle className="text-slate-450 text-4xl mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800">No Cashiers Found</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs mx-auto">
                          There are no cash management profiles registered matching that search. Create one to log in.
                        </p>
                        <Link
                          to="/register"
                          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg shadow transition-all active:scale-95 uppercase tracking-wide"
                        >
                          <FaUserPlus /> Register Cashier
                        </Link>
                      </div>
                    )}

                    {error && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                        <FaExclamationTriangle className="text-rose-500" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Bottom options redirect */}
                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500">Need to register a store?</span>
                      <Link to="/register" className="text-teal-700 hover:text-teal-600 hover:underline transition-colors">
                        Register Account
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  /* PIN AUTHENTICATION SCREEN */
                  <motion.div
                    key="pin-authentication"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >

                    {/* Selected cashier banner */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                          <img
                            src={selectedUser.image ? (selectedUser.image.startsWith('http') ? selectedUser.image : `${getApiUrl()}/${selectedUser.image}`) : ''}
                            alt={selectedUser.firstname}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left leading-none">
                          <h4 className="font-extrabold text-slate-800 text-xs">{selectedUser.firstname} {selectedUser.lastname}</h4>
                          <span className="text-slate-500 text-[10px] font-mono">{selectedUser.email}</span>
                        </div>
                      </div>

                      <button
                        onClick={closeModal}
                        className="text-[10px] font-extrabold text-slate-450 hover:text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all active:scale-95 uppercase tracking-wide"
                      >
                        <FaArrowLeft className="text-[8px]" /> Back
                      </button>
                    </div>

                    {/* PIN field header */}
                    <div className="text-center space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-base tracking-tight">Key in security PIN</h3>
                      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Enter your 6-digit terminal PIN</p>
                    </div>

                    {/* PIN Display Indicators */}
                    <div className="space-y-4">
                      {/* Password bullets dots container */}
                      <div className="flex justify-center gap-3 py-1">
                        {[...Array(6)].map((_, idx) => {
                          const hasChar = idx < pin.length;
                          return (
                            <motion.div
                              key={idx}
                              animate={{ scale: hasChar ? 1.15 : 1 }}
                              className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 flex items-center justify-center ${hasChar
                                ? 'bg-teal-700 border-teal-700 shadow-md shadow-teal-700/20'
                                : 'bg-slate-50 border-slate-200'
                                }`}
                            >
                              {hasChar && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                            </motion.div>
                          );
                        })}
                      </div>

                      {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                          <FaExclamationTriangle className="text-rose-500" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>

                    {/* Touchscreen keypad overlay */}
                    <NumericKeypad onKeyPress={handleKeypadPress} theme="light" />

                    {/* Submit and Forgot options */}
                    <div className="space-y-3">
                      <button
                        onClick={handlePinSubmit}
                        disabled={pin.length < 6 || loading}
                        className="w-full h-14 bg-teal-700 hover:bg-teal-600 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-98 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Signing In...' : 'Verify & Launch Workstation'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsForgotPin(true)}
                        className="w-full text-center text-[10px] font-extrabold text-slate-400 hover:text-teal-700 transition-colors uppercase tracking-wider block"
                      >
                        Forgot cashier security PIN?
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Footer info */}
          <Footer theme="light" />

        </div>

      </div>

      {/* Forgot PIN Slide-up Modal */}
      <AnimatePresence>
        {isForgotPin && (
          <ForgotPinModal
            isOpen={isForgotPin}
            onClose={() => setIsForgotPin(false)}
            onSubmit={handleForgotPinSubmit}
            selectedUser={selectedUser}
            loading={loading}
            resetError={resetError}
          />
        )}
      </AnimatePresence>

      {/* Help Desk Modal Dialog */}
      <AnimatePresence>
        {isHelpDeskOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-[650px] w-full shadow-2xl space-y-6 text-left relative text-white border-t-4 border-t-teal-500"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-950/50 border border-teal-900/40 flex items-center justify-center text-teal-400">
                    <FaQuestionCircle className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-white leading-none tracking-tight">Workstation Support Desk</h3>
                    <p className="text-[10.5px] text-slate-450 mt-1.5 font-semibold uppercase tracking-wider">Secure Terminal Guide & Hotkeys</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHelpDeskOpen(false)}
                  className="bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all active:scale-95"
                >
                  Close
                </button>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin">
                
                {/* Hardware Troubleshooting */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-extrabold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                    Workstation Troubleshooting
                  </h4>
                  
                  <div className="space-y-3 text-[11px]">
                    <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                      <span className="block font-bold text-slate-200">Thermal Printer is Offline</span>
                      <p className="text-slate-400 mt-1 leading-normal">Verify the USB cable is connected. Toggle the power switch located at the back-right. Ensure paper roll is feeding from the bottom.</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                      <span className="block font-bold text-slate-200">Barcode Scanner Fails to Scan</span>
                      <p className="text-slate-400 mt-1 leading-normal">Position barcodes 10-15cm from the laser array. Clean the scanner glass using a dry microfiber cloth to remove smudges.</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl">
                      <span className="block font-bold text-slate-200">RJ11 Cash Drawer Not Triggering</span>
                      <p className="text-slate-400 mt-1 leading-normal">Confirm that the RJ11 cable is plugged directly into the back-left port of the thermal printer (not the computer).</p>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts & Support */}
                <div className="space-y-5">
                  
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-extrabold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                      Cashier Hotkeys (Checkout Screen)
                    </h4>
                    
                    <div className="space-y-2 font-mono text-[10.5px]">
                      <div className="flex items-center justify-between p-2 bg-slate-950/30 border border-slate-850 rounded-lg">
                        <span className="text-slate-400 font-bold uppercase">Focus Catalog Search</span>
                        <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-[10px] font-sans font-bold shadow-sm">F1</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-950/30 border border-slate-850 rounded-lg">
                        <span className="text-slate-400 font-bold uppercase">Tender Exact Cash</span>
                        <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-[10px] font-sans font-bold shadow-sm">F2</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-950/30 border border-slate-850 rounded-lg">
                        <span className="text-slate-400 font-bold uppercase">Reprint Last Invoice</span>
                        <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-[10px] font-sans font-bold shadow-sm">F3</kbd>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-950/30 border border-slate-850 rounded-lg">
                        <span className="text-slate-400 font-bold uppercase">Cancel / Clear Cart</span>
                        <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 text-[10px] font-sans font-bold shadow-sm">ESC</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[11px] font-extrabold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
                      Support Escalations
                    </h4>
                    
                    <div className="p-4 bg-teal-950/20 border border-teal-900/40 rounded-xl space-y-2 text-[10.5px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Branch Manager Line:</span>
                        <span className="font-bold text-teal-400 font-mono">EXT 805</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">IT Systems Hotline:</span>
                        <span className="font-bold text-teal-400 font-mono">EXT 104</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default LoginSelectionPage;
