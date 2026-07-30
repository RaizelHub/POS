import { Link } from 'react-router-dom';
import novaLogo from '../../images/nova_logo.png';

const Footer = () => (
  <footer className="bg-slate-950 px-5 py-12 text-slate-400 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_0.6fr_0.6fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white">
              <img src={novaLogo} alt="" className="h-8 w-8 object-contain" />
            </span>
            <span>
              <strong className="block text-sm tracking-tight text-white">SUELTO</strong>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">Retail OS</span>
            </span>
          </div>
          <p className="mt-5 text-xs font-medium leading-6">A focused point-of-sale and store operations workspace for independent retailers.</p>
        </div>
        <div>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-xs font-semibold">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#product-tour" className="hover:text-white">Product tour</a>
            <a href="#workflow" className="hover:text-white">How it works</a>
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">Access</h3>
          <div className="mt-4 flex flex-col gap-3 text-xs font-semibold">
            <Link to="/login-selection" className="hover:text-white">Open register</Link>
            <Link to="/admin-login" className="hover:text-white">Admin login</Link>
            <Link to="/admin-login" className="hover:text-white">Manager sign in</Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-7 text-[10px] font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 SUELTO Retail Systems.</p>
        <p>Checkout, inventory, shifts, and reporting—together.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
