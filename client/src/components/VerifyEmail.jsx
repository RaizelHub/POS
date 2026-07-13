import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import novaLogo from '../images/nova_logo.png';
import config from '../config';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    if (token) {
      console.log('Verifying token with API:', `${config.apiUrl}/api/verify-email?token=${token}`);
      axios.get(`${config.apiUrl}/api/verify-email?token=${token}`)
        .then(response => {
          console.log('Verification successful:', response.data);
          setMessage(response.data.message);
          setError(null);
        })
        .catch(error => {
          console.error('Verification error:', error);
          const errorMessage = error.response?.data?.message || 'Unknown error';
          if (errorMessage.includes('expired')) {
            setError('The verification link has expired. Please request a new one.');
          } else {
            setError('Error verifying email: ' + errorMessage);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('Invalid verification token.');
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm space-y-6 text-center">
        
        {/* Institutional Logos */}
        <div className="flex items-center justify-center gap-4">
          <img src={novaLogo} alt="Nova Logo" className="h-14 w-auto object-contain rounded-xl shadow-sm" />
        </div>

        <h2 className="text-lg font-bold text-slate-900">Email Verification Gateway</h2>
        <p className="text-slate-400 text-xs">Authenticating employee registry security tokens</p>

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
              <span className="text-xs font-semibold text-slate-500">Checking verification status...</span>
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
                onClick={() => navigate('/register')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <FaEnvelope className="text-[10px]" />
                <span>Request Verification Link</span>
              </button>
            </motion.div>
          )}

          {message && (
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
                {message}
              </p>
              <button
                onClick={() => navigate('/login-selection')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Navigate to Login</span>
                <FaArrowRight className="text-[10px]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default VerifyEmailPage;
