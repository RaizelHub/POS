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
      <div className={`border p-5 rounded-xl space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}>
          <FaLaptopCode className="text-slate-400" /> Workstation Registry
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
            <span className={`font-mono font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              AES-256 VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Branch Announcements */}
      <div className="space-y-3">
        <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <FaBullhorn /> Branch Announcements
        </h4>
        
        <div className="space-y-2.5">
          {announcements.map((ann, idx) => (
            <div 
              key={idx}
              className={`p-4 border rounded-xl hover:border-slate-700 transition-colors space-y-2 text-left ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`font-bold text-xs leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{ann.title}</span>
                <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-mono font-semibold border uppercase tracking-wider shrink-0 ${
                  ann.tag === 'IMPORTANT' 
                    ? (isDark ? 'bg-rose-950/30 text-rose-300 border-rose-900/40' : 'bg-rose-50 text-rose-700 border-rose-200')
                    : (isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200')
                }`}>
                  {ann.tag}
                </span>
              </div>
              <p className={`text-[11px] leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{ann.desc}</p>
              <span className={`text-[9px] font-mono font-medium uppercase block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{ann.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Promotion Codes */}
      <div className="space-y-3">
        <h4 className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <FaTag /> Active Promotion Codes
        </h4>
        
        <div className="grid grid-cols-1 gap-2.5">
          {promotions.map((promo, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-3.5 border rounded-xl transition-colors ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1 text-left pr-3">
                <span className={`inline-block border text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}>
                  {promo.code}
                </span>
                <p className={`text-[10.5px] mt-1 leading-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{promo.desc}</p>
              </div>
              
              <div className={`px-2 py-0.5 rounded-md border text-[9px] font-mono font-semibold tracking-wider shrink-0 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}>
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
