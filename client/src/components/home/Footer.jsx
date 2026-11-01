import React from 'react';
import { Link } from 'react-router-dom';
import novaLogo from '../../images/nova_logo.png';

const Footer = () => {
  return (
    <footer className="bg-[#FFFFFF] text-[#242824] py-12 sm:py-16 border-t border-[#D0D0C7] select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#D0D0C7]">
          
          {/* Col 1: Identity & Dossier Summary (Span 6) */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-[#D0D0C7] bg-[#F2F0E9]">
                <img src={novaLogo} alt="SUELTO Logo" className="h-5 w-5 object-contain" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-sm font-extrabold tracking-[0.16em] uppercase text-[#242824]">
                  SUELTO
                </span>
                <span className="text-[#D0D0C7]">/</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#656960]">
                  RETAIL OPERATIONS JOURNAL
                </span>
              </div>
            </div>

            <p className="text-xs text-[#656960] max-w-md leading-relaxed">
              A disciplined, offline-first point of sale and inventory management application designed for independent retail counters, cashiers, and store managers.
            </p>

            <div className="font-mono text-[10px] text-[#656960] pt-1">
              BUILD: RETAIL OS V1.0 · MERN ARCHITECTURE · SOLID FLAT PALETTE
            </div>
          </div>

          {/* Col 2: System Navigation (Span 3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A14E38]">
              System Index
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#656960]">
              <li>
                <a href="#product-showcase" className="hover:text-[#242824] transition-colors">
                  01 / The Register
                </a>
              </li>
              <li>
                <a href="#operations" className="hover:text-[#242824] transition-colors">
                  02 / Three Core Operations
                </a>
              </li>
              <li>
                <a href="#product-tour" className="hover:text-[#242824] transition-colors">
                  03 / Interface Dossier
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#242824] transition-colors">
                  04 / Standard Lifecycle
                </a>
              </li>
              <li>
                <a href="#store-types" className="hover:text-[#242824] transition-colors">
                  05 / Target Environments
                </a>
              </li>
              <li>
                <a href="#offline" className="hover:text-[#242824] transition-colors">
                  06 / Offline Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Terminal Access (Span 3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A14E38]">
              Terminal Access
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#656960]">
              <li>
                <Link to="/login-selection" className="hover:text-[#242824] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
                  <span>Open Register Desk</span>
                </Link>
              </li>
              <li>
                <Link to="/admin-login" className="hover:text-[#242824] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A14E38]" />
                  <span>Admin Management Console</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Colophon */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-mono text-[#656960]">
          <span>© 2026 SUELTO RETAIL SYSTEMS · ALL RIGHTS RESERVED</span>
          <span>DISCIPLINED POINT OF SALE · ZERO GRADIENTS</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
