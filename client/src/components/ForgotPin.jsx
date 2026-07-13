import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaEnvelope, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import config from '../config';
import novaLogo from '../images/nova_logo.png';

function ForgotPin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${config.apiUrl}/api/forgot-pin`, {
        email,
      });

      setSuccess('Reset link sent to your email!');
      setTimeout(() => navigate('/login-selection'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-6 antialiased">
      
      {/* Main card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Header back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-slate-100 p-2 rounded-lg text-slate-550 hover:text-slate-800 transition-all border border-slate-200"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <span className="font-semibold text-slate-900 text-sm">PIN Recovery</span>
        </div>

        {/* Logos & title */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-4">
            <img src={novaLogo} alt="SUELTO Logo" className="h-14 w-auto object-contain rounded-xl shadow-sm" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Forgot security PIN?</h2>
          <p className="text-slate-450 text-xs leading-relaxed max-w-xs mx-auto">
            Provide your registered account email, and we will send a password reset code.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-50 border border-red-100 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2"
            >
              <FaExclamationTriangle className="text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-2"
            >
              <FaCheckCircle className="text-emerald-500" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase block pl-1 tracking-wider">Account Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
              <input
                type="email"
                required
                placeholder="cashier@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-slate-200 focus:border-slate-450 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white font-semibold transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                <span>Requesting reset...</span>
              </>
            ) : (
              <span>Request recovery link</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}

export default ForgotPin;
