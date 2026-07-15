import React from 'react';
import { FaBackspace, FaCheck } from 'react-icons/fa';

const NumericKeypad = ({ onKeyPress, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const keys = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
    { label: '6', value: '6' },
    { label: '7', value: '7' },
    { label: '8', value: '8' },
    { label: '9', value: '9' },
    { label: <FaBackspace className={isDark ? 'text-slate-400' : 'text-slate-500'} />, value: 'backspace' },
    { label: '0', value: '0' },
    { label: <FaCheck className={isDark ? 'text-teal-400' : 'text-teal-650'} />, value: 'enter' }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((k, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onKeyPress(k.value)}
          className={`h-14 rounded-xl border flex items-center justify-center font-bold text-base transition-all active:scale-95 shadow-sm ${
            isDark 
              ? 'border-slate-800 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-white' 
              : 'border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800'
          } ${
            k.value === 'enter' 
              ? (isDark ? 'border-teal-700/60 bg-teal-950/40 text-teal-400 hover:bg-teal-900/40' : 'border-teal-200 bg-teal-50 text-teal-750 hover:bg-teal-100/70') 
              : ''
          }`}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
};

export default NumericKeypad;
