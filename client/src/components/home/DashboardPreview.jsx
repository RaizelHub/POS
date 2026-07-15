import React from 'react';
import { motion } from 'framer-motion';
import adminDashboard from '../../images/admin_dashboard.png';

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="py-20 bg-white border-t border-b border-slate-200/80 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
            Back-Office Operations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Complete Control Over Store Logistics.
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Monitor sales trends, adjust receipt branding parameters, coordinate restocking orders, and track active cashier shift logs in one centralized browser window.
          </p>
        </div>

        {/* Dashboard Frame Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
        >
          
          {/* Top Browser Bar */}
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-400 block" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 block" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 block" />
            </div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">SUELTO Administration Panel</span>
            <div className="w-12" />
          </div>

          {/* Embedded Screenshot Image */}
          <div className="p-1 bg-slate-50 flex justify-center">
            <img 
              src={adminDashboard} 
              alt="SUELTO Admin Dashboard" 
              className="w-full h-auto object-contain rounded-b-xl"
            />
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default DashboardPreview;
