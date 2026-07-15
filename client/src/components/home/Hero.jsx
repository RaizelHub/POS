import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowRight, FaCheckCircle
} from 'react-icons/fa';
import finalScanPage from '../../images/final_scan_page.png';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const floatUpVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-6 lg:px-10 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Content Column */}
        <motion.div 
          className="lg:col-span-5 space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Subtitle / Registry Status */}
          <motion.div 
            variants={floatUpVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Designed for Commercial Enterprise & Supermarkets
          </motion.div>

          {/* Premium Headline */}
          <motion.h1 
            variants={floatUpVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
          >
            Everything Your Store Needs <br className="hidden sm:inline" />
            <span className="text-emerald-600">Inside One POS Platform.</span>
          </motion.h1>

          {/* Short Description */}
          <motion.p 
            variants={floatUpVariants}
            className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed max-w-xl"
          >
            Suelto is a high-performance cash management system designed for speed, safety, and inventory oversight. Accelerate terminal transactions and unify back-office logs in real-time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={floatUpVariants}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              to="/login-selection"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-98"
            >
              <span>Launch POS Console</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-6 py-3.5 rounded-lg shadow-sm transition-all active:scale-98"
            >
              Register Cashier
            </Link>
          </motion.div>

          {/* Trust points */}
          <motion.div 
            variants={floatUpVariants}
            className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500"
          >
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500 text-sm" />
              <span>99.9% Cloud Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500 text-sm" />
              <span>EMV / PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500 text-sm" />
              <span>Real-Time Auditing</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500 text-sm" />
              <span>Hardware Ready</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Preview Column (Mockup Dashboard) */}
        <motion.div 
          className="lg:col-span-7"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* OS Window Frame */}
          <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            
            {/* Top Title Bar */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400 block" />
                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 block" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 block" />
              </div>
              <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">SUELTO Retail Terminal Console</span>
              <div className="w-12" />
            </div>

            {/* Simulated UI Area */}
            <div className="p-1 bg-slate-50 flex items-center justify-center">
              <img 
                src={finalScanPage} 
                alt="SUELTO Cashier Scan Terminal" 
                className="w-full h-auto object-contain rounded-b-xl" 
              />
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
