import React from 'react';

const Footer = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  return (
    <footer className={`border-t pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-semibold tracking-wide uppercase ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-450'}`}>
      <span>© 2026 SUELTO Retail Systems. All rights reserved.</span>
      <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono">
        <span>Version: v1.0.0</span>
        <span>•</span>
        <span>Secure Terminal Port: 8001</span>
      </div>
    </footer>
  );
};

export default Footer;
