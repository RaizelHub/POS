import { motion } from 'framer-motion';
import { FaBookOpen, FaCoffee, FaHandshake, FaPills, FaShoppingBasket, FaStore } from 'react-icons/fa';

const types = [
  { title: 'Retail store', desc: 'Catalog, barcodes, discounts, and customer profiles.', icon: FaStore },
  { title: 'Mini mart', desc: 'Quick checkout and dependable drawer reconciliation.', icon: FaShoppingBasket },
  { title: 'Convenience store', desc: 'Secure shift handoffs and high-volume counter flow.', icon: FaHandshake },
  { title: 'Cafe & bakery', desc: 'Flexible receipts, payments, and staff performance.', icon: FaCoffee },
  { title: 'Pharmacy', desc: 'Stock thresholds, categories, and purchase orders.', icon: FaPills },
  { title: 'Bookstore', desc: 'ISBN scanning and intelligent restocking signals.', icon: FaBookOpen }
];

const BusinessTypes = () => (
  <section id="industries" className="border-y border-slate-200 bg-[#f4f7f3] px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">Made for local commerce</span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-5xl">One system, many kinds of counter.</h2>
        </div>
        <p className="max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base lg:justify-self-end">
          Suelto adapts to the rhythm of your store while keeping the checkout experience familiar for every cashier.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {types.map(({ title, desc, icon: Icon }) => (
          <motion.article
            key={title}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-900/5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white"><Icon /></span>
            <span>
              <strong className="block text-sm font-extrabold text-slate-950">{title}</strong>
              <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">{desc}</span>
            </span>
          </motion.article>
        ))}
      </motion.div>
    </div>
  </section>
);

export default BusinessTypes;
