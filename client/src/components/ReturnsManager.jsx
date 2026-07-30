import { useEffect, useMemo, useState } from 'react';
import { FaExchangeAlt, FaTimesCircle } from 'react-icons/fa';
import api from '../utils/api';

const ReturnsManager = () => {
  const [transactions, setTransactions] = useState([]);
  const [returns, setReturns] = useState([]);
  const [openShifts, setOpenShifts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('return');
  const [quantities, setQuantities] = useState({});
  const [reason, setReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('Original Tender');
  const [shiftId, setShiftId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [transactionResponse, returnResponse, shiftResponse] = await Promise.all([
      api.get('/api/transactions/ledger'),
      api.get('/api/returns'),
      api.get('/api/shifts'),
    ]);
    setTransactions(transactionResponse.data);
    setReturns(returnResponse.data);
    setOpenShifts(shiftResponse.data.filter((shift) => shift.status === 'Open'));
  };

  useEffect(() => {
    load().catch(() => setError('Unable to load returns.'));
  }, []);

  const eligible = useMemo(
    () => transactions.filter((transaction) => !['refunded', 'voided'].includes(transaction.status)),
    [transactions]
  );

  const open = (transaction, nextMode) => {
    setSelected(transaction);
    setMode(nextMode);
    setReason('');
    setError('');
    setNotice('');
    setShiftId('');
    setQuantities(Object.fromEntries(transaction.products.map((item) => [item.productId, 0])));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (mode === 'void') {
        await api.post(`/api/transactions/${selected._id}/void`, { reason, refundMethod, shiftId });
      } else {
        const items = selected.products
          .map((item) => ({ productId: item.productId, quantity: Number(quantities[item.productId] || 0) }))
          .filter((item) => item.quantity > 0);
        if (!items.length) return setError('Choose at least one item to return.');
        await api.post(`/api/transactions/${selected._id}/returns`, { items, reason, refundMethod, shiftId });
      }
      setSelected(null);
      setNotice(mode === 'void' ? 'Transaction voided and stock restored.' : 'Return completed and stock restored.');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to complete this operation.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Post-sale controls</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Returns and voids</h1>
        <p className="mt-1 text-sm text-slate-500">Restore inventory and preserve an approval record.</p>
      </div>
      {notice && <div className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</div>}

      <div className="grid gap-6 xl:grid-cols-[0.6fr_0.4fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="font-bold text-slate-950">Eligible transactions</h2></div>
          <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto">
            {eligible.map((transaction) => (
              <article key={transaction._id} className="p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{transaction.transactionId}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(transaction.transactionDate).toLocaleString('en-PH')} · {transaction.products.length} items</p>
                    <p className="mt-2 text-sm font-bold text-emerald-700">₱{((transaction.totalAmountCents || Math.round((transaction.originalAmount - transaction.discountAmount) * 100)) / 100).toFixed(2)}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <button onClick={() => open(transaction, 'return')} className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><FaExchangeAlt /> Return</button>
                    <button onClick={() => open(transaction, 'void')} className="flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"><FaTimesCircle /> Void</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="font-bold text-slate-950">Recent returns</h2></div>
          <div className="max-h-[620px] divide-y divide-slate-100 overflow-y-auto">
            {returns.map((item) => (
              <div key={item._id} className="p-4 text-xs">
                <div className="flex justify-between gap-3"><strong className="text-slate-900">{item.returnNumber}</strong><strong className="text-rose-700">-₱{(item.totalRefundCents / 100).toFixed(2)}</strong></div>
                <p className="mt-2 text-slate-500">{item.reason}</p>
                <p className="mt-1 text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString('en-PH')}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between gap-4">
              <div><h2 className="text-lg font-bold text-slate-950">{mode === 'void' ? 'Void transaction' : 'Return items'}</h2><p className="mt-1 text-xs text-slate-500">{selected.transactionId}</p></div>
              <button type="button" onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>

            {mode === 'return' && (
              <div className="mt-5 space-y-3">
                {selected.products.map((item) => {
                  const available = item.quantity - (item.returnedQuantity || 0);
                  return (
                    <label key={item.productId} className="grid grid-cols-[1fr_80px] items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs">
                      <span><strong className="block text-slate-900">{item.name}</strong><span className="text-slate-500">{available} returnable</span></span>
                      <input type="number" min="0" max={available} step="1" value={quantities[item.productId] || 0} onChange={(event) => setQuantities({ ...quantities, [item.productId]: event.target.value })} className="rounded-lg border border-slate-300 px-2 py-2 text-center" />
                    </label>
                  );
                })}
              </div>
            )}

            <label className="mt-5 block text-xs font-bold text-slate-700">Refund method<select value={refundMethod} onChange={(event) => setRefundMethod(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option>Original Tender</option><option>Cash</option><option>Card</option><option>GCash/PayMaya</option><option>Store Credit</option></select></label>
            {(refundMethod === 'Cash' || refundMethod === 'Original Tender') && (
              <label className="mt-4 block text-xs font-bold text-slate-700">Refund register
                <select value={shiftId} onChange={(event) => setShiftId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                  <option value="">Select an open shift when cash is affected</option>
                  {openShifts.map((shift) => <option key={shift._id} value={shift._id}>{shift.cashierName} · {shift.registerId || 'register'}</option>)}
                </select>
              </label>
            )}
            <label className="mt-4 block text-xs font-bold text-slate-700">Reason<textarea required value={reason} onChange={(event) => setReason(event.target.value)} rows="3" className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm" /></label>
            {error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
            <button className={`mt-5 w-full rounded-lg px-4 py-3 text-sm font-bold text-white ${mode === 'void' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-slate-950 hover:bg-emerald-700'}`}>{mode === 'void' ? 'Approve void' : 'Complete return'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReturnsManager;
