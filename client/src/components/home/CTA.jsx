import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

const CTA = () => {
  return (
    <section className="py-20 bg-slate-50 px-6 lg:px-10">
      <div className="max-w-5xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 md:p-14 text-center space-y-8 shadow-sm">
        
        {/* Header Text */}
        <div className="space-y-3.5 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Modernize Your Store?
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Initialize your cashier workstation, configure custom thermal headers, check active shift logs, and sync inventory levels in seconds.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login-selection"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-7 py-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-98"
          >
            <span>Launch POS Terminal</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
          
          <Link
            to="/register"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-7 py-4 rounded-lg shadow-sm hover:shadow transition-all active:scale-98"
          >
            Create Cashier Account
          </Link>
        </div>

      </div>
    </section>
  );
};

export default CTA;
