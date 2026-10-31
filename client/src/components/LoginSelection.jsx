import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaTimes, FaExclamationTriangle, FaCheckCircle, FaUserPlus } from 'react-icons/fa';

import { getApiUrl } from '../utils/getApiUrl';
import RegisterHeader from './login/RegisterHeader';
import CashierRow from './login/CashierRow';
import RegisterKeypad from './login/RegisterKeypad';
import WorkstationDossier from './login/WorkstationDossier';
import RegisterHelpModal from './login/RegisterHelpModal';
import RegisterForgotPinModal from './login/RegisterForgotPinModal';

const LoginSelectionPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [isForgotPin, setIsForgotPin] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      setError(null);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/cashiers/login-directory`);
      if (!res.ok) {
        throw new Error(`Service returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch cashiers:', err);
      setFetchError('Unable to reach cashier service. Please verify your connection.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('pinReset') === 'true') {
      setSnackbarMessage('PIN reset completed successfully.');
      setTimeout(() => setSnackbarMessage(null), 4000);
    }
    fetchUsers();
  }, [location, fetchUsers]);

  // Submit PIN for authentication
  const submitPin = useCallback(async (currentPin) => {
    if (submitting || !selectedUser) return;

    try {
      setSubmitting(true);
      setError(null);
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser._id, pin: currentPin }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Incorrect PIN or cashier verification failed.');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSnackbarMessage(`Welcome, ${data.user.firstname}. Register unlocking…`);
      setTimeout(() => {
        navigate('/scan', {
          state: { userId: data.user._id, firstname: data.user.firstname },
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your PIN.');
      setPin('');
    } finally {
      setSubmitting(false);
    }
  }, [selectedUser, submitting, navigate]);

  // Hardware keyboard entry support
  useEffect(() => {
    if (!selectedUser || isForgotPin || isHelpOpen) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 6) {
          setPin((prev) => {
            const next = prev + e.key;
            if (next.length === 6) {
              setTimeout(() => submitPin(next), 50);
            }
            return next;
          });
          setError(null);
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
        setError(null);
      } else if (e.key === 'Enter') {
        if (pin.length === 6) {
          submitPin(pin);
        }
      } else if (e.key === 'Escape') {
        setSelectedUser(null);
        setPin('');
        setError(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser, pin, isForgotPin, isHelpOpen, submitPin]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setPin('');
    setError(null);
    setIsForgotPin(false);
  };

  const handleKeypadPress = (val) => {
    if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      setError(null);
    } else if (val === 'enter') {
      if (pin.length === 6) {
        submitPin(pin);
      }
    } else {
      if (pin.length < 6) {
        const next = pin + val;
        setPin(next);
        setError(null);
        if (next.length === 6) {
          setTimeout(() => submitPin(next), 100);
        }
      }
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setPin('');
    setError(null);
    setIsForgotPin(false);
  };

  const handleForgotPinSubmit = async (enteredEmail, enteredEmployeeId) => {
    if (!enteredEmail) {
      setResetError('Please enter a valid account email.');
      return;
    }

    const cashierNum = selectedUser
      ? `C-${selectedUser._id.substring(selectedUser._id.length - 4).toUpperCase()}`
      : '';
    if (enteredEmployeeId && enteredEmployeeId.toUpperCase() !== cashierNum) {
      setResetError('Employee code does not match this cashier profile.');
      return;
    }

    try {
      setSubmitting(true);
      setResetError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/forgot-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: enteredEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to request reset instructions.');
      }

      setSnackbarMessage('PIN reset instructions sent to registered email.');
      setTimeout(() => {
        setIsForgotPin(false);
        setSnackbarMessage(null);
      }, 2000);
    } catch (err) {
      setResetError(err.message || 'Error processing PIN reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Cashier Lists cleanly
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = `${u.firstname || ''} ${u.lastname || ''}`.toLowerCase();
      const station = (u.station || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      const id = (u._id || '').toLowerCase();
      return name.includes(q) || station.includes(q) || role.includes(q) || id.includes(q);
    });
  }, [users, searchQuery]);

  // Determine mutually exclusive directory state
  let directoryView = 'ready';
  if (loading) {
    directoryView = 'loading';
  } else if (fetchError) {
    directoryView = 'error';
  } else if (users.length === 0) {
    directoryView = 'empty';
  } else if (filteredUsers.length === 0) {
    directoryView = 'no_search_results';
  }

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#252924] font-sans antialiased flex flex-col selection:bg-[#252924] selection:text-[#FFFFFF]">
      {/* Toast notification */}
      {snackbarMessage && (
        <div
          role="status"
          className="fixed top-16 right-6 z-50 bg-[#252924] text-white px-4 py-3 rounded border border-[#DDDCD4] flex items-center gap-2.5 text-xs font-medium shadow-none animate-fadeIn"
        >
          <FaCheckCircle className="text-[#B55E42] text-sm shrink-0" />
          <span>{snackbarMessage}</span>
        </div>
      )}

      {/* Slim Global Architectural Header */}
      <RegisterHeader
        onHelpClick={() => setIsHelpOpen(true)}
        isServiceConnected={!fetchError}
      />

      {/* Main Unified Editorial Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start">
          
          {/* LEFT COLUMN: Main Staff Directory (Span 7) */}
          <section className="lg:col-span-7 xl:col-span-7 space-y-6">
            
            {/* Editorial Heading Unit */}
            <div className="space-y-2 border-b border-[#DDDCD4] pb-5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B55E42]">
                  01 / STAFF ACCESS
                </span>
                <span className="h-px w-8 bg-[#DDDCD4]" />
              </div>
              <h1 className="font-serif sm:font-sans text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[#252924] leading-[1.1]">
                Who's on the register?
              </h1>
              <p className="text-sm text-[#6C716A] leading-relaxed pt-1">
                Select your cashier profile to begin a sales session.
              </p>
            </div>

            {/* Substantial, Accessible Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6C716A] pointer-events-none">
                <FaSearch className="text-xs" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, station, or ID…"
                aria-label="Search cashiers"
                className="w-full h-11 pl-10 pr-20 bg-[#FFFFFF] border border-[#DDDCD4] rounded text-xs text-[#252924] placeholder:text-[#6C716A] focus:outline-none focus:border-[#B55E42] focus:ring-1 focus:ring-[#B55E42] transition-colors font-medium"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-[#6C716A] hover:text-[#252924] rounded"
                    aria-label="Clear search"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
                {!loading && !fetchError && (
                  <span className="font-mono text-[10px] text-[#6C716A] bg-[#F5F3ED] px-2 py-0.5 rounded border border-[#DDDCD4]">
                    {filteredUsers.length} available
                  </span>
                )}
              </div>
            </div>

            {/* MUTUALLY EXCLUSIVE DIRECTORY STATES */}

            {/* 1. Loading State */}
            {directoryView === 'loading' && (
              <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded p-8 text-center space-y-4">
                <div className="w-6 h-6 border-2 border-[#B55E42] border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm text-[#252924]">Loading cashier profiles</h3>
                  <p className="text-xs text-[#6C716A]">Establishing secure connection with the branch directory…</p>
                </div>
              </div>
            )}

            {/* 2. Fetch Error State (Mutual exclusion: No zero count displayed!) */}
            {directoryView === 'error' && (
              <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded p-7 text-center space-y-4">
                <div className="w-10 h-10 rounded bg-[#FDF2F2] border border-[#FCA5A5] text-[#B91C1C] flex items-center justify-center mx-auto">
                  <FaExclamationTriangle className="text-sm" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="font-bold text-sm text-[#252924]">Unable to load cashiers</h3>
                  <p className="text-xs text-[#6C716A] leading-relaxed">
                    We couldn't reach the service. Try again or check network connectivity.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-[#252924] hover:bg-[#B55E42] text-white rounded text-xs font-semibold tracking-wide transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            )}

            {/* 3. Empty State (Zero cashiers registered) */}
            {directoryView === 'empty' && (
              <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded p-8 text-center space-y-4">
                <div className="w-10 h-10 rounded bg-[#F3E8E1] border border-[#DDDCD4] text-[#B55E42] flex items-center justify-center mx-auto">
                  <FaUserPlus className="text-sm" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <h3 className="font-bold text-sm text-[#252924]">No cashier profiles available</h3>
                  <p className="text-xs text-[#6C716A] leading-relaxed">
                    There are currently no active cashier accounts configured for this store branch. An authorized administrator must register staff accounts.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin-login')}
                    className="px-4 py-2 bg-[#252924] hover:bg-[#B55E42] text-white rounded text-xs font-semibold tracking-wide transition-colors"
                  >
                    Open Manager Portal →
                  </button>
                </div>
              </div>
            )}

            {/* 4. Search Returned No Matches */}
            {directoryView === 'no_search_results' && (
              <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded p-8 text-center space-y-3">
                <h3 className="font-bold text-sm text-[#252924]">No matching cashier</h3>
                <p className="text-xs text-[#6C716A] max-w-sm mx-auto">
                  No staff profile matches "{searchQuery}". Check spelling or search by station.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-1.5 border border-[#DDDCD4] bg-[#FFFFFF] hover:bg-[#F5F3ED] text-[#252924] rounded text-xs font-semibold transition-colors"
                  >
                    Clear Search Filter
                  </button>
                </div>
              </div>
            )}

            {/* 5. Ready State: Structured Cashier Directory Rows */}
            {directoryView === 'ready' && (
              <div
                className="space-y-2 max-h-[500px] overflow-y-auto pr-1"
                role="list"
                aria-label="Available cashiers"
              >
                {filteredUsers.map((user) => (
                  <CashierRow
                    key={user._id}
                    user={user}
                    isSelected={selectedUser?._id === user._id}
                    onSelect={handleUserSelect}
                  />
                ))}
              </div>
            )}

            {/* Understated Directory Footer Note */}
            <div className="pt-2 text-center sm:text-left text-[11px] font-mono text-[#6C716A]">
              Terminal ID: SUELTO-REG-01 · Active Hardware Node
            </div>
          </section>

          {/* RIGHT COLUMN: PIN Entry or Workstation Dossier (Span 5) */}
          <section className="lg:col-span-5 xl:col-span-5">
            {!selectedUser ? (
              /* When no user is selected: Terminal Dossier */
              <WorkstationDossier />
            ) : (
              /* When user is selected: The PIN Terminal */
              <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded p-6 sm:p-7 space-y-6">
                
                {/* Active Cashier Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-[#DDDCD4]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded border border-[#DDDCD4] bg-[#F3E8E1] text-[#B55E42] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {selectedUser.firstname?.charAt(0)}
                      {selectedUser.lastname?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-[#252924] block truncate">
                        {selectedUser.firstname} {selectedUser.lastname}
                      </span>
                      <span className="font-mono text-[10px] text-[#6C716A] block">
                        {selectedUser.role ? selectedUser.role.toUpperCase() : 'CASHIER'} · {selectedUser.station || 'POS-01'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="text-[11px] font-mono font-semibold text-[#6C716A] hover:text-[#B55E42] border border-[#DDDCD4] hover:bg-[#F5F3ED] px-2.5 py-1 rounded transition-colors"
                  >
                    ← Switch
                  </button>
                </div>

                {/* PIN Header */}
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#B55E42]">
                      02 / SECURITY ACCESS
                    </span>
                  </div>
                  <h2 className="font-serif sm:font-sans text-xl font-bold text-[#252924] tracking-tight">
                    Enter Cashier PIN
                  </h2>
                  <p className="text-xs text-[#6C716A]">
                    Type your six-digit terminal passcode.
                  </p>
                </div>

                {/* 6-Digit Segmented Slots (Solid, zero gradients) */}
                <div className="space-y-3">
                  <div className="flex justify-center gap-2 py-1" aria-label={`PIN entered: ${pin.length} of 6 digits`}>
                    {[...Array(6)].map((_, idx) => {
                      const isFilled = idx < pin.length;
                      const isCurrent = idx === pin.length;
                      return (
                        <div
                          key={idx}
                          className={`w-10 h-12 rounded border flex items-center justify-center transition-all ${
                            isFilled
                              ? 'border-[#252924] bg-[#FFFFFF]'
                              : isCurrent
                              ? 'border-[#B55E42] bg-[#FFFFFF] ring-1 ring-[#B55E42]'
                              : 'border-[#DDDCD4] bg-[#F5F3ED]'
                          }`}
                        >
                          {isFilled ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#252924] block" />
                          ) : isCurrent ? (
                            <span className="w-1.5 h-0.5 bg-[#B55E42] block" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Restrained Error Alert */}
                  {error && (
                    <div
                      role="alert"
                      className="p-3 bg-[#FDF2F2] border border-[#FCA5A5] rounded text-xs text-[#991B1B] text-center font-medium"
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* Tactile Keypad */}
                <RegisterKeypad
                  onKeyPress={handleKeypadPress}
                  disabled={submitting}
                />

                {/* Primary Action Button */}
                <div className="space-y-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (pin.length === 6) submitPin(pin);
                    }}
                    disabled={pin.length < 6 || submitting}
                    className="w-full h-11 bg-[#B55E42] hover:bg-[#9C4F37] disabled:bg-[#DDDCD4] text-white disabled:text-[#6C716A] text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-none"
                  >
                    {submitting ? 'Verifying PIN…' : 'Unlock Register Station →'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgotPin(true)}
                    className="w-full text-center font-mono text-[11px] text-[#6C716A] hover:text-[#252924] transition-colors uppercase tracking-wider block"
                  >
                    Forgot Security PIN?
                  </button>
                </div>

              </div>
            )}
          </section>

        </div>
      </main>

      {/* Support Modals */}
      <RegisterHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <RegisterForgotPinModal
        isOpen={isForgotPin}
        onClose={() => setIsForgotPin(false)}
        onSubmit={handleForgotPinSubmit}
        selectedUser={selectedUser}
        loading={submitting}
        resetError={resetError}
      />
    </div>
  );
};

export default LoginSelectionPage;
