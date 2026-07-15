import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaStore, FaShoppingBasket, FaBookOpen, FaCoffee, 
  FaBirthdayCake, FaPills, FaHandshake 
} from 'react-icons/fa';

const types = [
  {
    title: 'Retail Store',
    desc: 'Manage apparel lookups, barcodes, multi-payment options, and customer loyalty profiles.',
    icon: <FaStore className="text-emerald-600" />
  },
  {
    title: 'Mini Mart',
    desc: 'Audit high-volume checkouts quickly with instant drawer reconciliation.',
    icon: <FaShoppingBasket className="text-emerald-600" />
  },
  {
    title: 'Convenience Store',
    desc: 'Optimized for shifts log changes, cash-in/out registers, and secure cashier logins.',
    icon: <FaHandshake className="text-emerald-600" />
  },
  {
    title: 'Cafe & Bakery',
    desc: 'Ideal for custom tax builders, customer receipt templates, and cashier leaderboards.',
    icon: <FaCoffee className="text-emerald-600" />
  },
  {
    title: 'Pharmacy',
    desc: 'Keep track of low-stock thresholds, item categories, and generate purchase orders.',
    icon: <FaPills className="text-emerald-600" />
  },
  {
    title: 'Bookstore',
    desc: 'Scan ISBN tags and catalog logs with automated restocking indicators.',
    icon: <FaBookOpen className="text-emerald-600" />
  }
];

const BusinessTypes = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
    <section id="industries" className="py-20 bg-white border-t border-b border-slate-200/80 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
            Tailored Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Diverse Commercial Sectors
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            From university bookstores to neighborhood mini marts, Suelto adapts to your specific cash operations and catalog requirements.
          </p>
        </div>

        {/* Business Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {types.map((type, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white border border-slate-200 p-6 rounded-lg hover:shadow-md transition-all duration-200 group hover:border-emerald-300 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-sm shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200 shrink-0">
                {type.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                  {type.title}
                </h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {type.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default BusinessTypes;
