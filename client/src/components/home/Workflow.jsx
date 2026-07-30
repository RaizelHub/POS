import { motion } from 'framer-motion';
import { FaBarcode, FaMoneyBillWave, FaPrint, FaUserLock } from 'react-icons/fa';

const steps = [
  { title: 'Start a secure shift', desc: 'Sign in with a cashier PIN and confirm the opening float.', icon: FaUserLock },
  { title: 'Scan the basket', desc: 'Build the order with barcode lookup and a searchable catalog.', icon: FaBarcode },
  { title: 'Take payment', desc: 'Accept cash or digital methods and keep totals accurate.', icon: FaMoneyBillWave },
  { title: 'Close with confidence', desc: 'Print the receipt and carry every sale into the shift report.', icon: FaPrint }
];

const Workflow = () => (
  <section id="workflow" className="bg-white px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="max-w-2xl">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">The everyday flow</span>
        <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-5xl">Four steps from open to settled.</h2>
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        className="relative mt-12 grid gap-4 md:grid-cols-4"
      >
        <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-slate-200 md:block" />
        {steps.map(({ title, desc, icon: Icon }, index) => (
          <motion.article
            key={title}
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            className="relative rounded-[22px] border border-slate-200 bg-white p-6"
          >
            <div className="relative z-10 flex items-center justify-between">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10"><Icon /></span>
              <span className="text-3xl font-extrabold tracking-[-0.06em] text-slate-100">0{index + 1}</span>
            </div>
            <h3 className="mt-8 text-base font-extrabold text-slate-950">{title}</h3>
            <p className="mt-2 text-xs font-medium leading-6 text-slate-600">{desc}</p>
          </motion.article>
        ))}
      </motion.div>
    </div>
  </section>
);

export default Workflow;
