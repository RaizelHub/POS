import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaLaptop, FaBarcode, FaReceipt, FaWarehouse } from 'react-icons/fa';

import adminDashboard from '../../images/admin_dashboard.png';
import finalScanPage from '../../images/final_scan_page.png';
import receiptBuilder from '../../images/receipt_builder.png';
import autoRestock from '../../images/auto_restock.png';

const screenshots = [
  {
    id: 'dashboard',
    title: 'Admin Dashboard',
    desc: 'The central administration gateway for viewing net checkout volumes, pending cashier logs, and shift floats variance.',
    icon: <FaLaptop />,
    image: adminDashboard,
    path: 'Overview'
  },
  {
    id: 'checkout',
    title: 'Cashier Scanner Console',
    desc: 'A barcode-ready scanner terminal equipped with customer loyalty pickers, credit ledgers, and transaction cash adjustments.',
    icon: <FaBarcode />,
    image: finalScanPage,
    path: 'Checkout'
  },
  {
    id: 'receipt',
    title: 'Receipt Builder Preview',
    desc: 'Dynamically customize contact info, headers, tax numbers, and footer slogans with a side-by-side thermal roll preview.',
    icon: <FaReceipt />,
    image: receiptBuilder,
    path: 'Receipt builder'
  },
  {
    id: 'inventory',
    title: 'PO Restock Manager',
    desc: 'Automatically tracks low-stock thresholds and exports detailed Purchase Order spreadsheets in a single click using SheetJS.',
    icon: <FaWarehouse />,
    image: autoRestock,
    path: 'Inventory'
  }
];

const Screenshots = () => {
  const [activeTab, setActiveTab] = useState('checkout');

  const activeScreen = screenshots.find(s => s.id === activeTab) || screenshots[0];

  return (
    <section id="product-tour" className="bg-[#f4f7f3] px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">
            Product tour
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-5xl">
            A closer look at Suelto
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
            Move through the core workspaces your cashiers and managers use every day.
          </p>
        </div>

        <div className="mt-10 flex snap-x gap-2 overflow-x-auto pb-3 sm:flex-wrap sm:justify-center">
          {screenshots.map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveTab(screen.id)}
              className={`flex shrink-0 snap-start items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition-all ${
                activeTab === screen.id
                  ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {screen.icon}
              <span>{screen.title}</span>
            </button>
          ))}
        </div>

        <div className="mx-auto mt-7 max-w-6xl">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_28px_70px_-35px_rgba(15,23,42,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="block h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="block h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="block h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="w-[55%] truncate rounded-lg bg-slate-100 px-4 py-1.5 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:w-[40%]">
                Suelto · {activeScreen.path}
              </div>
              <div className="w-10 text-right text-[9px] font-bold text-emerald-600">LIVE</div>
            </div>

            <div className="flex justify-center bg-slate-100 p-2 sm:p-3">
              <img 
                src={activeScreen.image} 
                alt={activeScreen.title} 
                className="h-auto max-h-[570px] w-full rounded-xl border border-slate-200 bg-white object-contain"
              />
            </div>

            <div className="grid gap-2 border-t border-slate-200 bg-white p-5 sm:grid-cols-[0.32fr_0.68fr] sm:items-center sm:p-7">
              <h3 className="text-base font-extrabold tracking-tight text-slate-950">{activeScreen.title}</h3>
              <p className="text-xs font-medium leading-6 text-slate-600 sm:text-sm">
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
