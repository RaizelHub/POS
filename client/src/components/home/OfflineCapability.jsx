import React from 'react';
import { FaDatabase, FaWifi, FaSyncAlt, FaExclamationTriangle } from 'react-icons/fa';

const offlinePillars = [
  {
    icon: FaDatabase,
    title: 'IndexedDB Catalog Caching',
    description:
      'Store products and prices are securely cached in client-side IndexedDB with barcode, SKU, and category indexes for instant local querying.',
  },
  {
    icon: FaSyncAlt,
    title: 'Durable Pending Queue',
    description:
      'Cash transactions recorded during network outages are queued locally and automatically synchronized with MongoDB when connectivity returns.',
  },
  {
    icon: FaWifi,
    title: 'Multi-Tier Connectivity Detection',
    description:
      'Distinguishes between device hardware disconnects and backend server maintenance without aggressive polling or battery drain.',
  },
];

const OfflineCapability = () => {
  return (
    <section id="offline" className="bg-[#FFFFFF] py-16 sm:py-24 lg:py-28 border-b border-[#D0D0C7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#D0D0C7]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A14E38] bg-[#F0E4DD] px-2.5 py-0.5 rounded border border-[#D0D0C7]">
                07 / NETWORK CONTINUITY
              </span>
              <span className="h-px w-10 bg-[#D0D0C7]" />
              <span className="font-mono text-[10px] text-[#656960] uppercase">
                RESILIENT ARCHITECTURE
              </span>
            </div>
            <h2 className="font-serif sm:font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#242824] leading-[1.1]">
              Offline-first retail resilience.
            </h2>
            <p className="text-sm sm:text-base text-[#656960] leading-relaxed">
              Internet connections drop; retail counters cannot. SUELTO POS caches your catalog locally in browser storage so ringing sales never stops.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#166534] bg-[#F2F0E9] px-3 py-1.5 rounded border border-[#D0D0C7]">
            <span className="w-2 h-2 rounded-full bg-[#166534]" />
            <span>PROGRESSIVE WEB APP READY</span>
          </div>
        </div>

        {/* 3 Pillar Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {offlinePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 sm:p-7 border border-[#D0D0C7] bg-[#F2F0E9] rounded space-y-4"
              >
                <div className="w-9 h-9 rounded border border-[#D0D0C7] bg-[#FFFFFF] flex items-center justify-center text-[#A14E38]">
                  <Icon className="text-sm" />
                </div>
                <h3 className="font-sans text-base font-bold text-[#242824]">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#656960] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Clear Boundaries & Honest System Limits Box (Zero Gradients) */}
        <div className="mt-8 p-5 sm:p-6 border border-[#D0D0C7] bg-[#F0E4DD] rounded text-xs text-[#242824] space-y-2">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#A14E38]">
            <FaExclamationTriangle />
            <span>Operational Notice & Scope Boundaries</span>
          </div>
          <p className="leading-relaxed text-[#656960]">
            Cash transactions and catalog browsing are durable offline. However, digital e-wallet settlements (GCash/Maya) and real-time cross-terminal inventory reservations require active server connectivity. Offline sales are reconciled sequentially upon reconnection to prevent database conflicts.
          </p>
        </div>

      </div>
    </section>
  );
};

export default OfflineCapability;

