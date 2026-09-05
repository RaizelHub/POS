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
    { label: <FaCheck className={isDark ? 'text-slate-200' : 'text-slate-800'} />, value: 'enter' }
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {keys.map((k, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onKeyPress(k.value)}
          className={`h-12 rounded-xl border flex items-center justify-center font-mono font-semibold text-base transition-all active:scale-95 ${
            isDark 
              ? 'border-slate-800/80 bg-slate-900 hover:bg-slate-800 hover:border-slate-700 active:bg-slate-750 text-slate-100' 
              : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 text-slate-900 shadow-xs'
          } ${
            k.value === 'enter' 
              ? (isDark ? 'border-slate-700 bg-slate-800/90 text-white hover:bg-slate-750' : 'border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200')
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
