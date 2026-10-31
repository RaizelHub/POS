import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaShieldAlt, FaEnvelope, FaLock, FaCashRegister } from "react-icons/fa";
import axios from "axios";
import config from '../config';
import novaLogo from '../images/nova_logo.png';
import retailTerminal from '../images/retail_terminal.jpg';

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !pin) {
      setErrorMessage("Please enter both administrator email and 6-digit PIN.");
      return;
    }

    if (pin.length !== 6) {
      setErrorMessage("Administrative PIN must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const response = await axios.post(`${config.apiUrl}/api/admin/login`, {
        email,
        pin,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
        navigate("/dashboard");
      } else {
        setErrorMessage(response.data.message || "Invalid administrative credentials.");
      }
    } catch (error) {
      console.error("Admin login failed:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Unauthorized. Store owner or administrative clearance required.");
        } else {
          setErrorMessage(error.response.data.message || "Invalid administrative credentials.");
        }
      } else if (error.request) {
        setErrorMessage("Administrative service unavailable. Check network connectivity.");
      } else {
        setErrorMessage("An unexpected authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#252924] font-sans antialiased flex flex-col selection:bg-[#252924] selection:text-[#FFFFFF]">
      
      {/* Slim Global Architectural Header */}
      <header className="h-14 bg-[#FFFFFF] border-b border-[#DDDCD4] flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full shrink-0 select-none z-10">
        {/* Left: Brand Mark & Context */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/login-selection"
            className="w-8 h-8 rounded border border-[#DDDCD4] bg-[#FFFFFF] hover:bg-[#F5F3ED] text-[#6C716A] hover:text-[#252924] flex items-center justify-center transition-colors shrink-0"
            title="Return to Cashier Register"
            aria-label="Return to Cashier Register"
          >
            <FaArrowLeft className="text-xs" />
          </Link>

          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={novaLogo}
              alt="SUELTO Logo"
              className="h-6 w-auto object-contain rounded shrink-0"
            />
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-sans font-bold text-xs tracking-[0.16em] uppercase text-[#252924]">
                SUELTO
              </span>
              <span className="text-[#DDDCD4] hidden sm:inline">|</span>
              <span className="font-mono text-xs text-[#6C716A] uppercase tracking-wider hidden sm:inline">
                MANAGEMENT CONSOLE
              </span>
              <span className="font-mono text-[10px] text-[#B55E42] bg-[#F3E8E1] px-2 py-0.5 rounded border border-[#DDDCD4] hidden md:inline font-semibold">
                RESTRICTED
              </span>
            </div>
          </div>
        </div>

        {/* Right: Operational Status, Live Clock & Cashier Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#DDDCD4] bg-[#F5F3ED] text-[11px] font-mono"
            title={isOnline ? 'Network online' : 'Network offline'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#166534]' : 'bg-[#B91C1C]'
              }`}
            />
            <span className="hidden sm:inline font-medium text-[#252924]">
              {isOnline ? 'SERVICE READY' : 'OFFLINE'}
            </span>
          </div>

          <div className="hidden lg:flex items-center px-2.5 py-1 rounded border border-[#DDDCD4] bg-[#FFFFFF] font-mono text-xs font-semibold text-[#252924]">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>

          <Link
            to="/login-selection"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DDDCD4] bg-[#FFFFFF] hover:bg-[#F5F3ED] text-xs font-semibold text-[#252924] transition-colors"
          >
            <FaCashRegister className="text-xs text-[#6C716A]" />
            <span className="hidden sm:inline">Cashier Terminal</span>
          </Link>
        </div>
      </header>

      {/* Main Full-Height Editorial Workspace with Clean Image Split */}
      <main className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT COLUMN: Clean Visual Image Panel (Span 6 on desktop) */}
        <section className="hidden lg:flex lg:col-span-6 xl:col-span-6 bg-[#F5F3ED] border-r border-[#DDDCD4] p-8 xl:p-12 flex-col justify-between overflow-y-auto">
          
          {/* Top Identifier */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B55E42]">
                01 / OPERATIONS PORTAL
              </span>
              <span className="h-px w-10 bg-[#DDDCD4]" />
            </div>
            <h1 className="font-serif text-3xl xl:text-4xl font-bold tracking-tight text-[#252924] leading-[1.15]">
              Store operations & central intelligence
            </h1>
            <p className="text-xs xl:text-sm text-[#6C716A] leading-relaxed max-w-lg">
              Manage live registers, inventory restocking, sales reconciliation, and staff permissions from one unified workspace.
            </p>
          </div>

          {/* Clean Real Photography Image Showcase Container */}
          <div className="my-6 xl:my-8 flex justify-center items-center">
            <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#DDDCD4] rounded-2xl p-3 shadow-none flex flex-col items-center space-y-3">
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#FAFAF8] border border-[#DDDCD4]">
                <img
                  src={retailTerminal}
                  alt="SUELTO POS Boutique Retail Counter"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Clean Image Caption */}
              <div className="flex items-center justify-between w-full px-2 pt-1 font-mono text-[10px]">
                <span className="uppercase font-bold tracking-wider text-[#B55E42]">
                  SUELTO WORKSTATION POS-01
                </span>
                <span className="text-[#6C716A]">
                  MAIN RETAIL COUNTER
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Operational Chips */}
          <div className="pt-4 border-t border-[#DDDCD4] grid grid-cols-3 gap-3 text-center font-mono text-[11px]">
            <div className="p-2.5 bg-[#FFFFFF] border border-[#DDDCD4] rounded">
              <span className="text-[#6C716A] block text-[10px] uppercase">Shift Control</span>
              <span className="font-bold text-[#252924] mt-0.5 block">X/Z Readings</span>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] border border-[#DDDCD4] rounded">
              <span className="text-[#6C716A] block text-[10px] uppercase">Audit Ledger</span>
              <span className="font-bold text-[#166534] mt-0.5 block">100% Immutable</span>
            </div>
            <div className="p-2.5 bg-[#FFFFFF] border border-[#DDDCD4] rounded">
              <span className="text-[#6C716A] block text-[10px] uppercase">Terminal Mode</span>
              <span className="font-bold text-[#252924] mt-0.5 block">Level 3 Owner</span>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Clean Sign-In Form (Span 6 on desktop) */}
        <section className="col-span-12 lg:col-span-6 xl:col-span-6 bg-[#FFFFFF] p-6 sm:p-10 xl:p-14 flex flex-col justify-center items-center overflow-y-auto">
          
          <div className="w-full max-w-md space-y-6">
            
            {/* Mobile Header Hero (Shown only on small screens) */}
            <div className="lg:hidden text-center space-y-3 pb-4 border-b border-[#DDDCD4]">
              <div className="w-full max-h-[160px] aspect-[16/9] mx-auto bg-[#F5F3ED] border border-[#DDDCD4] rounded-xl overflow-hidden">
                <img
                  src={retailTerminal}
                  alt="SUELTO POS Retail Workstation"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#B55E42]">
                  SUELTO POS · OPERATIONS
                </span>
                <h2 className="text-xl font-bold text-[#252924] mt-0.5">Administrator Sign In</h2>
              </div>
            </div>

            {/* Desktop Form Heading */}
            <div className="hidden lg:block space-y-1.5 border-b border-[#DDDCD4] pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#B55E42]">
                  02 / CREDENTIAL VERIFICATION
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#252924] tracking-tight flex items-center gap-2">
                <FaShieldAlt className="text-[#B55E42] text-lg" />
                <span>Administrator Sign In</span>
              </h2>
              <p className="text-xs text-[#6C716A]">
                Enter your store owner credentials and 6-digit security PIN.
              </p>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-[#FDF2F2] border border-[#FCA5A5] rounded text-xs text-[#991B1B] font-medium animate-fadeIn"
              >
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Administrator Email */}
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-bold text-[#6C716A] uppercase tracking-wider block">
                  Administrator Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6C716A] pointer-events-none">
                    <FaEnvelope className="text-xs" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="owner@suelto-pos.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 border border-[#DDDCD4] bg-[#FFFFFF] rounded text-xs text-[#252924] placeholder:text-[#6C716A] focus:outline-none focus:border-[#B55E42] focus:ring-1 focus:ring-[#B55E42] font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Security PIN Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] font-bold text-[#6C716A] uppercase tracking-wider block">
                    Security Passcode (6 Digits)
                  </label>
                  <span className="font-mono text-[10px] text-[#6C716A]">
                    {pin.length}/6
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6C716A] pointer-events-none">
                    <FaLock className="text-xs" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, '');
                      if (numeric.length <= 6) setPin(numeric);
                    }}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full h-11 pl-10 pr-3.5 border border-[#DDDCD4] bg-[#FFFFFF] rounded text-xs text-[#252924] placeholder:text-[#6C716A] focus:outline-none focus:border-[#B55E42] focus:ring-1 focus:ring-[#B55E42] font-mono tracking-[0.3em] font-bold transition-colors"
                  />
                </div>
                <span className="text-[10px] text-[#6C716A] block pt-0.5 font-sans">
                  Must be the 6-digit passcode assigned to store management.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !email || pin.length !== 6}
                  className="w-full h-11 bg-[#B55E42] hover:bg-[#9C4F37] disabled:bg-[#DDDCD4] text-white disabled:text-[#6C716A] text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials…</span>
                    </>
                  ) : (
                    <span>Access Management Console →</span>
                  )}
                </button>
              </div>

            </form>

            {/* Quick Switch to Cashier Desk */}
            <div className="pt-4 border-t border-[#DDDCD4] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-[#6C716A]">Are you a sales cashier?</span>
              <Link
                to="/login-selection"
                className="font-semibold text-[#B55E42] hover:text-[#9C4F37] hover:underline flex items-center gap-1"
              >
                <span>Switch to Register Desk</span>
                <span className="font-mono">→</span>
              </Link>
            </div>

            {/* Audit Notice */}
            <div className="pt-2 text-center font-mono text-[10px] text-[#6C716A]">
              Administrative sign-ins are recorded in the central audit ledger.
            </div>

          </div>

        </section>

      </main>

    </div>
  );
};

export default AdminLoginPage;
