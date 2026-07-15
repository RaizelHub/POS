import React from 'react';
import { 
  FaInfoCircle, FaCheckCircle, FaLaptop, FaBarcode, FaPrint, 
  FaDatabase, FaNetworkWired, FaServer, FaCashRegister, FaClock 
} from 'react-icons/fa';

const statusItems = [
  { label: 'Workstation Terminal', val: 'POS-01 (ACTIVE)', icon: <FaLaptop className="text-slate-400" /> },
  { label: 'Current Active Shift', val: 'Shift A (Open)', icon: <FaClock className="text-slate-400" /> },
  { label: 'Network Connection', val: 'LAN Connection - 2ms Latency', icon: <FaNetworkWired className="text-slate-400" /> },
  { label: 'Cloud API Server', val: 'http://localhost:8001', icon: <FaServer className="text-slate-400" /> },
  { label: 'Database Cluster Sync', val: 'MongoDB Atlas OK', icon: <FaDatabase className="text-slate-400" /> },
  { label: '80mm Thermal Printer', val: 'Ready & Loaded', icon: <FaPrint className="text-slate-400" /> },
  { label: 'USB Barcode Scanner', val: 'Online & Calibrated', icon: <FaBarcode className="text-slate-400" /> },
  { label: 'Cash Drawer RJ11 Trigger', val: 'Solenoid Verified', icon: <FaCashRegister className="text-slate-400" /> }
];

const TerminalStatus = () => {
  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
        <h3 className="text-slate-100 font-bold text-sm tracking-tight flex items-center gap-2">
          <FaInfoCircle className="text-emerald-500" /> Terminal Workstation
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Welcome to the POS terminal. Verify that local peripheral hardware status checks are green before signing into checkout sessions.
        </p>
      </div>

      {/* Checklist Grid */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Hardware Peripherals</h4>
        
        {statusItems.map((item, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-850 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0 text-left">
                <span className="block text-[10px] text-slate-450 uppercase font-bold leading-tight">{item.label}</span>
                <span className="block text-[11px] text-slate-350 font-mono mt-0.5 truncate">{item.val}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-emerald-950/45 px-2.5 py-1 rounded-full border border-emerald-900/60 text-[9px] font-bold text-emerald-400 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block animate-pulse" />
              <span>OK</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TerminalStatus;
