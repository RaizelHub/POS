import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaBarcode, FaReceipt, FaWarehouse, FaTruck, FaFileInvoiceDollar, 
  FaTags, FaChartBar, FaUserShield, FaHistory, FaFolderOpen, 
  FaUndo, FaCalendarCheck 
} from 'react-icons/fa';

const features = [
  {
    title: 'Barcode Scanner',
    desc: 'Instant hardware scanner lookup using lightning-fast database SKU matching.',
    badge: 'Live',
    icon: <FaBarcode />
  },
  {
    title: 'Thermal Receipt Customizer',
    desc: 'Dynamic template builder with side-by-side live receipt roll rendering.',
    badge: 'Built-in',
    icon: <FaReceipt />
  },
  {
    title: 'Inventory Management',
    desc: 'Automatic deductions on checkouts with warning levels for safety thresholds.',
    badge: 'Automated',
    icon: <FaWarehouse />
  },
  {
    title: 'Supplier Contacts',
    desc: 'Organize vendor credentials and warehouse shipping protocols in one table.',
    badge: 'Built-in',
    icon: <FaTruck />
  },
  {
    title: 'Purchase Orders',
    desc: 'Auto-compile reorders and download formatted Excel sheets using SheetJS.',
    badge: 'Automated',
    icon: <FaFileInvoiceDollar />
  },
  {
    title: 'Discount & Coupon System',
    desc: 'Configure price markdowns, percentage discounts, and loyalty coupon entries.',
    badge: 'Live',
    icon: <FaTags />
  },
  {
    title: 'Shift Sales Reports',
    desc: 'Generate shift sales breakdowns showing exact drawer variance calculations.',
    badge: 'Live',
    icon: <FaChartBar />
  },
  {
    title: 'Role Permissions',
    desc: 'Define distinct cashier access locks and administrative credentials.',
    badge: 'Built-in',
    icon: <FaUserShield />
  },
  {
    title: 'Audit Logs & Cash Drops',
    desc: 'Log shift drawer cash adjustments, deposits, supplier payouts, and logs.',
    badge: 'Automated',
    icon: <FaFolderOpen />
  },
  {
    title: 'Cash Drawer Control',
    desc: 'Monitor starting floats and audit register actions automatically.',
    badge: 'Live',
    icon: <FaUndo />
  },
  {
    title: 'Transaction Returns',
    desc: 'Process voids, transaction refunds, and update inventory counts on returns.',
    badge: 'Built-in',
    icon: <FaHistory />
  },
  {
    title: 'Transaction History',
    desc: 'Audited log histories of all checkouts filtered by cashiers and dates.',
    badge: 'Live',
    icon: <FaCalendarCheck />
  }
];

const FeatureGrid = () => {
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
    <section id="features" className="py-20 bg-slate-50 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Reliable Store Auditing
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Eliminate operational bottlenecks with optimized checkout layouts, automated stock level calculations, and unified shift cash drops tracking.
          </p>
        </div>

        {/* Feature Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white border border-slate-200 p-5 rounded-lg hover:shadow-md transition-all duration-200 group flex flex-col justify-between hover:border-emerald-300"
            >
              <div className="space-y-4">
                
                {/* Feature Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-100 text-emerald-600 flex items-center justify-center text-sm shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                    {feat.icon}
                  </div>
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {feat.badge}
                  </span>
                </div>

                {/* Text Content */}
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default FeatureGrid;
