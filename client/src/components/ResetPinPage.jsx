import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import config from '../config';
import novaLogo from '../images/nova_logo.png';

const ResetPinPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(newPin)) {
      setError('Enter a six-digit PIN.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('The PIN entries do not match.');
      return;
    }
    if (/^(\d)\1{5}$/.test(newPin) || ['123456', '654321'].includes(newPin)) {
      setError('Choose a less predictable PIN.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/reset-pin/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPin }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to reset the PIN.');
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7f3] px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <img src={novaLogo} alt="" className="h-8 w-8 object-contain" />
          </span>
          <span>
            <strong className="block text-sm tracking-tight text-slate-950">SUELTO</strong>
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Secure recovery</span>
          </span>
        </Link>

        <section className="rounded-[24px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
          {success ? (
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">
                <FaCheckCircle />
              </span>
              <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950">PIN updated</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">Your one-time link has been used and your new PIN is ready.</p>
              <button
                type="button"
                onClick={() => navigate('/login-selection?pinReset=true')}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Return to sign in <FaArrowRight className="text-[10px]" />
              </button>
            </div>
          ) : (
            <>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><FaLock /></span>
              <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-950">Choose a new PIN</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Use six digits that are difficult for someone else to guess.</p>

              <form onSubmit={submit} className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-700">New PIN</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={6}
                    value={newPin}
                    onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg tracking-[0.35em] outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-700">Confirm PIN</span>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-lg tracking-[0.35em] outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                {error && (
                  <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                    <FaExclamationTriangle className="mt-0.5 shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Updating PIN…' : 'Update PIN'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default ResetPinPage;
