import { useState } from 'react';
import { FaBarcode, FaChartLine, FaBoxes, FaReceipt, FaCheck } from 'react-icons/fa';

import adminDashboard from '../../images/admin_dashboard.png';
import finalScanPage from '../../images/final_scan_page.png';
import receiptBuilder from '../../images/receipt_builder.png';
import autoRestock from '../../images/auto_restock.png';

const tourScreens = [
  {
    id: 'checkout',
    tabLabel: '01 / Cashier Terminal',
    icon: FaBarcode,
    title: 'Cashier Scanner Console',
    category: 'Counter Execution',
    description:
      'The frontline cashier workstation. Enables rapid barcode scanning, item catalog search, customer loyalty assignment, credit ledger lookups, and split tender settlements.',
    image: finalScanPage,
    alt: 'SUELTO POS Cashier Scanner Console Interface',
    path: '/scan',
    highlights: [
      'Real-time barcode buffering with fast search fallback',
      'Customer accounts with store credit balance history',
      'Cash drawer float adjustments (Cash-In / Cash-Out)',
      'Instant shift closing with drawer float variance review',
    ],
  },
  {
    id: 'dashboard',
    tabLabel: '02 / Central Intelligence',
    icon: FaChartLine,
    title: 'Admin Management Dashboard',
    category: 'Store Oversight',
    description:
      'The executive cockpit for store owners and managers. Aggregates live gross revenue, active cashier shift statuses, low-stock warnings, and historical sales trends in real time.',
    image: adminDashboard,
    alt: 'SUELTO POS Admin Management Dashboard Interface',
    path: '/dashboard',
    highlights: [
      'Live daily revenue net of voids and partial refunds',
      'Active cashier lane status and shift float balances',
      'Top-performing product categories and item volumes',
      'Direct navigation to audit logs, coupons, and suppliers',
    ],
  },
  {
    id: 'inventory',
    tabLabel: '03 / Restock Control',
    icon: FaBoxes,
    title: 'Purchase Order Restock Manager',
    category: 'Stock Replenishment',
    description:
      'Proactive inventory management. Automatically detects stock levels reaching predefined reorder points and generates formatted purchase order spreadsheets with a single click.',
    image: autoRestock,
    alt: 'SUELTO POS Purchase Order Restock Manager Interface',
    path: '/inventory',
    highlights: [
      'Automated low-stock threshold monitoring',
      'Single-click XLSX export for vendor supply orders',
      'Historical supplier directory with contact details',
      'Direct barcode generation and shelf label printing',
    ],
  },
  {
    id: 'receipt',
    tabLabel: '04 / Thermal Customizer',
    icon: FaReceipt,
    title: 'Dynamic Receipt Builder',
    category: 'Customer Documentation',
    description:
      'Customizable thermal receipt layout engine. Edit store branding, address details, tax registration numbers, return policies, and footer messages with a side-by-side print preview.',
    image: receiptBuilder,
    alt: 'SUELTO POS Dynamic Receipt Builder Interface',
    path: '/receipt-settings',
    highlights: [
      'Custom header, tax identification, and footer slogans',
      'Adjustable 58mm and 80mm thermal roll print dimensions',
      'Live side-by-side thermal slip preview simulation',
      'Instant browser-native print trigger with PDF fallback',
    ],
  },
];

const ProductTour = () => {
  const [activeTab, setActiveTab] = useState('checkout');

  const activeScreen = tourScreens.find((s) => s.id === activeTab) || tourScreens[0];

  return (
    <section id="product-tour" className="bg-[#F2F0E9] py-16 sm:py-24 lg:py-28 border-b border-[#D0D0C7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b border-[#D0D0C7]">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#A14E38] bg-[#F0E4DD] px-2.5 py-0.5 rounded border border-[#D0D0C7]">
                04 / INTERFACE DOSSIER
              </span>
              <span className="h-px w-10 bg-[#D0D0C7]" />
              <span className="font-mono text-[10px] text-[#656960] uppercase">
                PRODUCTION WORKSPACES
              </span>
            </div>
            <h2 className="font-serif sm:font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#242824] leading-[1.1]">
              A closer look at the system.
            </h2>
            <p className="text-sm sm:text-base text-[#656960] leading-relaxed">
              Every screen in SUELTO POS has been engineered for clarity, tactile keyboard speed, and operational consistency. Inspect the actual working modules below.
            </p>
          </div>

          <div className="font-mono text-xs text-[#656960]">
            4 PRODUCTION WORKSPACES
          </div>
        </div>

        {/* Tab Selection Rail (Solid Buttons, Zero Gradients) */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Product tour screens">
          {tourScreens.map((screen) => {
            const Icon = screen.icon;
            const isSelected = activeTab === screen.id;
            return (
              <button
                key={screen.id}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${screen.id}`}
                id={`tab-${screen.id}`}
                onClick={() => setActiveTab(screen.id)}
                className={`flex shrink-0 items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-colors rounded border ${
                  isSelected
                    ? 'bg-[#242824] text-[#FFFFFF] border-[#242824]'
                    : 'bg-[#FFFFFF] text-[#656960] hover:text-[#242824] border-[#D0D0C7] hover:bg-[#F2F0E9]'
                }`}
              >
                <Icon className={`text-xs ${isSelected ? 'text-[#F0E4DD]' : 'text-[#A14E38]'}`} />
                <span className="font-mono">{screen.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Active Workspace Showcase Grid */}
        <div
          id={`panel-${activeScreen.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeScreen.id}`}
          className="mt-6 grid grid-cols-1 lg:grid-cols-12 border border-[#D0D0C7] bg-[#FFFFFF] rounded overflow-hidden"
        >
          {/* Left: Detailed Module Brief (Span 5 on Desktop) */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#D0D0C7] space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A14E38] bg-[#F0E4DD] px-2 py-0.5 rounded border border-[#D0D0C7]">
                  {activeScreen.category}
                </span>
                <span className="font-mono text-[10px] text-[#656960]">
                  ROUTE: {activeScreen.path}
                </span>
              </div>

              <h3 className="font-serif sm:font-sans text-2xl sm:text-3xl font-bold text-[#242824] tracking-tight">
                {activeScreen.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#656960] leading-relaxed">
                {activeScreen.description}
              </p>

              <div className="pt-4 border-t border-[#D0D0C7] space-y-2.5">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#242824] block">
                  Key Operational Features
                </span>
                <ul className="space-y-2 text-xs text-[#656960]">
                  {activeScreen.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#166534] mt-0.5 shrink-0"><FaCheck className="text-[9px]" /></span>
                      <span className="leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D0D0C7] flex items-center justify-between text-xs font-mono text-[#656960]">
              <span>NODE STATUS: COMPILED & LIVE</span>
              <span className="text-[#166534] font-semibold">● VERIFIED</span>
            </div>
          </div>

          {/* Right: Authentic Production Screenshot (Span 7 on Desktop) */}
          <div className="lg:col-span-7 bg-[#F2F0E9] p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center">
            <div className="w-full border border-[#D0D0C7] bg-[#FFFFFF] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#D0D0C7] bg-[#FFFFFF] font-mono text-[10px] text-[#656960]">
                <span>SUELTO TERMINAL · {activeScreen.title.toUpperCase()}</span>
                <span className="text-[#242824] font-bold">100% REAL SCREENSHOT</span>
              </div>
              <div className="bg-[#000000] p-1 flex justify-center">
                <img
                  src={activeScreen.image}
                  alt={activeScreen.alt}
                  className="w-full h-auto max-h-[500px] object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductTour;

