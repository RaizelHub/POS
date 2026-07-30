import { motion } from 'framer-motion';
import { FaArrowRight, FaCheck } from 'react-icons/fa';
import adminDashboard from '../../images/admin_dashboard.png';

const DashboardPreview = () => (
  <section id="dashboard" className="overflow-hidden bg-slate-950 px-5 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
    <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.72fr_1.28fr]">
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-400">Manager workspace</span>
        <h2 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.045em] sm:text-5xl">The day’s story, in one view.</h2>
        <p className="mt-6 text-sm font-medium leading-7 text-slate-400 sm:text-base">
          Keep a pulse on revenue, products, cashier activity, and low-stock items without chasing updates across different tools.
        </p>
        <ul className="mt-8 space-y-4">
          {['Live sales and catalog signals', 'Clear inventory attention list', 'Fast access to every back-office tool'].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-400"><FaCheck className="text-[8px]" /></span>
              {item}
            </li>
          ))}
        </ul>
        <a href="#product-tour" className="group mt-9 inline-flex items-center gap-3 text-sm font-bold text-white">
          Explore every screen
          <FaArrowRight className="text-[10px] text-emerald-400 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute -inset-10 bg-emerald-500/10 blur-3xl" />
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-slate-900 p-2 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Suelto administration</span>
            <span className="text-[9px] font-bold text-emerald-400">Live</span>
          </div>
          <img src={adminDashboard} alt="Suelto administration dashboard" className="w-full rounded-[17px] bg-white" />
        </div>
      </motion.div>
    </div>
  </section>
);

export default DashboardPreview;
