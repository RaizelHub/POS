import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaClock, FaArrowLeft } from 'react-icons/fa';
import novaLogo from '../../images/nova_logo.png';

const Header = ({ theme = 'light', onHelpDeskClick }) => {
  const [time, setTime] = useState(new Date());
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-5 mb-6 gap-4 w-full ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
      {/* Brand Logo and Title with back arrow */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className={`p-2 border rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 ${
            isDark ? 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100'
          }`}
          title="Back to Home"
        >
          <FaArrowLeft className="text-[10px]" />
        </Link>
        <img
          src={novaLogo}
          alt="SUELTO Logo"
          className="h-10 w-auto object-contain rounded-xl shadow-sm"
        />
        <div className="text-left">
          <h1 className={`font-extrabold text-lg leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>SUELTO POS</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Retail Management System</p>
        </div>
      </div>

      {/* Quick-Access Header Utilities */}
      <div className="flex items-center gap-3">
        {/* Help Desk Link or Trigger */}
        {onHelpDeskClick ? (
          <button
            type="button"
            onClick={onHelpDeskClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:border-slate-700' 
                : 'bg-white border-slate-200 text-slate-650 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FaQuestionCircle className={isDark ? 'text-teal-450' : 'text-slate-500'} />
            <span>Help Desk</span>
          </button>
        ) : (
          <a
            href="https://suelto-support.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white hover:border-slate-700' 
                : 'bg-white border-slate-200 text-slate-650 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FaQuestionCircle className={isDark ? 'text-teal-450' : 'text-slate-500'} />
            <span>Help Desk</span>
          </a>
        )}

        {/* Premium Digital Clock Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl font-mono text-[10.5px] font-bold ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-white shadow-inner' 
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <FaClock className="text-teal-500 animate-pulse" />
          <span>
            {time.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}, {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
