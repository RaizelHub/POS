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

      console.log(response.data);

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminData", JSON.stringify(response.data.admin));
        navigate("/dashboard"); // Redirects to the admin control panel dashboard
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased">
      
      {/* Left side: Premium Admin panel layout */}
      <div className="w-full md:w-[420px] bg-slate-900 text-slate-350 p-8 flex flex-col justify-between border-r border-slate-800">
        
        {/* Top Logo link */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-slate-800 p-2 rounded-lg transition-all text-slate-400 hover:text-white"
          >
            <FaArrowLeft />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-white text-slate-900 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base">
              A
            </div>
            <span className="font-semibold text-slate-100 tracking-tight text-base">
              Admin Gateway
            </span>
          </div>
        </div>

        {/* Mid marketing text */}
        <div className="space-y-6 my-12 md:my-0">
          <div className="flex items-center gap-4">
            <img src={novaLogo} alt="SUELTO Logo" className="h-14 w-auto object-contain rounded-xl shadow-sm" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Security Control Console
          </h2>
          <p className="text-xs leading-relaxed text-slate-450">
            Administrative credentials are required to configure product settings, audit registers, evaluate cash flow, and manage employee accounts.
          </p>

          <div className="space-y-3.5 pt-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2.5">
              <FaUsers className="text-slate-500" />
              <span>Modify cashiers registry</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FaBox className="text-slate-500" />
              <span>Configure pricing catalog lists</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FaChartLine className="text-slate-500" />
              <span>Review detailed transaction histories</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-slate-500 font-medium">
          © 2026 SUELTO Admin Panel. SUELTO Retail Operations.
        </div>
      </div>

      {/* Right side: Login credentials form */}
      <div className="flex-1 bg-slate-50 p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="text-center md:text-left">
            <h3 className="font-bold text-slate-900 text-lg flex items-center justify-center md:justify-start gap-2">
              <FaShieldAlt className="text-slate-700" />
              <span>Administrator Login</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Please fill in your admin credentials below</p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-100 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-medium text-center"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-550 block uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
                <input
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 focus:border-slate-450 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
            </div>

            {/* PIN Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-550 block uppercase tracking-wider">Security PIN</label>
              <div className="relative">
                <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
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
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 focus:border-slate-450 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold tracking-wider transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-450 block pl-1">Must be exactly 6 numeric digits</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Gateway...</span>
                </>
              ) : (
                <span>Access Console</span>
              )}
            </button>

          </form>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-400">Not an administrator?</span>
            <Link to="/login-selection" className="font-bold text-slate-900 hover:underline">
              Cashier Login
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};

export default AdminLoginPage;
