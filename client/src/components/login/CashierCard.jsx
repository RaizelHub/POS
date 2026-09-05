import React from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaCheck } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import { getApiUrl } from '../../utils/getApiUrl';

const CashierCard = ({ user, isSelected, onClick, theme = 'light' }) => {
  // Mock role and shift details based on user settings
  const role = user.isAdmin ? 'Admin' : (user.firstname === 'Sarah' ? 'Senior Cashier' : 'Cashier');
  const cashierNum = user._id ? `C-${user._id.substring(user._id.length - 4).toUpperCase()}` : 'C-0000';
  const shift = user.isAdmin ? 'All Shifts' : (user.station || 'Unassigned');
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full flex items-center justify-between p-3.5 border rounded-xl text-left transition-all ${
        isSelected
          ? (isDark ? 'bg-slate-900 border-slate-600 ring-1 ring-slate-600 shadow-sm' : 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-xs')
          : (isDark ? 'bg-slate-900/40 border-slate-850 hover:border-slate-700 hover:bg-slate-900/70' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80')
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl border overflow-hidden flex-shrink-0 flex items-center justify-center transition-all ${
          isSelected 
            ? (isDark ? 'border-slate-500 ring-2 ring-slate-700 bg-slate-950' : 'border-slate-900 ring-2 ring-slate-200 bg-white')
            : (isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50')
        }`}>
          {user.image && !user.image.includes('default-image.jpg') ? (
            <img
              src={user.image.startsWith('http') ? user.image : `${getApiUrl()}/${user.image}`}
              alt={user.firstname}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) {
                  e.currentTarget.nextSibling.style.display = 'block';
                }
              }}
            />
          ) : (
            <FaUserCircle className={isDark ? 'text-slate-500 text-lg' : 'text-slate-400 text-lg'} />
          )}
        </div>

        {/* Profile metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user.firstname} {user.lastname}
            </span>
            <StatusBadge role={role} theme={theme} />
          </div>
          <div className={`flex items-center gap-2 text-[10px] font-mono font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{cashierNum}</span>
            <span>•</span>
            <span>{shift}</span>
          </div>
        </div>

      </div>

      {/* Status & Selection Indicator */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        <span className={`text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-400' 
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          Active
        </span>
        {isSelected && (
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shadow-xs ${
            isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
          }`}>
            <FaCheck className="text-[8px]" />
          </div>
        )}
      </div>

    </motion.button>
  );
};

export default CashierCard;
