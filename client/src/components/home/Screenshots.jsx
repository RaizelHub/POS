import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLaptop, FaBarcode, FaChartBar, FaReceipt, FaWarehouse } from 'react-icons/fa';

import adminDashboard from '../../images/admin_dashboard.png';
import finalScanPage from '../../images/final_scan_page.png';
import receiptBuilder from '../../images/receipt_builder.png';
import autoRestock from '../../images/auto_restock.png';
import leaderboard from '../../images/leaderboard.png';

const screenshots = [
  {
    id: 'dashboard',
    title: 'Admin Dashboard',
    desc: 'The central administration gateway for viewing net checkout volumes, pending cashier logs, and shift floats variance.',
    icon: <FaLaptop />,
    image: adminDashboard,
    url: 'http://localhost:3000/dashboard'
  },
  {
    id: 'checkout',
    title: 'Cashier Scanner Console',
    desc: 'A barcode-ready scanner terminal equipped with customer loyalty pickers, credit ledgers, and transaction cash adjustments.',
    icon: <FaBarcode />,
    image: finalScanPage,
    url: 'http://localhost:3000/scan'
  },
  {
    id: 'receipt',
    title: 'Receipt Builder Preview',
    desc: 'Dynamically customize contact info, headers, tax numbers, and footer slogans with a side-by-side thermal roll preview.',
    icon: <FaReceipt />,
    image: receiptBuilder,
    url: 'http://localhost:3000/dashboard/receipt-customizer'
  },
  {
    id: 'inventory',
    title: 'PO Restock Manager',
    desc: 'Automatically tracks low-stock thresholds and exports detailed Purchase Order spreadsheets in a single click using SheetJS.',
    icon: <FaWarehouse />,
    image: autoRestock,
    url: 'http://localhost:3000/dashboard/inventory-manager'
  },
  {
    id: 'analytics',
    title: 'Cashier Leaderboards',
    desc: 'Evaluate shift sales volume metrics and cashier transactions rankings using interactive charting dashboards.',
    icon: <FaChartBar />,
    image: leaderboard,
    url: 'http://localhost:3000/dashboard/leaderboard'
  }
];

const Screenshots = () => {
  const [activeTab, setActiveTab] = useState('checkout');

  const activeScreen = screenshots.find(s => s.id === activeTab) || screenshots[0];

  return (
    <section className="py-20 bg-slate-50 border-t border-b border-slate-200/85 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
            Interactive Product Tour
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See the Actual Running System
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Take a visual tour of Suelto's active interfaces. These are 100% accurate screenshots captured directly from our live software environment.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {screenshots.map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveTab(screen.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                activeTab === screen.id
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-350 hover:bg-slate-50'
              }`}
            >
              {screen.icon}
              <span>{screen.title}</span>
            </button>
          ))}
        </div>

        {/* Browser Mockup Frame */}
        <div className="space-y-6 max-w-5xl mx-auto">
          
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            
            {/* Top Browser Bar */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              {/* Circular Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400 block" />
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 block" />
              </div>

              {/* Address bar input */}
              <div className="bg-white border border-slate-200 rounded-md py-1 px-4 text-[10px] font-semibold text-slate-400 font-mono w-[60%] sm:w-[50%] text-center truncate">
                {activeScreen.url}
              </div>

              <div className="w-12" />
            </div>

            {/* Embedded Screenshot Image */}
            <div className="p-1 bg-slate-50 flex justify-center border-b border-slate-200">
              <img 
                src={activeScreen.image} 
                alt={activeScreen.title} 
                className="w-full h-auto max-h-[500px] object-contain rounded-b border border-slate-200/40 bg-white"
              />
            </div>

            {/* Image caption/description */}
            <div className="p-6 bg-white space-y-2">
              <h3 className="font-extrabold text-slate-900 text-sm">{activeScreen.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-3xl">
                {activeScreen.desc}
              </p>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default Screenshots;
