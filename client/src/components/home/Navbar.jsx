import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import novaLogo from '../../images/nova_logo.png';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 transition-all">
      <div className="flex items-center gap-8 max-w-7xl mx-auto w-full justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img 
              src={novaLogo} 
              alt="SUELTO Logo" 
              className="h-8 w-auto object-contain rounded-lg border border-slate-100 p-0.5 bg-white" 
            />
            <span className="font-bold text-slate-900 tracking-tight text-lg uppercase">
              Suelto
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
          <a href="#dashboard" className="hover:text-emerald-600 transition-colors">System Tour</a>
          <a href="#workflow" className="hover:text-emerald-600 transition-colors">Workflow</a>
          <a href="#industries" className="hover:text-emerald-600 transition-colors">Solutions</a>
          <a href="#testimonials" className="hover:text-emerald-600 transition-colors">Reviews</a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin-login"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-xs transition-colors px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-200"
          >
            <FaShieldAlt className="text-[10px]" />
            <span>Admin Portal</span>
          </Link>
          
          <Link
            to="/login-selection"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-98"
          >
            <span>Launch POS</span>
            <FaArrowRight className="text-[9px] translate-y-[0.5px]" />
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
