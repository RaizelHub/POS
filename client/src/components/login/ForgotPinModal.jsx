import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaEnvelope, FaIdCard } from 'react-icons/fa';

const ForgotPinModal = ({ isOpen, onClose, onSubmit, selectedUser, loading, resetError }) => {
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, employeeId);
  };

  const cashierNum = selectedUser ? `C-${selectedUser._id.substring(selectedUser._id.length - 4).toUpperCase()}` : '';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fadeIn">
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
            PIN Recovery Requester
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-450 hover:bg-slate-150 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Target</span>
            <p className="font-bold text-slate-800 text-xs">{selectedUser?.firstname} {selectedUser?.lastname}</p>
            <p className="text-slate-400 text-[10px]">{selectedUser?.email}</p>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Confirm Account Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                <FaEnvelope />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cashier@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white transition-all font-semibold"
              />
            </div>
          </div>

          {/* Employee ID field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Confirm Cashier Employee ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                <FaIdCard />
              </span>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder={`e.g. ${cashierNum}`}
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 focus:border-slate-400 focus:outline-none rounded-lg text-xs bg-slate-50 focus:bg-white transition-all font-semibold"
              />
            </div>
          </div>

          {resetError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-2.5 rounded-lg text-xs font-semibold text-center">
              {resetError}
            </div>
          )}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 font-bold rounded-lg text-xs transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
            >
              {loading ? 'Requesting...' : 'Request PIN Reset'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPinModal;
