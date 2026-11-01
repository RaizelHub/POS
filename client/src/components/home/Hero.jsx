import { Link } from 'react-router-dom';
import { FaArrowRight, FaArrowDown, FaCheck, FaShieldAlt } from 'react-icons/fa';

const operationalHighlights = [
  {
    code: 'SPEC-01',
    label: 'Checkout Pipeline',
    value: 'Direct Barcode & Integer-Cent Accuracy',
    detail: 'Eliminates floating-point rounding errors across line items and split tender.',
  },
  {
    code: 'SPEC-02',
    label: 'Cashier Accountability',
    value: 'Mandatory Shift Cash Float',
    detail: 'Every transaction is immutably linked to an active shift and drawer opening log.',
  },
  {
    code: 'SPEC-03',
    label: 'Network Resilience',
    value: 'IndexedDB Durable Cache',
    detail: 'Full product search and local transaction queuing continue during outages.',
  },
];

const Hero = () => {
  return (
    <section className="bg-[#F2F0E9] border-b border-[#D0D0C7] pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Editorial Index Marker */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A14E38] bg-[#F0E4DD] px-2.5 py-1 rounded border border-[#D0D0C7]">
            01 / RETAIL OPERATIONS JOURNAL
          </span>
          <span className="h-px flex-1 bg-[#D0D0C7]" />
          <span className="font-mono text-[10px] text-[#656960] tracking-wider hidden sm:inline">
            SUELTO SYSTEM V1.0 · POINT OF SALE
          </span>
        </div>

        {/* Large Architectural Statement */}
        <div className="max-w-4xl space-y-6">
          <h1 className="font-serif sm:font-sans text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#242824] leading-[1.05]">
            Every sale <br />
            <span className="text-[#A14E38]">accounted for.</span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg lg:text-xl text-[#656960] leading-relaxed font-normal">
            One focused workspace for checkout, inventory, and daily store operations.
            Built for actual retail counters with instant barcode lookup, shift-bound cash drawers, and durable local continuity.
          </p>
        </div>

        {/* Primary and Secondary Action Cluster */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-md">
          <Link
            to="/login-selection"
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#FFFFFF] bg-[#242824] hover:bg-[#3A3E39] transition-colors rounded text-center shadow-none"
          >
            <span>Open register</span>
            <FaArrowRight className="text-[10px]" />
          </Link>

          <a
            href="#product-showcase"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold text-[#242824] hover:text-[#A14E38] transition-colors border border-[#D0D0C7] bg-[#FFFFFF] hover:bg-[#F2F0E9] rounded text-center"
          >
            <span>Explore the system</span>
            <FaArrowDown className="text-[9px] text-[#656960]" />
          </a>
        </div>

        {/* Verification Guarantee Points */}
        <div className="mt-8 pt-6 border-t border-[#D0D0C7] flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#656960]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
            Zero external cloud subscriptions required
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
            Atomic single-transaction stock deductions
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
            Immutable manager audit ledger
          </span>
        </div>

        {/* Operational System Specifications Table */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 border border-[#D0D0C7] bg-[#FFFFFF] rounded divide-y md:divide-y-0 md:divide-x divide-[#D0D0C7]">
          {operationalHighlights.map((spec) => (
            <div key={spec.code} className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#A14E38] tracking-widest uppercase">
                  {spec.code}
                </span>
                <span className="font-mono text-[10px] text-[#656960] uppercase">
                  {spec.label}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#242824] pt-1">
                {spec.value}
              </h3>
              <p className="text-xs text-[#656960] leading-relaxed">
                {spec.detail}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Hero;
