import React from 'react';
import { FaStore, FaShoppingBasket, FaBook, FaCoffee, FaTshirt, FaBoxes } from 'react-icons/fa';

const storeTypes = [
  {
    icon: FaShoppingBasket,
    type: 'Bodegas & Neighborhood Groceries',
    tag: 'HIGH-FREQUENCY LANES',
    description:
      'Engineered for fast-paced counters with thousands of diverse SKUs, rapid barcode ringing, and split cash transactions.',
  },
  {
    icon: FaStore,
    type: 'Convenience Stores & Mini Marts',
    tag: 'ROUND-THE-CLOCK SHIFTS',
    description:
      'Enforces disciplined shift float handoffs and exact cash drawer accountability across multiple cashiers every 24 hours.',
  },
  {
    icon: FaBook,
    type: 'Stationery & School Supply Shops',
    tag: 'HIGH ITEM COUNTS',
    description:
      'Fast search lookup by name or barcode for extensive supply catalogs, with support for batch discounts and customer accounts.',
  },
  {
    icon: FaTshirt,
    type: 'Boutiques & Specialty Retail',
    tag: 'PRODUCT CATALOGS',
    description:
      'Clean inventory categorization, dynamic thermal receipt notes, and customer purchase ledger history for repeat clientele.',
  },
  {
    icon: FaCoffee,
    type: 'Neighborhood Cafes & Bakeries',
    tag: 'COUNTER FLOW',
    description:
      'Immediate cash/digital tender checkout, customer loyalty identification, and rapid daily gross sales summaries.',
  },
  {
    icon: FaBoxes,
    type: 'Hardware & General Merchandise',
    tag: 'STOCK REORDERING',
    description:
      'Automated low-stock threshold monitoring with direct one-click purchase order spreadsheet generation for distributors.',
  },
];

const StoreTypes = () => {
  return (
    <section id="store-types" className="bg-[#F2F0E9] py-16 sm:py-24 lg:py-28 border-b border-[#D0D0C7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#D0D0C7]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A14E38] bg-[#F0E4DD] px-2.5 py-0.5 rounded border border-[#D0D0C7]">
                06 / INTENDED USE CASES
              </span>
              <span className="h-px w-10 bg-[#D0D0C7]" />
              <span className="font-mono text-[10px] text-[#656960] uppercase">
                RETAIL SCOPE
              </span>
            </div>
            <h2 className="font-serif sm:font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#242824] leading-[1.1]">
              Built for independent retail counters.
            </h2>
            <p className="text-sm sm:text-base text-[#656960] leading-relaxed">
              Designed specifically for small and medium retail merchants who require enterprise-grade inventory consistency without enterprise-grade software bloat.
            </p>
          </div>

          <div className="font-mono text-xs text-[#656960]">
            6 TARGET STORE ENVIRONMENTS
          </div>
        </div>

        {/* Editorial Retail Grid (Zero Gradients, Pure Flat Architecture) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                className="p-6 sm:p-7 border border-[#D0D0C7] bg-[#FFFFFF] rounded flex flex-col justify-between space-y-4 hover:border-[#242824] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded border border-[#D0D0C7] bg-[#F2F0E9] flex items-center justify-center text-[#A14E38] text-sm">
                      <Icon />
                    </span>
                    <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#656960] bg-[#F2F0E9] px-2 py-0.5 rounded border border-[#D0D0C7]">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-sans text-base font-bold text-[#242824] tracking-tight">
                    {item.type}
                  </h3>

                  <p className="text-xs text-[#656960] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D0D0C7] flex items-center justify-between text-[10px] font-mono text-[#656960]">
                  <span>DEPLOYMENT: LOCAL / CLOUD</span>
                  <span className="text-[#166534] font-semibold">SUITABLE</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default StoreTypes;

