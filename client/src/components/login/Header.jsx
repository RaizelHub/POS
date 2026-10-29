import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaClock, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import novaLogo from '../../images/nova_logo.png';

const Header = ({ theme = 'light', onHelpDeskClick }) => {
  const [time, setTime] = useState(new Date());
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={`h-14 border-b flex items-center justify-between px-4 md:px-6 w-full shrink-0 select-none ${
      isDark ? 'border-slate-800/90 bg-slate-900/95 text-slate-200' : 'border-slate-200/90 bg-white text-slate-800'
    }`}>
      {/* Brand & Terminal Identifier */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/"
          className={`p-1.5 border rounded-lg transition-colors ${
            isDark
              ? 'border-slate-800 bg-slate-850 text-slate-400 hover:bg-slate-800 hover:text-white'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Return to home"
          aria-label="Return to home"
        >
          <FaArrowLeft size={11} />
        </Link>

        <div className="flex items-center gap-2.5">
          <img
            src={novaLogo}
            alt="SUELTO Logo"
            className="h-7 w-auto object-contain rounded-md shrink-0 shadow-xs"
          />
          <div className="min-w-0">
            <h1 className={`font-bold text-xs tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SUELTO POS
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Register Terminal</p>
          </div>
        </div>

        {/* Live Terminal Online Status Pill */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
      </div>

      {/* Right Actions: Clock, Help Desk, Admin Portal */}
      <div className="flex items-center gap-2">
        {/* Live Clock Badge */}
        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 border rounded-lg font-mono text-[11px] font-medium ${
          isDark
            ? 'bg-slate-950/40 border-slate-800 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <FaClock className="text-slate-400 text-[10px]" />
          <span>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Help Desk Trigger */}
        {onHelpDeskClick ? (
          <button
            type="button"
            onClick={onHelpDeskClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-slate-850 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FaQuestionCircle size={11} className="text-slate-400" />
            <span className="hidden sm:inline">Help</span>
          </button>
        ) : (
          <Link
            to="/admin-login"
            className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-slate-850 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FaShieldAlt size={11} className="text-slate-400" />
            <span className="hidden sm:inline">Admin Login</span>
          </Link>
        )}

        {/* Admin Login Link */}
        <Link
          to="/admin-login"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <FaShieldAlt size={10} />
          <span>Admin</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
