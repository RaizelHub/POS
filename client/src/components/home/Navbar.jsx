import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBars, FaShieldAlt, FaTimes } from 'react-icons/fa';
import novaLogo from '../../images/nova_logo.png';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Product tour', href: '#product-tour' },
  { label: 'How it works', href: '#workflow' },
  { label: 'Store types', href: '#industries' }
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => window.innerWidth >= 768 && setIsOpen(false);
    window.addEventListener('resize', closeOnResize);
    return () => window.removeEventListener('resize', closeOnResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Suelto home">
          <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <img src={novaLogo} alt="" className="h-8 w-8 object-contain" />
          </span>
          <span>
            <span className="block text-[15px] font-extrabold leading-none tracking-[-0.02em] text-slate-950">SUELTO</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">Retail OS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-950 hover:shadow-sm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/admin-login"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
          >
            <FaShieldAlt className="text-[11px]" />
            Admin
          </Link>
          <Link
            to="/login-selection"
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
          >
            Open register
            <FaArrowRight className="text-[9px]" />
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-5 pb-5 pt-3 shadow-xl md:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="border-b border-slate-100 py-3.5 text-sm font-semibold text-slate-700"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link to="/admin-login" className="rounded-xl border border-slate-200 px-4 py-3 text-center text-xs font-bold text-slate-700">
              Admin
            </Link>
            <Link to="/login-selection" className="rounded-xl bg-slate-950 px-4 py-3 text-center text-xs font-bold text-white">
              Open register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
