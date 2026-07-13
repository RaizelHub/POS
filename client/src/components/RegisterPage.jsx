import React, { useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaUser, FaEnvelope, FaLock, FaUsers, FaBox, FaChartLine, FaCheckCircle } from "react-icons/fa";
import config from '../config';
import novaLogo from '../images/nova_logo.png';

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    pin: ["", "", "", "", "", ""],
    confirmPin: ["", "", "", "", "", ""],
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const pinRefs = useRef([]);
  pinRefs.current = Array(6).fill().map((_, i) => pinRefs.current[i] || React.createRef());
  const confirmPinRefs = useRef([]);
  confirmPinRefs.current = Array(6).fill().map((_, i) => confirmPinRefs.current[i] || React.createRef());

  const handleChange = (e, field) => {
    const { value, name } = e.target;
    const index = parseInt(name);

    if (value && !/^[0-9]$/.test(value)) {
      e.preventDefault();
      return;
    }

    const digit = value;

    if (digit === '' && index > 0) {
      const newPin = [...formData[field]];
      newPin[index] = '';
      setFormData({ ...formData, [field]: newPin });

      if (field === "pin") {
        pinRefs.current[index - 1].current.focus();
      } else {
        confirmPinRefs.current[index - 1].current.focus();
      }
      return;
    }

    if (digit.length <= 1) {
      const newPin = [...formData[field]];
      newPin[index] = digit;
      setFormData({ ...formData, [field]: newPin });

      if (digit.length === 1 && index < 5) {
        if (field === "pin") {
          pinRefs.current[index + 1].current.focus();
        } else {
          confirmPinRefs.current[index + 1].current.focus();
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const missingFields = [];

    if (!formData.firstname.trim()) missingFields.push("First Name");
    if (!formData.lastname.trim()) missingFields.push("Last Name");
    if (!formData.email.trim()) missingFields.push("Email");

    const pin = formData.pin.join("");
    const confirmPin = formData.confirmPin.join("");

    if (pin.length !== 6) {
      missingFields.push("Complete 6-digit PIN");
    } else if (!/^\d+$/.test(pin)) {
      setError("PIN must contain only digits.");
      return;
    }

    if (confirmPin.length !== 6) {
      missingFields.push("Confirm PIN");
    }

    if (pin.length === 6 && confirmPin.length === 6) {
      if (pin !== confirmPin) {
        setError("PINs do not match. Please try again.");
        return;
      }
    }


    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(", ")}.`);
      return;
    }

    const dataToSend = {
      firstname: formData.firstname.trim(),
      lastname: formData.lastname.trim(),
      email: formData.email.trim(),
      pin: pin
    };

    try {
      setLoading(true);
      const response = await axios.post(`${config.apiUrl}/api/register`, dataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      setLoading(false);
      setMessage(response.data.message);

      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        pin: ["", "", "", "", "", ""],
        confirmPin: ["", "", "", "", "", ""],
        image: null,
      });

      setTimeout(() => navigate("/login-selection"), 4000);
    } catch (error) {
      setLoading(false);
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Error during registration. Please try again.");
    }
  };

  const googleAuth = () => {
    try {
      // Fix google redirect URI to run dynamically using our server config API endpoint
      window.open(`${config.apiUrl}/auth/google`, "_self");
    } catch (error) {
      setError("Google authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 antialiased">
      
      {/* Left side: Premium branding & features highlight */}
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
            <img src={novaLogo} alt="SUELTO Logo" className="h-8 w-auto object-contain rounded-lg" />
            <span className="font-bold text-slate-100 tracking-tight text-base">
              SUELTO POS
            </span>
          </div>
        </div>

        {/* Marketing detail blocks */}
        <div className="space-y-6 my-12 md:my-0">
          <div className="flex items-center gap-4">
            <img src={novaLogo} alt="SUELTO Logo" className="h-14 w-auto object-contain rounded-xl shadow-sm" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Register Store Cashier
          </h2>
          <p className="text-xs leading-relaxed text-slate-450">
            Create an employee profile to manage sales, track local held orders, settle GCash/Card transactions, and review analytics dashboards.
          </p>

          <div className="space-y-3.5 pt-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2.5">
              <FaUsers className="text-slate-500" />
              <span>Personalized cashier dashboard access</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FaBox className="text-slate-500" />
              <span>Full local cart restoration logs</span>
            </div>
            <div className="flex items-center gap-2.5">
              <FaChartLine className="text-slate-500" />
              <span>Daily/Monthly visual report exports</span>
            </div>
          </div>
        </div>

        {/* Footer legal */}
        <div className="text-[11px] text-slate-500 font-medium">
          © 2026 SUELTO POS System. SUELTO Retail Operations.
        </div>
      </div>

      {/* Right side: Registration Form container */}
      <div className="flex-1 bg-slate-50 p-6 md:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="text-center md:text-left">
            <h3 className="font-bold text-slate-900 text-lg">Create Cashier Account</h3>
            <p className="text-slate-400 text-xs mt-0.5">Please provide your details and create a 6-digit PIN</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-100 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-medium text-center"
              >
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3.5 py-2.5 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-2"
              >
                <FaCheckCircle className="text-emerald-500" />
                <span>{message} (Redirecting to login...)</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">First Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    required
                    placeholder="John"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">Last Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block uppercase">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input
                  type="email"
                  required
                  placeholder="cashier@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
                />
              </div>
            </div>

            {/* Custom security PIN Code Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">Choose 6-Digit PIN</label>
                <div className="flex gap-1.5">
                  {formData.pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={pinRefs.current[index]}
                      type="text"
                      maxLength="1"
                      name={index.toString()}
                      value={digit}
                      onChange={(e) => handleChange(e, "pin")}
                      className="w-8 h-10 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-md text-center text-sm font-bold bg-slate-50 focus:bg-white transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 block uppercase">Confirm PIN</label>
                <div className="flex gap-1.5">
                  {formData.confirmPin.map((digit, index) => (
                    <input
                      key={index}
                      ref={confirmPinRefs.current[index]}
                      type="text"
                      maxLength="1"
                      name={index.toString()}
                      value={digit}
                      onChange={(e) => handleChange(e, "confirmPin")}
                      className="w-8 h-10 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-md text-center text-sm font-bold bg-slate-50 focus:bg-white transition-all"
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* Actions Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                    <span>Creating account profile...</span>
                  </>
                ) : (
                  <span>Register Account</span>
                )}
              </button>

              <button
                type="button"
                onClick={googleAuth}
                className="w-full py-2.5 border border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Google Single Sign-On</span>
              </button>
            </div>

          </form>

          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
            <span className="text-slate-400">Already have an account?</span>
            <Link to="/login-selection" className="font-bold text-slate-900 hover:underline">
              Cashier Login
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default RegisterPage;
