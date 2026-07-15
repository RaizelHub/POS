import React from 'react';
import { motion } from 'framer-motion';
import { FaUserLock, FaBarcode, FaMoneyBillWave, FaPrint, FaArrowRight } from 'react-icons/fa';

const steps = [
  {
    title: 'Login Securely',
    desc: 'Verify registry token and type your secure 6-digit cashier PIN.',
    icon: <FaUserLock className="text-emerald-600" />
  },
  {
    title: 'Scan Products',
    desc: 'Input barcodes instantly to build customer shopping list tables.',
    icon: <FaBarcode className="text-emerald-600" />
  },
  {
    title: 'Receive Payment',
    desc: 'Select GCash/Maya QR scanner, card, cash, or configure split payments.',
    icon: <FaMoneyBillWave className="text-emerald-600" />
  },
  {
    title: 'Print Receipt',
    desc: 'Output optimized 80mm thermal receipts with customized headings.',
    icon: <FaPrint className="text-emerald-600" />
  }
];

const Workflow = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="workflow" className="py-20 bg-slate-50 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
            Operational Steps
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Designed for cashiers to open shifts, process client billing, and settle register audit logs without friction.
          </p>
        </div>

        {/* Workflow steps */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div
                variants={itemVariants}
                className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm space-y-4 text-center hover:border-emerald-300 transition-all duration-200 group relative"
              >
                
                {/* Step Icon */}
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {step.icon}
                </div>

                {/* Step Metadata */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 0{idx + 1}</span>
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Workflow;
