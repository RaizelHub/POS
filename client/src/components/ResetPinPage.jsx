import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

import config from '../config';
import loginImage from '../images/login.jpg';
import novaLogo from '../images/nova_logo.png';
import Header from './login/Header';
import Footer from './login/Footer';

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

      setSuccessMessage('Your security PIN has been successfully reset. Your temporary credentials PIN is: 123456.');

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
    <div className="w-screen h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-800 antialiased selection:bg-emerald-500/10 selection:text-emerald-800 overflow-hidden relative">
      
      {/* Full-Screen Workspace Grid */}
      <div className="w-full h-full bg-white grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side Branding & Retail Visual */}
        <div className="hidden lg:block lg:col-span-5 h-full relative overflow-hidden">
          <img 
            src={loginImage} 
            alt="Retail Store Visual" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-xs flex flex-col justify-between p-10 text-white border-r border-slate-800">
            
            {/* Top Logo */}
            <div className="flex items-center gap-2.5">
              <img 
                src={novaLogo} 
                alt="SUELTO Logo" 
                className="h-10 w-auto object-contain rounded-xl brightness-0 invert" 
              />
              <div className="text-left">
                <h2 className="font-extrabold text-white text-base leading-none tracking-tight">SUELTO POS</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Retail Station Terminal</p>
              </div>
            </div>

            {/* Middle Welcome & Active Session Info */}
            <div className="space-y-6">
              <h3 className="text-2xl font-extrabold text-white leading-tight">
                PIN Settlement <br />
                Workstation
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
                Verification checks for authorized security credential updates. Settle cashier terminal credentials securely.
              </p>
              
              {/* Terminal Stats Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3.5 max-w-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Security Level</span>
                  <span className="text-rose-400 font-bold">Credential Sync</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Store Branch</span>
                  <span className="text-white font-bold">Main Store</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Terminal Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    ONLINE
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Slogan */}
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Suelto Workstation Client
            </div>
          </div>
        </div>

        {/* Right Side Authentication form */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between overflow-y-auto bg-slate-50 h-full">
          
          {/* Header info */}
          <Header />

          {/* Main changing view */}
          <div className="flex-grow flex flex-col justify-center max-w-[500px] w-full mx-auto py-8">
            <motion.div
              layout
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-center"
            >
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">PIN Settlement Checks</h2>
                <p className="text-slate-400 text-xs mt-0.5 font-semibold uppercase tracking-wider">Validating token with central store database</p>
              </div>

              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-10 gap-3"
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
                    className="space-y-5 py-4"
                  >
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl">
                      <FaExclamationTriangle />
                    </div>
                    <p className="text-xs font-semibold text-red-700 max-w-xs mx-auto">
                      {error}
                    </p>
                    <button
                      onClick={() => navigate('/login-selection')}
                      className="w-full py-3 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      Back to Cashier Selection
                    </button>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5 py-4"
                  >
                    <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                      <FaCheckCircle className="animate-bounce" />
                    </div>
                    <p className="text-xs font-semibold text-emerald-800 max-w-xs mx-auto leading-relaxed">
                      {successMessage}
                    </p>
                    <button
                      onClick={() => navigate('/login-selection')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>Log in immediately</span>
                      <FaArrowRight className="text-[10px]" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Footer info */}
          <Footer />

        </div>

      </div>

    </div>
  );
};

export default ResetPinPage;
