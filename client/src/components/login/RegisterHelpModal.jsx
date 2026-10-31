import React from 'react';
import { FaTimes, FaQuestionCircle } from 'react-icons/fa';

const RegisterHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252924]/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded max-w-lg w-full p-6 sm:p-7 shadow-none space-y-6 text-left">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#DDDCD4] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#F3E8E1] border border-[#DDDCD4] flex items-center justify-center text-[#B55E42]">
              <FaQuestionCircle className="text-sm" />
            </div>
            <div>
              <h3 id="help-modal-title" className="font-bold text-base text-[#252924] leading-tight">
                Workstation Support & Hotkeys
              </h3>
              <p className="font-mono text-[10px] text-[#6C716A] uppercase tracking-wider mt-0.5">
                Register Terminal Guide
              </p>
            </div>
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

        {/* Modal Content */}
        <div className="space-y-4 text-xs text-[#252924]">
          <div className="p-3.5 bg-[#F5F3ED] border border-[#DDDCD4] rounded space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#B55E42] font-mono block">
              Cashier Authentication
            </span>
            <p className="text-[#6C716A] leading-relaxed">
              Every sales cashier must have a verified six-digit numeric PIN assigned by a store manager. Select your name from the staff directory and enter your PIN using the on-screen keypad or physical keyboard.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6C716A] block">
              POS Terminal Shortcuts
            </span>
            <div className="border border-[#DDDCD4] rounded divide-y divide-[#DDDCD4] font-mono text-[11px]">
              <div className="flex justify-between items-center p-2.5 bg-[#FFFFFF]">
                <span className="text-[#6C716A]">Barcode Scanner Focus</span>
                <span className="font-bold text-[#252924]">F2 or [/]</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#FFFFFF]">
                <span className="text-[#6C716A]">Direct Tender Checkout</span>
                <span className="font-bold text-[#252924]">F9</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#FFFFFF]">
                <span className="text-[#6C716A]">Hold Current Ticket</span>
                <span className="font-bold text-[#252924]">H</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#FFFFFF]">
                <span className="text-[#6C716A]">Print Receipt / Next Sale</span>
                <span className="font-bold text-[#252924]">[P] / [Enter]</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FFFFFF] border border-[#DDDCD4] rounded font-mono text-[11px] text-[#6C716A] flex justify-between items-center">
            <span>Branch Manager Hotline:</span>
            <span className="font-bold text-[#252924]">EXT 805</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-[#DDDCD4] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#252924] hover:bg-[#B55E42] text-white rounded text-xs font-semibold tracking-wide transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterHelpModal;

