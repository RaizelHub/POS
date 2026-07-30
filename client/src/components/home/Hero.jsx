import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaBarcode,
  FaBoxOpen,
  FaCheck,
  FaChartLine,
  FaPlay
} from 'react-icons/fa';
import finalScanPage from '../../images/final_scan_page.png';

const trustPoints = ['No complicated setup', 'Built for fast-moving counters', 'Clear end-of-day totals'];

const Hero = () => {
  const rise = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="relative overflow-hidden bg-[#f4f7f3] px-5 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
      <div className="pointer-events-none absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[460px] w-[460px] rounded-full bg-sky-100/70 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:radial-gradient(#64748b_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }} className="max-w-2xl">
          <motion.div variants={rise} className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            Point of sale for independent retail
          </motion.div>

          <motion.h1 variants={rise} className="text-[44px] font-extrabold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[68px]">
            Run the counter.
            <span className="mt-2 block text-emerald-700">See the whole store.</span>
          </motion.h1>

          <motion.p variants={rise} className="mt-7 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            Checkout, stock, shifts, receipts, and daily reporting—one focused workspace that keeps every sale moving.
          </motion.p>

          <motion.div variants={rise} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login-selection"
              className="group flex items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Open register
              <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#product-tour"
              className="flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white/80 px-6 py-4 text-sm font-bold text-slate-800 transition-all hover:border-slate-400 hover:bg-white"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-700"><FaPlay className="ml-0.5 text-[8px]" /></span>
              See the product
            </a>
          </motion.div>

          <motion.div variants={rise} className="mt-8 flex flex-col gap-3 border-t border-slate-300/70 pt-6 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {trustPoints.map((point) => (
              <span key={point} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700"><FaCheck className="text-[8px]" /></span>
                {point}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-emerald-300/35 via-white/40 to-sky-200/40 blur-xl" />
          <div className="relative overflow-hidden rounded-[24px] border border-white/80 bg-slate-950 p-2.5 shadow-[0_35px_80px_-28px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Main branch · Register 01</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
            </div>
            <div className="overflow-hidden rounded-[17px] bg-white">
              <img src={finalScanPage} alt="Suelto checkout workspace" className="h-auto w-full object-cover" />
            </div>
          </div>

          <div className="absolute -bottom-7 left-3 flex items-center gap-3 rounded-2xl border border-white bg-white/95 p-3 shadow-xl sm:-left-7 sm:p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><FaBarcode /></span>
            <span><strong className="block text-xs text-slate-950">Scan-ready checkout</strong><span className="text-[10px] font-medium text-slate-500">Built for speed at the counter</span></span>
          </div>
          <div className="absolute -right-2 top-12 hidden items-center gap-3 rounded-2xl border border-white bg-white/95 p-4 shadow-xl sm:flex lg:-right-6">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-700"><FaChartLine /></span>
            <span><strong className="block text-xs text-slate-950">Live store view</strong><span className="text-[10px] font-medium text-slate-500">Sales, shifts & stock</span></span>
          </div>
        </motion.div>
      </div>

      <div className="relative mx-auto mt-20 grid max-w-7xl grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm sm:grid-cols-3">
        {[
          { icon: FaBarcode, value: 'Faster', label: 'barcode-first checkout' },
          { icon: FaBoxOpen, value: 'Automatic', label: 'stock movement tracking' },
          { icon: FaChartLine, value: 'Clear', label: 'shift and sales reporting' }
        ].map(({ icon: Icon, value, label }, index) => (
          <div key={label} className={`flex items-center gap-4 px-6 py-5 ${index ? 'border-t border-slate-200 sm:border-l sm:border-t-0' : ''}`}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon /></span>
            <span><strong className="block text-sm text-slate-950">{value}</strong><span className="text-xs font-medium text-slate-500">{label}</span></span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
