import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheck } from 'react-icons/fa';

const CtaSection = () => (
  <section className="bg-white px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-emerald-700 px-6 py-14 text-white shadow-2xl shadow-emerald-900/20 sm:px-12 sm:py-16 lg:px-16">
      <div className="pointer-events-none absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border-[70px] border-white/5" />
      <div className="pointer-events-none absolute -bottom-52 right-40 h-[360px] w-[360px] rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative grid items-end gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-3xl">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-200">Ready for the next sale?</span>
          <h2 className="mt-4 text-4xl font-extrabold leading-[1.04] tracking-[-0.045em] sm:text-5xl">A clearer day at the counter starts here.</h2>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {['Quick cashier access', 'One connected workspace', 'Built-in store controls'].map((item) => (
              <span key={item} className="flex items-center gap-2 text-xs font-semibold text-emerald-50">
                <FaCheck className="text-[9px] text-emerald-300" /> {item}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link to="/login-selection" className="group flex min-w-[190px] items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-extrabold text-emerald-800 shadow-lg transition-transform hover:-translate-y-0.5">
            Open register <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/admin-login" className="min-w-[190px] rounded-2xl border border-white/25 bg-white/10 px-6 py-4 text-center text-sm font-extrabold text-white transition-colors hover:bg-white/15">
            Manager sign in
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default CtaSection;
