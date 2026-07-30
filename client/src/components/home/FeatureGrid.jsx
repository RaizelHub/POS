import { motion } from 'framer-motion';
import {
  FaBarcode,
  FaChartBar,
  FaFileInvoiceDollar,
  FaHistory,
  FaReceipt,
  FaShieldAlt,
  FaTags,
  FaTruck,
  FaWarehouse
} from 'react-icons/fa';

const coreFeatures = [
  {
    title: 'A checkout that stays out of the way',
    desc: 'Scan items, attach a customer, apply discounts, and take cash or digital payments from one calm, focused screen.',
    label: 'Counter',
    icon: FaBarcode,
    className: 'lg:col-span-2',
    accent: 'bg-emerald-50 text-emerald-700'
  },
  {
    title: 'Inventory that updates itself',
    desc: 'Every completed sale adjusts stock. Low-level warnings help your team reorder before the shelf is empty.',
    label: 'Stock',
    icon: FaWarehouse,
    className: '',
    accent: 'bg-amber-50 text-amber-700'
  },
  {
    title: 'A complete shift trail',
    desc: 'Track opening floats, cash drops, drawer movements, and closing variance with accountability built in.',
    label: 'Control',
    icon: FaShieldAlt,
    className: '',
    accent: 'bg-sky-50 text-sky-700'
  },
  {
    title: 'Reports you can act on',
    desc: 'See sales performance, product movement, cashier activity, and transaction history without assembling spreadsheets.',
    label: 'Insight',
    icon: FaChartBar,
    className: 'lg:col-span-2',
    accent: 'bg-violet-50 text-violet-700'
  }
];

const supportingFeatures = [
  { title: 'Receipt builder', icon: FaReceipt },
  { title: 'Purchase orders', icon: FaFileInvoiceDollar },
  { title: 'Supplier directory', icon: FaTruck },
  { title: 'Coupons & discounts', icon: FaTags },
  { title: 'Refund history', icon: FaHistory }
];

const FeatureGrid = () => (
  <section id="features" className="bg-white px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">Everything your store needs</span>
          <h2 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.06] tracking-[-0.045em] text-slate-950 sm:text-5xl">
            Less switching. More selling.
          </h2>
        </div>
        <p className="max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base lg:justify-self-end">
          Suelto connects the moments at the counter with the work behind it, giving cashiers a faster flow and managers a more dependable view of the day.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid gap-4 lg:grid-cols-3"
      >
        {coreFeatures.map(({ title, desc, label, icon: Icon, className, accent }) => (
          <motion.article
            key={title}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
            className={`group relative min-h-[260px] overflow-hidden rounded-[24px] border border-slate-200 bg-[#f8faf8] p-7 transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/5 sm:p-8 ${className}`}
          >
            <div className="absolute -bottom-14 -right-12 h-40 w-40 rounded-full bg-emerald-100/40 blur-2xl transition-transform group-hover:scale-125" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}><Icon /></span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{label}</span>
              </div>
              <div className="mt-auto pt-12">
                <h3 className="max-w-lg text-xl font-extrabold tracking-[-0.025em] text-slate-950 sm:text-2xl">{title}</h3>
                <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-600">{desc}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {supportingFeatures.map(({ title, icon: Icon }) => (
          <div key={title} className="flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-bold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon /></span>
            {title}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureGrid;
