import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaIdCard } from 'react-icons/fa';

const RegisterForgotPinModal = ({ isOpen, onClose, onSubmit, selectedUser, loading, resetError }) => {
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, employeeId);
  };

  const cashierNum = selectedUser
    ? `C-${selectedUser._id.substring(selectedUser._id.length - 4).toUpperCase()}`
    : 'C-0000';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252924]/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-pin-title"
    >
      <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded max-w-md w-full p-6 sm:p-7 shadow-none space-y-5 text-left">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DDDCD4] pb-4">
          <div>
            <h3 id="forgot-pin-title" className="font-bold text-base text-[#252924] leading-tight">
              Reset Cashier PIN
            </h3>
            <p className="font-mono text-[10px] text-[#6C716A] uppercase tracking-wider mt-0.5">
              Identity Verification
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6C716A] hover:text-[#252924] hover:bg-[#F5F3ED] border border-[#DDDCD4] rounded transition-colors"
            aria-label="Close dialog"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Selected Staff Info */}
        <div className="p-3 bg-[#F5F3ED] border border-[#DDDCD4] rounded flex items-center justify-between text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-[#6C716A] block">
              Target Staff Profile
            </span>
            <span className="font-semibold text-[#252924]">
              {selectedUser?.firstname} {selectedUser?.lastname}
            </span>
          </div>
          <span className="font-mono text-xs text-[#B55E42] font-semibold">
            {cashierNum}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] font-bold text-[#6C716A] uppercase tracking-wider block">
              Registered Account Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6C716A]">
                <FaEnvelope className="text-xs" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cashier@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#DDDCD4] bg-[#FFFFFF] rounded text-xs text-[#252924] focus:outline-none focus:border-[#B55E42] focus:ring-1 focus:ring-[#B55E42] font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] font-bold text-[#6C716A] uppercase tracking-wider block">
              Confirm Employee Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#6C716A]">
                <FaIdCard className="text-xs" />
              </span>
              <input
                type="text"
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder={`e.g. ${cashierNum}`}
                className="w-full pl-9 pr-3.5 py-2.5 border border-[#DDDCD4] bg-[#FFFFFF] rounded text-xs text-[#252924] focus:outline-none focus:border-[#B55E42] focus:ring-1 focus:ring-[#B55E42] font-mono font-medium"
              />
            </div>
          </div>

          {resetError && (
            <div className="p-3 bg-[#FDF2F2] border border-[#FCA5A5] rounded text-xs text-[#991B1B]">
              {resetError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 border border-[#DDDCD4] bg-[#FFFFFF] hover:bg-[#F5F3ED] text-[#252924] rounded text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 bg-[#B55E42] hover:bg-[#9C4F37] text-white rounded text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForgotPinModal;

