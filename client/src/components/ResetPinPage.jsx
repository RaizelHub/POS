import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';
import config from '../config';

const ResetPinPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      resetPin(token);
    } else {
      setError('Invalid link. Please check your email again.');
      setLoading(false);
    }
  }, [token]);

  const resetPin = async (token) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting to reset PIN with token:', token);

      const res = await fetch(`${config.apiUrl}/api/reset-pin/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log('Response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset the PIN.');
      }

      setSuccessMessage('Your PIN has been successfully reset. Your new temporary PIN is 123456.');

      setTimeout(() => {
        navigate('/login-selection?pinReset=true');
      }, 4000);

    } catch (error) {
      console.error('Error resetting PIN:', error);
      setError(error.message || 'Error occurred while resetting PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-center">
        
        <h2 className="text-lg font-bold text-slate-900">PIN Authorization Settlement</h2>
        <p className="text-slate-400 text-xs">Validating security token with central store database</p>

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-6 gap-3"
            >
              <div className="w-9 h-9 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500">Processing credentials change...</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 py-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">
                <FaExclamationTriangle />
              </div>
              <p className="text-xs font-semibold text-red-700 max-w-xs mx-auto">
                {error}
              </p>
              <button
                onClick={() => navigate('/login-selection')}
                className="mx-auto flex items-center gap-1 text-slate-650 hover:text-slate-900 font-bold text-xs hover:underline transition-colors"
              >
                <span>Back to cashier selection</span>
              </button>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 py-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                <FaCheckCircle />
              </div>
              <p className="text-xs font-semibold text-emerald-800 max-w-xs mx-auto leading-relaxed">
                {successMessage}
              </p>
              <button
                onClick={() => navigate('/login-selection')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Log in immediately</span>
                <FaArrowRight className="text-[10px]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ResetPinPage;
