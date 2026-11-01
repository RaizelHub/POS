import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const CtaSection = () => {
  return (
    <section className="bg-[#242824] text-[#FFFFFF] py-20 sm:py-28 lg:py-32 border-b border-[#D0D0C7]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F0E4DD] bg-[#A14E38] px-2.5 py-0.5 rounded">
              08 / GET STARTED
            </span>
            <span className="h-px w-10 bg-[#3D423D]" />
            <span className="font-mono text-[10px] text-[#A6AAA1] uppercase tracking-wider">
              OPERATIONAL ACCESS
            </span>
          </div>

          <h2 className="font-serif sm:font-sans text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FFFFFF] leading-[1.05]">
            Ready for the <br />
            <span className="text-[#F0E4DD]">next sale?</span>
          </h2>

          <p className="text-base sm:text-lg text-[#A6AAA1] max-w-xl leading-relaxed">
            Open your register and get back to business. Launch an authorized cashier workstation or access store intelligence in seconds.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-md">
            <Link
              to="/login-selection"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-xs font-bold uppercase tracking-wider text-[#242824] bg-[#FFFFFF] hover:bg-[#F2F0E9] transition-colors rounded text-center"
            >
              <span>Open register</span>
              <FaArrowRight className="text-[10px]" />
            </Link>

            <Link
              to="/admin-login"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 text-xs font-semibold text-[#FFFFFF] hover:text-[#F0E4DD] transition-colors border border-[#3D423D] bg-transparent hover:bg-[#2C312C] rounded text-center"
            >
              <FaShieldAlt className="text-xs text-[#A14E38]" />
              <span>Manager sign in</span>
            </Link>
          </div>

          <div className="pt-6 font-mono text-[11px] text-[#A6AAA1] flex flex-wrap items-center gap-4">
            <span>REGISTER STATUS: ONLINE</span>
            <span className="text-[#3D423D]">·</span>
            <span>HARDWARE COMPATIBLE: ESC/POS · USB · BLUETOOTH</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CtaSection;
