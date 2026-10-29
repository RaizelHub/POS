import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaShieldAlt, FaEnvelope, FaLock, FaUsers, FaBox, FaChartLine } from "react-icons/fa";
import axios from "axios";
import config from '../config';
import novaLogo from '../images/nova_logo.png';

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !pin) {
      setErrorMessage("Please enter both email and PIN.");
      return;
    }

    if (pin.length !== 6) {
      setErrorMessage("PIN must be a 6-digit number.");
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
        setErrorMessage(response.data.message || "Invalid login credentials.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage("Unauthorized access. Admin privileges required.");
        } else {
          setErrorMessage(error.response.data.message || "Invalid login credentials.");
        }
      } else if (error.request) {
        setErrorMessage("Server did not respond. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased selection:bg-emerald-500/20 selection:text-emerald-950">
      
      {/* Left side: Premium Admin panel layout */}
      <div className="w-full md:w-[400px] bg-slate-900 text-slate-300 p-6 md:p-8 flex flex-col justify-between border-r border-slate-800">
        
        {/* Top Logo link */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-slate-800 p-2 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Go back"
            aria-label="Go back"
          >
            <FaArrowLeft size={12} />
          </button>
          <div className="flex items-center gap-2.5">
            <img src={novaLogo} alt="SUELTO Logo" className="h-8 w-auto object-contain rounded-md" />
            <div>
              <span className="font-bold text-white tracking-tight text-sm block leading-tight">
                SUELTO POS
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Mid marketing text */}
        <div className="space-y-6 my-10 md:my-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Store Administration
            </h2>
            <p className="text-xs leading-relaxed text-slate-400 mt-1.5">
              Secure administrative access for catalog pricing, inventory reconciliation, staff roles, and store telemetry.
            </p>
          </div>

          <div className="space-y-3 pt-2 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 grid place-items-center shrink-0">
                <FaUsers size={12} />
              </span>
              <span>Manage cashier rosters & permissions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 grid place-items-center shrink-0">
                <FaBox size={12} />
              </span>
              <span>Catalog pricing & purchase orders</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 grid place-items-center shrink-0">
                <FaChartLine size={12} />
              </span>
              <span>Audited sales ledgers & X/Z reports</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 font-mono">
          SUELTO Operations · Version 1.1 · Node Secure
        </div>
      </div>

      {/* Right side: Login credentials form */}
      <div className="flex-1 bg-slate-50 p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-xl p-6 md:p-8 shadow-xs space-y-6">
          
          <div className="text-center md:text-left">
            <h3 className="font-bold text-slate-900 text-lg flex items-center justify-center md:justify-start gap-2">
              <FaShieldAlt className="text-emerald-600 text-base" />
              <span>Administrator Sign In</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">Enter your store owner credentials and security PIN.</p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs font-medium text-center"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none rounded-lg text-xs bg-slate-50/70 focus:bg-white font-medium text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* PIN Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">Security PIN</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                <input
                  type="password"
                  required
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    if (numericValue.length <= 6) setPin(numericValue);
                  }}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none rounded-lg text-xs bg-slate-50/70 focus:bg-white font-mono font-medium tracking-widest text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
              <span className="text-[10px] text-slate-400 block pl-1">Must be exactly 6 numeric digits</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-5 active:scale-98"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Access Console</span>
              )}
            </button>

          </form>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-400">Cashier terminal?</span>
            <Link to="/login-selection" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
              Open Cashier Login →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
