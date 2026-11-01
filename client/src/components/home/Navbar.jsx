import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBars, FaShieldAlt, FaTimes } from 'react-icons/fa';
import novaLogo from '../../images/nova_logo.png';

const navLinks = [
  { label: 'Register', href: '#product-showcase' },
  { label: 'Operations', href: '#operations' },
  { label: 'Product Tour', href: '#product-tour' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Store Types', href: '#store-types' },
  { label: 'Offline Mode', href: '#offline' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#D0D0C7] bg-[#F2F0E9] select-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Journal Identity */}
        <Link to="/" className="flex items-center gap-3" aria-label="SUELTO POS Homepage">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#D0D0C7] bg-[#FFFFFF]">
            <img src={novaLogo} alt="SUELTO Logo" className="h-6 w-6 object-contain" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-sm font-extrabold tracking-[0.16em] uppercase text-[#242824]">
              SUELTO
            </span>
            <span className="text-[#D0D0C7] hidden sm:inline">/</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#656960] hidden sm:inline">
              RETAIL OPERATIONS
            </span>
          </div>
        </Link>

        {/* Center: Contextual Editorial Links */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-[#656960] transition-colors hover:text-[#242824]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Operational Gateways */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/admin-login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#656960] hover:text-[#242824] transition-colors border border-[#D0D0C7] bg-[#FFFFFF] rounded"
          >
            <FaShieldAlt className="text-[10px] text-[#A14E38]" />
            <span>Admin Portal</span>
          </Link>
          <Link
            to="/login-selection"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#FFFFFF] bg-[#242824] hover:bg-[#3A3E39] transition-colors rounded"
          >
            <span>Open Register</span>
            <FaArrowRight className="text-[9px]" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded border border-[#D0D0C7] bg-[#FFFFFF] text-[#242824] lg:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <FaTimes className="text-sm" /> : <FaBars className="text-sm" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="border-t border-[#D0D0C7] bg-[#FFFFFF] px-6 py-6 lg:hidden">
          <div className="font-mono text-[10px] uppercase font-bold tracking-widest text-[#A14E38] mb-3">
            Navigation Index
          </div>
          <nav className="flex flex-col divide-y divide-[#D0D0C7]" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="py-3 text-sm font-semibold text-[#242824] hover:text-[#A14E38] transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="font-mono text-xs text-[#656960]">→</span>
              </a>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-[#D0D0C7] grid grid-cols-2 gap-3">
            <Link
              to="/admin-login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-[#D0D0C7] bg-[#F2F0E9] text-xs font-bold text-[#242824] rounded text-center"
            >
              <FaShieldAlt className="text-[10px]" />
              <span>Admin</span>
            </Link>
            <Link
              to="/login-selection"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#242824] text-xs font-bold uppercase tracking-wider text-[#FFFFFF] rounded text-center"
            >
              <span>Open Register</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
