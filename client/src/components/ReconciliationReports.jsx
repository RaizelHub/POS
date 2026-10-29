import { useEffect, useState } from 'react';
import { FaBalanceScale, FaPrint, FaSearch } from 'react-icons/fa';
import api from '../utils/api';

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const ReconciliationReports = () => {
  const [shifts, setShifts] = useState([]);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [searchShift, setSearchShift] = useState('');

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

  const filteredShifts = shifts.filter((s) => {
    const matchesFilter = shiftFilter === 'all' || s.status.toLowerCase() === shiftFilter.toLowerCase();
    const matchesSearch = !searchShift.trim() || 
      s.cashierName.toLowerCase().includes(searchShift.toLowerCase()) ||
      (s.registerId && s.registerId.toLowerCase().includes(searchShift.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Till accountability</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">X / Z reconciliation</h1>
          <p className="mt-1 text-sm text-slate-500">Preview an open-shift X report or inspect a closed-shift Z report.</p>
        </div>
        {report && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FaPrint /> Print report
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[0.38fr_0.62fr]">
        <section className="max-h-[650px] overflow-hidden flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-950 text-sm">Shifts Directory</h2>
              <span className="text-[10px] text-slate-400 font-semibold">{filteredShifts.length} listed</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-2.5 top-2.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Filter cashier…"
                  value={searchShift}
                  onChange={(e) => setSearchShift(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white outline-none"
                />
              </div>
              <select
                aria-label="Filter shifts by status"
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 font-semibold outline-none"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredShifts.map((shift) => (
              <button
                key={shift._id}
                onClick={() => openReport(shift._id)}
                className={`w-full p-4 text-left transition-colors ${report?.shift?._id === shift._id ? 'bg-emerald-50/50 border-l-2 border-emerald-600' : 'hover:bg-slate-50'}`}
              >
                <div className="flex justify-between gap-3">
                  <strong className="text-sm text-slate-900">{shift.cashierName}</strong>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      shift.status === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {shift.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(shift.startTime).toLocaleString('en-PH')} · {shift.registerId || 'Register 1'}
                </p>
              </button>
            ))}
            {filteredShifts.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No shifts match the selected filters.
              </div>
            )}
          </div>
        </section>

        <section id="printable-reconciliation" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {!report ? (
            <div className="grid min-h-[360px] place-items-center text-center">
              <div>
                <FaBalanceScale className="mx-auto text-4xl text-slate-200" />
                <p className="mt-3 text-sm font-semibold text-slate-600">Choose a shift to build its report</p>
                <p className="text-xs text-slate-400 mt-1">Select an active or closed shift from the list on the left.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-bold text-white ${report.reportType === 'Z' ? 'bg-slate-950' : 'bg-emerald-700'}`}>
                    {report.reportType} REPORT
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-slate-950">{report.shift.cashierName}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Till: {report.shift.registerId || 'Register 1'}</p>
                </div>
                <div className="text-right">
                  <time className="text-xs text-slate-400 block font-mono">
                    {new Date(report.generatedAt).toLocaleString('en-PH')}
                  </time>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Status: {report.shift.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ['Gross Sales', report.totals.grossCents / 100],
                  ['Refunds', report.totals.refundsCents / 100],
                  ['Net Revenue', report.totals.netCents / 100],
                  ['Expected Cash', report.totals.expectedCash],
                  ['Ending Cash', report.totals.endingCash],
                  ['Variance', report.totals.discrepancy],
                ].map(([label, value]) => {
                  const isVariance = label === 'Variance';
                  const varianceColor = !isVariance || value === undefined || value === null
                    ? 'text-slate-900'
                    : value === 0
                      ? 'text-emerald-700'
                      : value < 0
                        ? 'text-rose-600'
                        : 'text-amber-600';

                  return (
                    <div key={label} className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                      <p className={`mt-2 text-sm font-bold font-mono ${varianceColor}`}>
                        {value === undefined || value === null ? '—' : currency.format(value)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Tender Breakdown</h3>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                  {report.tenders.map((tender) => (
                    <div key={tender._id} className="flex justify-between p-3 text-xs bg-white hover:bg-slate-50">
                      <span className="text-slate-700 font-semibold">{tender._id} · {tender.transactionCount} transactions</span>
                      <strong className="font-mono text-slate-900">
                        {currency.format(((tender.grossCents || 0) - (tender.refundsCents || 0)) / 100)}
                      </strong>
                    </div>
                  ))}
                  {report.tenders.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">No tenders collected in this shift.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ReconciliationReports;
