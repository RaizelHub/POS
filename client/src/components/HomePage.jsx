import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaBarcode, FaChartBar, FaReceipt, FaUsers, FaShieldAlt, 
  FaChevronRight, FaStore, FaClock, FaTags, FaExchangeAlt, 
  FaBolt, FaAward, FaWarehouse, FaGem
} from "react-icons/fa";
import novaLogo from "../images/nova_logo.png";

const HomePage = () => {
  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Upward floating item variant
  const floatUpVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] // Expo curve
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased selection:bg-emerald-500/10 selection:text-emerald-800 relative overflow-hidden">
      
      {/* Soft Pastel Background Glow Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-radial-gradient from-emerald-500/5 via-emerald-500/1 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[45vw] h-[45vw] bg-radial-gradient from-indigo-500/5 via-indigo-500/1 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Premium Light Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img src={novaLogo} alt="SUELTO Logo" className="h-9 w-auto object-contain rounded-lg border border-slate-100 shadow-sm p-0.5 bg-white" />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg">
            SUELTO
          </span>
        </div>
        
        <div className="flex items-center gap-5">
          <Link
            to="/admin-login"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs transition-colors px-3 py-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
          >
            <FaShieldAlt className="text-[10px]" />
            <span>Admin Gateway</span>
          </Link>
          <Link
            to="/login-selection"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl shadow-md shadow-emerald-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Cashier Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 overflow-hidden">
        <motion.div 
          className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-7"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Subtitle Badge */}
          <motion.div 
            variants={floatUpVariants} 
            className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-extrabold px-4.5 py-2 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5"
          >
            <FaGem className="text-[9px]" /> Developed for Modern Commercial Enterprises
          </motion.div>

          {/* Premium Headline */}
          <motion.h1 
            variants={floatUpVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl"
          >
            Next-Gen Checkout & <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-500">Sales Management OS</span>
          </motion.h1>

          {/* Intro Description */}
          <motion.p 
            variants={floatUpVariants}
            className="text-slate-500 text-sm sm:text-base md:text-lg max-w-3xl font-medium leading-relaxed"
          >
            Process customer queues instantly, configure thermal receipt templates dynamically, track inventory thresholds, and review sales logs within a high-performance terminal.
          </motion.p>

          {/* Actions */}
          <motion.div 
            variants={floatUpVariants}
            className="flex flex-wrap items-center justify-center gap-4 pt-3"
          >
            <Link
              to="/login-selection"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Initialize Workstation</span>
              <FaChevronRight className="text-[9px] stroke-[3]" />
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              Register Cashier
            </Link>
          </motion.div>

          {/* Quick Stats Dashboard Banner */}
          <motion.div 
            variants={floatUpVariants}
            className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-px bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 mt-10 shadow-md shadow-slate-100/50"
          >
            <div className="text-center space-y-1.5">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">&lt; 100ms</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5"><FaBolt /> Scanning Speed</p>
            </div>
            <div className="text-center space-y-1.5 md:border-l md:border-slate-100">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono tracking-tight">100%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5"><FaWarehouse /> Catalog Sync</p>
            </div>
            <div className="text-center space-y-1.5 md:border-l md:border-slate-100">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">80mm</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5"><FaReceipt /> Custom Print</p>
            </div>
            <div className="text-center space-y-1.5 md:border-l md:border-slate-100">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono tracking-tight">Real-Time</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5"><FaAward /> Leaderboards</p>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Grid: Features */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full space-y-14 relative z-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Terminal Operations & Capabilities</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">Equipped with enterprise commerce toolkits built for rapid processing and cashier efficiency.</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Feature 1 */}
          <motion.div variants={floatUpVariants} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm group-hover:text-white group-hover:bg-emerald-600 transition-all">
              <FaBarcode />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Instant Barcode Scanning</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Standard hardware-scanners input retail codes in real-time, matching database SKUs and adding items to carts instantly.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={floatUpVariants} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm group-hover:text-white group-hover:bg-emerald-600 transition-all">
              <FaTags />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Low Stock Alerts</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Define stock count thresholds for products. Get automatic warning alerts in red when stock falls below safety levels.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={floatUpVariants} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm group-hover:text-white group-hover:bg-emerald-600 transition-all">
              <FaExchangeAlt />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Multi-Payment Billing</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Accept GCash/Maya QR payments with scanning animations, card transactions, or configure split cash/digital fractions.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div variants={floatUpVariants} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm group-hover:text-white group-hover:bg-emerald-600 transition-all">
              <FaReceipt />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Receipt Template Customizer</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Modify invoice layouts, contact data, headers, and footers directly from the admin panel with a live paper roll simulator.
            </p>
          </motion.div>

          {/* Feature 5 */}
          <motion.div variants={floatUpVariants} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm group-hover:text-white group-hover:bg-emerald-600 transition-all">
              <FaChartBar />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cashier Leaderboards</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Compare sales volume performance and transactional count charts between shifts with interactive chart visualizations.
            </p>
          </motion.div>

          {/* Feature 6 */}
          <motion.div variants={floatUpVariants} className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm group-hover:text-white group-hover:bg-emerald-600 transition-all">
              <FaClock />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Float Shifts & Drawer Logs</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Track starting/ending cash floats, log mid-shift drops or payouts, and evaluate drawer cash variance automatically.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Industries Block */}
      <section className="bg-white border-t border-b border-slate-200 py-16 px-6 relative z-10 shadow-sm">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Optimal For Standard Small Businesses</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">Providing seamless checkout logistics and automated reports for university stores, boutique kiosks, and shops.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {['Co-op Grocery', 'School Cafeteria', 'College Bookstores', 'Mini Marts', 'Retail Boutiques'].map((ind) => (
              <span key={ind} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl shadow-sm">
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Elegant Light Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 mt-auto border-t border-slate-850 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-xs">
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img src={novaLogo} alt="SUELTO Logo" className="h-7 w-auto object-contain brightness-0 invert" />
              <span className="font-bold text-white text-sm tracking-wide">SUELTO POS</span>
            </div>
            <p className="text-[10px] text-slate-500">Premium Retail Terminal & Cash Operations System.</p>
          </div>
          
          <div className="flex gap-8 text-[11px] font-semibold">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Support Helpdesk</span>
          </div>
          
          <p className="text-[10px] text-slate-500 font-medium">© 2026 SUELTO. Crafted for elite cashier operations.</p>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
