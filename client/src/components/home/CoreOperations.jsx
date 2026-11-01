import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const operations = [
  {
    number: '01',
    category: 'SELL',
    title: 'Fast, organized checkout.',
    subtitle: 'Ringing sales without friction',
    description:
      'Cashiers scan or search items in milliseconds. The checkout matrix supports quantity adjustments, manual discounts requiring supervisor roles, split tender calculations, and instant thermal receipt printing.',
    specs: [
      'Buffered USB & Bluetooth barcode scanner input',
      'Split tender: Cash, Digital (GCash/Maya), Store Credit',
      'Single-item returns and full transaction voids',
      'Automatic offline queueing if internet drops',
    ],
  },
  {
    number: '02',
    category: 'TRACK',
    title: 'Products and stock visibility.',
    subtitle: 'Reliable inventory movements',
    description:
      'Inventory updates automatically in the exact same atomic database transaction as the customer sale. Real-time low-stock alerts notify management before shelves run dry.',
    specs: [
      'Atomic MongoDB transactions (zero race conditions)',
      'Threshold warnings for low and out-of-stock items',
      'Supplier PO generation with single-click Excel export',
      'Comprehensive inventory adjustment reason codes',
    ],
  },
  {
    number: '03',
    category: 'REVIEW',
    title: 'Sales history and daily reporting.',
    subtitle: 'Financial clarity without guesswork',
    description:
      'Eliminate end-of-day reconciliation stress. Shift opening floats, cash-in/out drops, and closing drawer counts are balanced against ledger gross totals with 100% immutable audit logging.',
    specs: [
      'X and Z shift readings with cash float variance',
      'Role-based access: Cashier, Supervisor, Manager, Owner',
      'Central immutable audit log tracking administrative events',
      'Top-selling categories, profit margins, and hourly volume',
    ],
  },
];

const CoreOperations = () => {
  return (
    <section id="operations" className="bg-[#FFFFFF] py-16 sm:py-24 lg:py-28 border-b border-[#D0D0C7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#D0D0C7]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A14E38] bg-[#F0E4DD] px-2.5 py-0.5 rounded border border-[#D0D0C7]">
                03 / SYSTEM ARCHITECTURE
              </span>
              <span className="h-px w-10 bg-[#D0D0C7]" />
              <span className="font-mono text-[10px] text-[#656960] uppercase">
                RETAIL PIPELINE
              </span>
            </div>
            <h2 className="font-serif sm:font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#242824] leading-[1.1]">
              Three core operations.
            </h2>
            <p className="text-sm sm:text-base text-[#656960] leading-relaxed">
              SUELTO POS replaces disconnected tools with a disciplined, unified retail workflow spanning the front counter to the back office.
            </p>
          </div>

          <div className="font-mono text-xs text-[#656960]">
            ESTABLISHED WORKFLOW · 3 DISCIPLINED STAGES
          </div>
        </div>

        {/* Three Editorial Architectural Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#D0D0C7] border-b border-[#D0D0C7]">
          {operations.map((op) => (
            <div key={op.category} className="py-10 lg:py-12 lg:px-8 first:lg:pl-0 last:lg:pr-0 space-y-6">
              
              {/* Top Editorial Index */}
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-5xl font-bold tracking-tight text-[#242824]">
                  {op.number}
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#A14E38] bg-[#F0E4DD] px-2 py-0.5 rounded border border-[#D0D0C7]">
                  {op.category}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="font-sans text-xl font-bold text-[#242824] tracking-tight">
                  {op.title}
                </h3>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#656960]">
                  {op.subtitle}
                </p>
              </div>

              {/* Prose Description */}
              <p className="text-xs sm:text-sm text-[#656960] leading-relaxed">
                {op.description}
              </p>

              {/* Verified Feature Checklist */}
              <div className="pt-4 border-t border-[#D0D0C7] space-y-2.5">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#242824] block">
                  Verified Capabilities
                </span>
                <ul className="space-y-2 text-xs text-[#656960]">
                  {op.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2">
                      <span className="text-[#A14E38] font-mono text-[11px] leading-tight select-none">→</span>
                      <span className="leading-tight">{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CoreOperations;

