import { useEffect, useState } from 'react';
import { FaBalanceScale, FaPrint } from 'react-icons/fa';
import api from '../utils/api';

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const ReconciliationReports = () => {
  const [shifts, setShifts] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/shifts').then((response) => setShifts(response.data)).catch(() => setError('Unable to load shifts.'));
  }, []);

  const openReport = async (shiftId) => {
    try {
      setError('');
      const response = await api.get(`/api/reports/shifts/${shiftId}/reconciliation`);
      setReport(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to build reconciliation report.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Till accountability</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">X / Z reconciliation</h1>
          <p className="mt-1 text-sm text-slate-500">Preview an open-shift X report or inspect a closed-shift Z report.</p>
        </div>
        {report && <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700"><FaPrint /> Print report</button>}
      </div>
      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
        <section className="max-h-[650px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5"><h2 className="font-bold text-slate-950">Shifts</h2></div>
          <div className="divide-y divide-slate-100">
            {shifts.map((shift) => <button key={shift._id} onClick={() => openReport(shift._id)} className="w-full p-4 text-left hover:bg-slate-50"><div className="flex justify-between gap-3"><strong className="text-sm text-slate-900">{shift.cashierName}</strong><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${shift.status === 'Open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{shift.status}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(shift.startTime).toLocaleString('en-PH')} · {shift.registerId}</p></button>)}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!report ? <div className="grid min-h-[360px] place-items-center text-center"><div><FaBalanceScale className="mx-auto text-4xl text-slate-200" /><p className="mt-3 text-sm font-semibold text-slate-600">Choose a shift to build its report</p></div></div> : (
            <div className="space-y-6">
              <div className="flex items-start justify-between"><div><span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-bold text-white">{report.reportType} REPORT</span><h2 className="mt-3 text-xl font-bold text-slate-950">{report.shift.cashierName}</h2><p className="mt-1 text-xs text-slate-500">{report.shift.registerId}</p></div><time className="text-xs text-slate-400">{new Date(report.generatedAt).toLocaleString('en-PH')}</time></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[
                ['Gross', report.totals.grossCents / 100],
                ['Refunds', report.totals.refundsCents / 100],
                ['Net', report.totals.netCents / 100],
                ['Expected cash', report.totals.expectedCash],
                ['Ending cash', report.totals.endingCash],
                ['Variance', report.totals.discrepancy],
              ].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-sm font-bold text-slate-900">{value === undefined || value === null ? '—' : currency.format(value)}</p></div>)}</div>
              <div><h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Tender summary</h3><div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">{report.tenders.map((tender) => <div key={tender._id} className="flex justify-between p-3 text-sm"><span className="text-slate-600">{tender._id} · {tender.transactionCount}</span><strong>{currency.format(((tender.grossCents || 0) - (tender.refundsCents || 0)) / 100)}</strong></div>)}</div></div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReconciliationReports;
