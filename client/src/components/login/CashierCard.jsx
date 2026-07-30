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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full flex items-center justify-between p-4 border rounded-xl text-left transition-all ${
        isSelected
          ? (isDark ? 'bg-emerald-950/35 border-emerald-500/80 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/30' : 'bg-emerald-50/70 border-emerald-600 shadow-sm ring-1 ring-emerald-600')
          : (isDark ? 'bg-slate-950/50 border-slate-850 hover:border-slate-700 hover:bg-slate-900/60' : 'bg-white border-slate-200 hover:border-slate-350 hover:shadow-md hover:bg-slate-50')
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full border overflow-hidden flex-shrink-0 flex items-center justify-center transition-all ${
          isSelected 
            ? (isDark ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-slate-950' : 'border-emerald-600/60 ring-2 ring-emerald-600/20 bg-white')
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
            <FaUserCircle className={isDark ? 'text-slate-500 text-xl' : 'text-slate-400 text-xl'} />
          )}
        </div>

        {/* Profile metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {user.firstname} {user.lastname}
            </span>
            <StatusBadge role={role} theme={theme} />
          </div>
          <div className={`flex items-center gap-2 text-[10px] font-semibold uppercase mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span>{cashierNum}</span>
            <span>•</span>
            <span>{shift}</span>
          </div>
        </div>

      </div>

      {/* Selected Indicator */}
      <div className="flex items-center gap-2 shrink-0 pl-2">
        <span className="bg-emerald-600 w-1.5 h-1.5 rounded-full inline-block animate-pulse" />
        <span className={`text-[10px] font-bold uppercase tracking-wide ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Ready</span>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow ml-1.5">
            <FaCheck className="text-[9px]" />
          </div>
        )}
      </div>

    </motion.button>
  );
};

export default CashierCard;
