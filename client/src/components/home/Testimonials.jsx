import React from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const reviews = [
  {
    name: 'Janmark Suelto',
    role: 'Store Owner',
    business: 'Suelto Mini Mart',
    text: 'Suelto completely transformed our cash drawer audit flow. The low-stock purchase order exports saved us hours of inventory reporting every week.',
    rating: 5
  },
  {
    name: 'Sarah Jenkins',
    role: 'General Manager',
    business: 'Metro Kiosk & Books',
    text: 'We configured our GCash dynamic QR codes and thermal receipt parameters in under five minutes. The sales performance leaderboard has driven team efficiency.',
    rating: 5
  },
  {
    name: 'Robert Diaz',
    role: 'Head Cashier',
    business: 'University Coop Grocery',
    text: 'The barcode scanning response time is incredibly fast, and the credit collections tab lets me look up unpaid receipts instantly without leaving my scanner screen.',
    rating: 5
  }
];

const Testimonials = () => {
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
    <section id="testimonials" className="py-20 bg-white border-t border-b border-slate-200/80 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
            Client Success
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Cashiers and Managers
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Here is what small business operators and supervisors say about the security and speed of Suelto POS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-slate-50 border border-slate-200 p-6 rounded-lg shadow-sm space-y-4 hover:border-emerald-300 transition-all duration-200"
            >
              
              {/* Star Rating */}
              <div className="flex gap-1 text-amber-500 text-xs">
                {[...Array(rev.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-slate-600 text-xs leading-relaxed italic">
                "{rev.text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <FaUserCircle className="text-slate-400 text-3xl shrink-0" />
                <div className="text-left">
                  <h4 className="font-bold text-slate-900 text-xs">{rev.name}</h4>
                  <p className="text-slate-550 text-[10px] font-semibold">{rev.role} • {rev.business}</p>
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Testimonials;
