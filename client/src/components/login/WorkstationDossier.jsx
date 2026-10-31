import React from 'react';
import retailTerminal from '../../images/retail_terminal.jpg';
import novaLogo from '../../images/nova_logo.png';

const WorkstationDossier = () => {
  return (
    <div className="bg-[#FFFFFF] border border-[#DDDCD4] rounded p-6 sm:p-7 space-y-6">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#B55E42]">
            02 / TERMINAL CONTEXT
          </span>
          <span className="h-px flex-1 bg-[#DDDCD4]" />
        </div>
        <h3 className="mt-2 font-serif sm:font-sans text-xl font-bold tracking-tight text-[#252924]">
          Workstation POS-01
        </h3>
        <p className="text-xs text-[#6C716A] mt-1">
          Ground Floor Main Store Terminal · Standby Mode
        </p>
      </div>

      {/* Clean Retail Photography Frame */}
      <div className="w-full rounded-xl border border-[#DDDCD4] bg-[#FAFAF8] p-3 flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-full max-h-[170px] aspect-[16/9] rounded-lg overflow-hidden border border-[#DDDCD4]">
          <img
            src={retailTerminal}
            alt="SUELTO POS Boutique Retail Terminal"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2 pt-1 w-full justify-between font-mono text-[10px]">
          <span className="text-[#6C716A]">HARDWARE NODE: POS-01</span>
          <span className="text-[#166534] font-semibold">● ACTIVE STANDBY</span>
        </div>
      </div>

      {/* Structured Operational Metadata Table */}
      <div className="border border-[#DDDCD4] rounded divide-y divide-[#DDDCD4] font-mono text-xs">
        <div className="flex items-center justify-between p-3 bg-[#F5F3ED]">
          <span className="text-[#6C716A] text-[11px] uppercase tracking-wider">Register Node</span>
          <span className="font-semibold text-[#252924]">POS-01 (Lane 01)</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#FFFFFF]">
          <span className="text-[#6C716A] text-[11px] uppercase tracking-wider">Store Branch</span>
          <span className="font-semibold text-[#252924]">Main Retail Branch</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#FFFFFF]">
          <span className="text-[#6C716A] text-[11px] uppercase tracking-wider">Shift Session</span>
          <span className="font-semibold text-[#166534]">Ready to Open</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#FFFFFF]">
          <span className="text-[#6C716A] text-[11px] uppercase tracking-wider">Peripherals</span>
          <span className="font-semibold text-[#252924]">Printer · Drawer · Scanner</span>
        </div>
      </div>

      {/* Editorial Guidance */}
      <div className="p-4 bg-[#F5F3ED] border border-[#DDDCD4] rounded text-xs text-[#6C716A] space-y-1.5">
        <span className="font-bold text-[#252924] block uppercase tracking-wider text-[10px] font-mono">
          Session Procedure
        </span>
        <p className="leading-relaxed">
          Select your verified staff profile from the directory on the left. Enter your six-digit PIN to open the register session.
        </p>
      </div>

      {/* Physical Keyboard Shortcuts */}
      <div className="pt-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6C716A] block mb-2">
          Keyboard Navigation
        </span>
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="p-2 border border-[#DDDCD4] rounded bg-[#FFFFFF] flex items-center justify-between">
            <span className="text-[#6C716A]">Enter PIN</span>
            <kbd className="px-1.5 py-0.5 bg-[#F5F3ED] border border-[#DDDCD4] text-[#252924] text-[10px] rounded">
              0-9
            </kbd>
          </div>
          <div className="p-2 border border-[#DDDCD4] rounded bg-[#FFFFFF] flex items-center justify-between">
            <span className="text-[#6C716A]">Confirm</span>
            <kbd className="px-1.5 py-0.5 bg-[#F5F3ED] border border-[#DDDCD4] text-[#252924] text-[10px] rounded">
              Enter
            </kbd>
          </div>
          <div className="p-2 border border-[#DDDCD4] rounded bg-[#FFFFFF] flex items-center justify-between">
            <span className="text-[#6C716A]">Delete</span>
            <kbd className="px-1.5 py-0.5 bg-[#F5F3ED] border border-[#DDDCD4] text-[#252924] text-[10px] rounded">
              Backspace
            </kbd>
          </div>
          <div className="p-2 border border-[#DDDCD4] rounded bg-[#FFFFFF] flex items-center justify-between">
            <span className="text-[#6C716A]">Deselect</span>
            <kbd className="px-1.5 py-0.5 bg-[#F5F3ED] border border-[#DDDCD4] text-[#252924] text-[10px] rounded">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkstationDossier;
