import { FaBarcode, FaCalculator, FaReceipt, FaUsers } from 'react-icons/fa';
import finalScanPage from '../../images/final_scan_page.png';

const features = [
  {
    icon: FaBarcode,
    title: 'Integrated Barcode Reader',
    description: 'Instant keystroke-buffered scanner input with automatic duplicate prevention and stock checking.',
  },
  {
    icon: FaUsers,
    title: 'Customer Directory & Credit',
    description: 'Lookup existing customer accounts, track credit balances, and apply loyalty membership perks.',
  },
  {
    icon: FaCalculator,
    title: 'Split & Digital Tenders',
    description: 'Accept split cash and digital payment methods with mandatory reference verification codes.',
  },
  {
    icon: FaReceipt,
    title: 'Thermal Slip Generation',
    description: 'Automatic ESC/POS and PDF printable customer receipts with dynamic tax breakdowns and store notes.',
  },
];

const ProductShowcase = () => {
  return (
    <section id="product-showcase" className="bg-[#242824] text-[#FFFFFF] py-16 sm:py-24 lg:py-28 border-b border-[#D0D0C7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-8 border-b border-[#3D423D]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F0E4DD] bg-[#A14E38] px-2.5 py-0.5 rounded">
                02 / THE REGISTER
              </span>
              <span className="h-px w-12 bg-[#3D423D]" />
              <span className="font-mono text-[10px] text-[#A6AAA1] uppercase tracking-wider">
                CORE WORKSPACE
              </span>
            </div>
            <h2 className="font-serif sm:font-sans text-3xl sm:text-5xl font-bold tracking-tight text-[#FFFFFF] leading-[1.1]">
              Everything you need at the counter.
            </h2>
            <p className="text-sm sm:text-base text-[#A6AAA1] leading-relaxed">
              An unencumbered terminal designed for high-throughput retail lanes. Fast keystrokes, direct catalog filtering, and immediate inventory verification on every ring.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-[#A6AAA1]">
            <span className="w-2 h-2 rounded-full bg-[#166534]" />
            <span>TERMINAL STATUS: READY FOR SERVICE</span>
          </div>
        </div>

        {/* Authentic Full-Width Product Screenshot Showcase */}
        <div className="border border-[#3D423D] bg-[#1B1E1B] p-2.5 sm:p-4 rounded-xl">
          {/* Hardware Frame Titlebar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#3D423D] mb-3 text-[11px] font-mono text-[#A6AAA1]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FFFFFF]">SUELTO POS</span>
              <span className="text-[#3D423D]">|</span>
              <span>WORKSPACE: CASHIER SCAN CONSOLE (LANE 01)</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#166534] font-bold">● ACTIVE REGISTER</span>
              <span className="text-[#3D423D]">|</span>
              <span>100% OFFLINE PERSISTENT</span>
            </div>
          </div>

          {/* Screenshot Display */}
          <div className="overflow-hidden rounded-lg border border-[#3D423D] bg-[#000000]">
            <img
              src={finalScanPage}
              alt="SUELTO POS Authentic Cashier Checkout Terminal Interface"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>

          {/* Under-frame Annotations */}
          <div className="mt-3 pt-2.5 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-[#A6AAA1] border-t border-[#3D423D]">
            <span>AUTHENTIC PRODUCTION INTERFACE · NO SYNTHETIC MOCKUPS</span>
            <span className="text-[#F0E4DD]">SUELTO POS REG-01 · RESILIENT ATOMIC CHECKOUT</span>
          </div>
        </div>

        {/* 4 Contextual Capability Notes Outside the Frame */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-[#3D423D]">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="space-y-2">
                <div className="flex items-center gap-2.5 text-[#A14E38]">
                  <Icon className="text-sm" />
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-xs text-[#A6AAA1] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ProductShowcase;

