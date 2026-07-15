import React from 'react';
import { Link } from 'react-router-dom';
import novaLogo from '../../images/nova_logo.png';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img 
              src={novaLogo} 
              alt="SUELTO Logo" 
              className="h-8 w-auto object-contain brightness-0 invert" 
            />
            <span className="font-bold text-white text-base tracking-wide uppercase">SUELTO POS</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
            Premium high-performance retail terminal and inventory operations manager built for modern enterprise checkouts.
          </p>
        </div>

        {/* Product Column */}
        <div className="space-y-3.5">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#features" className="hover:text-slate-200 transition-colors">Features Grid</a></li>
            <li><a href="#dashboard" className="hover:text-slate-200 transition-colors">System Tour</a></li>
            <li><a href="#workflow" className="hover:text-slate-200 transition-colors">Workflow steps</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="space-y-3.5">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#testimonials" className="hover:text-slate-200 transition-colors">Client Reviews</a></li>
            <li><a href="#industries" className="hover:text-slate-200 transition-colors">Active Industries</a></li>
            <li><Link to="/login-selection" className="hover:text-slate-200 transition-colors">POS Terminal</Link></li>
          </ul>
        </div>

        {/* Legal & Support Column */}
        <div className="space-y-3.5">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Legal & Support</h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-slate-250 cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-slate-250 cursor-pointer transition-colors">Terms of Service</li>
            <li className="hover:text-slate-250 cursor-pointer transition-colors">Developer Helpdesk</li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
        <p>© 2026 SUELTO Retail Systems. All rights reserved.</p>
        <p>Crafted for enterprise supermarket self-checkouts and boutique point-of-sale operations.</p>
      </div>
    </footer>
  );
};

export default Footer;
