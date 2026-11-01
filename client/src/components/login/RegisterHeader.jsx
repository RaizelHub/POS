import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';
import novaLogo from '../../images/nova_logo.png';
import { useConnectivity, CONNECTION_STATUS } from '../../utils/connectivity';

const RegisterHeader = ({ onHelpClick, isServiceConnected = true }) => {
  const [time, setTime] = useState(new Date());
  const { isOnline, status } = useConnectivity();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const serviceOperational = isOnline && isServiceConnected;

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#DDDCD4] flex items-center justify-between px-4 sm:px-6 w-full shrink-0 select-none">
      {/* Brand & Workstation Identifier */}
      <div className="flex items-center gap-3.5 min-w-0">
        <Link
          to="/"
          className="w-8 h-8 rounded border border-[#DDDCD4] bg-[#FFFFFF] hover:bg-[#F5F3ED] text-[#6C716A] hover:text-[#252924] flex items-center justify-center transition-colors shrink-0"
          title="Return to Catalog / Overview"
          aria-label="Return to Catalog"
        >
          <FaArrowLeft className="text-xs" />
        </Link>

        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={novaLogo}
            alt="SUELTO Logo"
            className="h-6 w-auto object-contain rounded shrink-0"
          />
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-sans font-bold text-xs tracking-[0.16em] uppercase text-[#252924]">
              SUELTO
            </span>
            <span className="text-[#DDDCD4] hidden sm:inline">|</span>
            <span className="font-mono text-xs text-[#6C716A] uppercase tracking-wider hidden sm:inline">
              THE REGISTER DESK
            </span>
            <span className="font-mono text-[10px] text-[#6C716A] hidden md:inline bg-[#F5F3ED] px-2 py-0.5 rounded border border-[#DDDCD4]">
              POS-01 · MAIN
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions: Real Service Indicator, Clock, Guide, Admin Portal */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real Operational Status (Solid indicator, zero gradients) */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#DDDCD4] bg-[#F5F3ED] text-[11px] font-mono"
          title={serviceOperational ? 'Backend service connected' : 'Service unreachable'}
        >
          <span
            className={`w-2 h-2 rounded-full ${serviceOperational ? 'bg-[#166534]' : 'bg-[#B91C1C]'
              }`}
          />
          <span className="hidden sm:inline font-medium text-[#252924]">
            {serviceOperational ? 'SERVICE READY' : 'OFFLINE'}
          </span>
        </div>

        {/* Live Monospaced Clock */}
        <div className="hidden lg:flex items-center px-2.5 py-1 rounded border border-[#DDDCD4] bg-[#FFFFFF] font-mono text-xs font-semibold text-[#252924]">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>

        {/* Terminal Guide Trigger */}
        {onHelpClick && (
          <button
            type="button"
            onClick={onHelpClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#DDDCD4] bg-[#FFFFFF] hover:bg-[#F5F3ED] text-xs font-semibold text-[#6C716A] hover:text-[#252924] transition-colors"
          >
            <FaQuestionCircle className="text-xs text-[#6C716A]" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        )}

        {/* Manager / Admin Link */}
        <Link
          to="/admin-login"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#252924] hover:bg-[#B55E42] text-[#FFFFFF] text-xs font-semibold tracking-wide transition-colors"
        >
          <FaShieldAlt className="text-xs text-[#FFFFFF]" />
          <span>Manager</span>
        </Link>
      </div>
    </header>
  );
};

export default RegisterHeader;

