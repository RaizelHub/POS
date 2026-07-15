import React from 'react';
import { 
  FaBullhorn, FaTag, FaLaptopCode, FaCheckCircle, 
  FaCalendarAlt, FaNetworkWired, FaServer, FaInfoCircle 
} from 'react-icons/fa';

const announcements = [
  {
    title: 'Mid-Month General Inventory Audit',
    desc: 'Verify counts of junk food and drinks category shelves before closing terminal shift reports tonight.',
    tag: 'IMPORTANT',
    date: 'Today'
  },
  {
    title: 'New Digital Settlement Options Enabled',
    desc: 'Maya and GCash QR codes are now active under checkout digital payments. Solenoid triggers verified.',
    tag: 'ANNOUNCEMENT',
    date: 'Yesterday'
  }
];

const promotions = [
  { code: 'SAVE10', desc: '10% Discount on Selected Drinks category items.', active: true },
  { code: 'SUMMER2026', desc: '₱100 off on Junk Food bundles above ₱500.', active: true }
];

const CorporateHub = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Terminal Registration Details */}
      <div className={`border p-5 rounded-2xl space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>
          <FaLaptopCode className={isDark ? 'text-teal-400' : 'text-teal-600'} /> Workstation Registry
        </h3>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[10px]">
          <div>
            <span className={`block font-bold text-[9px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Device Model</span>
            <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Terminal IBM-740</span>
          </div>
          <div>
            <span className={`block font-bold text-[9px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Registration SKU</span>
            <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>SKU-770A-POS</span>
          </div>
          <div>
            <span className={`block font-bold text-[9px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Gateway IP Address</span>
            <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>192.168.10.150</span>
          </div>
          <div>
            <span className={`block font-bold text-[9px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Node Security</span>
            <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-bold flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
              AES-256 ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Branch Announcements */}
      <div className="space-y-3">
        <h4 className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${
          isDark ? 'text-slate-400' : 'text-slate-550'
        }`}>
          <FaBullhorn /> Branch Announcements
        </h4>
        
        <div className="space-y-3">
          {announcements.map((ann, idx) => (
            <div 
              key={idx}
              className={`p-4 border rounded-xl hover:border-slate-400/50 transition-colors space-y-2 text-left ${
                isDark ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`font-bold text-xs leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{ann.title}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border uppercase tracking-wider shrink-0 ${
                  ann.tag === 'IMPORTANT' 
                    ? (isDark ? 'bg-rose-950/40 text-rose-400 border-rose-900/40' : 'bg-rose-50 text-rose-700 border-rose-200')
                    : (isDark ? 'bg-teal-950/40 text-teal-400 border-teal-900/40' : 'bg-teal-50 text-teal-700 border-teal-200')
                }`}>
                  {ann.tag}
                </span>
              </div>
              <p className={`text-[11px] leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ann.desc}</p>
              <span className={`text-[9px] font-semibold uppercase block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ann.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Promotion Codes */}
      <div className="space-y-3">
        <h4 className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${
          isDark ? 'text-slate-400' : 'text-slate-555'
        }`}>
          <FaTag /> Active Promotions Banners
        </h4>
        
        <div className="grid grid-cols-1 gap-3">
          {promotions.map((promo, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-3.5 border rounded-xl transition-colors ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1 text-left pr-3">
                <span className={`inline-block border text-[9px] font-extrabold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                  isDark ? 'bg-teal-950/40 text-teal-400 border-teal-900/40' : 'bg-teal-50 text-teal-700 border-teal-200'
                }`}>
                  {promo.code}
                </span>
                <p className={`text-[10.5px] mt-1 leading-normal ${isDark ? 'text-slate-350' : 'text-slate-600'}`}>{promo.desc}</p>
              </div>
              
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-bold shrink-0 ${
                isDark ? 'bg-emerald-950/45 border-emerald-900/60 text-emerald-400' : 'bg-emerald-50 border-emerald-250 text-emerald-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full block animate-pulse ${isDark ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                <span>ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CorporateHub;
