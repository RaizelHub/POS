import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaArrowLeft, FaBarcode, FaTags, FaExchangeAlt, FaLock } from 'react-icons/fa';
import { getApiUrl } from '../utils/getApiUrl';
import novaLogo from '../images/nova_logo.png';

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
      setTimeout(() => setSnackbarMessage(null), 4000);
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
      setTimeout(() => setError(null), 4000);
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

  const closeModal = () => {
    setSelectedUser(null);
    setPin('');
    setError(null);
    setIsForgotPin(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased">
      
      {/* Left side: Premium branding & marketing illustration panel */}
      <div className="w-full md:w-[420px] bg-slate-900 text-slate-350 p-8 flex flex-col justify-between border-r border-slate-800">
        
        {/* Top Logo marker */}
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:bg-slate-800 p-2 rounded-lg transition-all text-slate-400 hover:text-white">
            <FaArrowLeft />
          </Link>
          <div className="flex items-center gap-2">
            <img src={novaLogo} alt="SUELTO Logo" className="h-8 w-auto object-contain rounded-lg" />
            <span className="font-bold text-slate-100 tracking-tight text-base">
              SUELTO POS
            </span>
          </div>
        </div>

        {/* Branding summary text */}
        <div className="space-y-6 my-12 md:my-0">
          <div className="flex items-center gap-4">
            <img src={novaLogo} alt="SUELTO Logo" className="h-14 w-auto object-contain rounded-xl shadow-sm" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Workstation Login
          </h2>
          <p className="text-xs leading-relaxed text-slate-400">
            Please select your cashier profile from the dashboard list and key in your 6-digit PIN code to initialize terminal operations.
          </p>

          {/* Quick instructions bullet points */}
          <div className="space-y-3.5 pt-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2.5">
              <FaBarcode className="text-slate-500" />
              <span>Real-time Barcode scanning enabled</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FaTags className="text-slate-500" />
              <span>Low-stock warnings configured</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FaExchangeAlt className="text-slate-500" />
              <span>Multi-payment split checkouts ready</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-500 font-medium">
          © 2026 SUELTO POS System. SUELTO Retail Operations.
        </div>
      </div>

      {/* Right side: PIN Pad or Cashier profiles list container */}
      <div className="flex-1 bg-slate-50 p-6 md:p-12 flex flex-col justify-center items-center">
        
        {/* Alert banners if any */}
        {snackbarMessage && (
          <div className="mb-6 w-full max-w-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-2">
            <FaCheckCircle className="text-emerald-500" />
            <span>{snackbarMessage}</span>
          </div>
        )}

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm">
          
          <AnimatePresence mode="wait">
            {!selectedUser ? (
              /* Cashier Selection view */
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-slate-900 text-lg">Select Cashier</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Click your cashier profile card to enter PIN</p>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => handleUserClick(user)}
                          className="w-full flex items-center gap-3.5 p-3.5 border border-slate-200 hover:border-slate-350 rounded-xl text-left bg-white hover:bg-slate-50 transition-all hover:translate-x-0.5 active:scale-99"
                        >
                          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center bg-slate-50">
                            {user.image ? (
                              <img
                                src={user.image.startsWith('http') ? user.image : `${getApiUrl()}/${user.image}`}
                                alt={user.firstname}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUserCircle className="text-slate-400 text-lg" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 text-sm block truncate">
                              {user.firstname} {user.lastname}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                              {user.email}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <FaUserCircle className="mx-auto text-3xl mb-2 text-slate-300" />
                        <p className="text-xs">No cashier profiles created yet.</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Need to create an account?</span>
                  <Link to="/register" className="font-bold text-slate-900 hover:underline">
                    Register Store
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* PIN entry screen */
              <motion.div
                key="pin-pad"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* Header Back & Profile avatar */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeModal}
                    className="hover:bg-slate-100 p-2 rounded-lg text-slate-500 hover:text-slate-800 transition-all border border-slate-200"
                  >
                    <FaArrowLeft className="text-xs" />
                  </button>
                  <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src={selectedUser.image ? (selectedUser.image.startsWith('http') ? selectedUser.image : `${getApiUrl()}/${selectedUser.image}`) : ''}
                      alt={selectedUser.firstname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{selectedUser.firstname} {selectedUser.lastname}</h4>
                    <span className="text-slate-400 text-[10px] block truncate">{selectedUser.email}</span>
                  </div>
                </div>

                {!isForgotPin ? (
                  /* PIN keypad section */
                  <div className="space-y-5">
                    <div className="text-center">
                      <h4 className="font-bold text-slate-950 text-base">Key in security PIN</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Please provide your 6-digit cashier PIN</p>
                    </div>

                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        if (numericValue.length <= 6) setPin(numericValue);
                      }}
                      placeholder="••••••"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      className="w-full py-3 border-2 border-slate-200 focus:border-slate-400 focus:outline-none rounded-xl text-center text-xl font-bold tracking-[8px] bg-slate-50 focus:bg-white transition-all"
                    />

                    {/* Circle Indicators */}
                    <div className="flex justify-center gap-2">
                      {[...Array(6)].map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                            idx < pin.length ? 'bg-slate-900 scale-110' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2.5 rounded-lg text-xs font-medium text-center">
                        {error}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={closeModal}
                        className="py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg text-xs transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePinSubmit}
                        disabled={pin.length < 6 || loading}
                        className="py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold rounded-lg text-xs transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Submitting...' : 'Login'}
                      </button>
                    </div>

                    <button
                      onClick={() => setIsForgotPin(true)}
                      className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline transition-colors pt-2 block"
                    >
                      Forgot cashier security PIN?
                    </button>
                  </div>
                ) : (
                  /* Forgot PIN password reset requester */
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-950 text-base">Security PIN Reset</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Please specify your account email address to send reset instructions</p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-semibold text-slate-500 block uppercase">Account Email</label>
                      <input
                        type="email"
                        placeholder="cashier@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white transition-all font-semibold"
                      />
                    </div>

                    {resetError && (
                      <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2.5 rounded-lg text-xs font-medium text-center">
                        {resetError}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setIsForgotPin(false)}
                        className="py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-lg text-xs transition-all active:scale-95"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleForgotPin}
                        disabled={loading}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Request PIN link'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}

export default LoginSelectionPage;
