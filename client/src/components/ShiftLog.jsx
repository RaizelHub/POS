import React, { useEffect, useMemo, useState } from "react";
import { FaClock, FaMoneyBillWave, FaReceipt, FaSyncAlt, FaUser } from "react-icons/fa";
import config from "../config";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export default function ShiftLog() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [expandedShiftId, setExpandedShiftId] = useState(null);
  const [expandedShiftLogs, setExpandedShiftLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchShifts = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${config.apiUrl}/api/shifts`);
      if (!response.ok) throw new Error("Unable to load shift records.");
      setShifts(await response.json());
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const fetchCashLogs = async (shiftId) => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/shifts/${shiftId}/cash-logs`);
      if (response.ok) {
        setExpandedShiftLogs(await response.json());
      }
    } catch (err) {
      console.error("Error loading cash logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRowClick = (shiftId) => {
    if (expandedShiftId === shiftId) {
      setExpandedShiftId(null);
    } else {
      setExpandedShiftId(shiftId);
      fetchCashLogs(shiftId);
    }
  };

  useEffect(() => { fetchShifts(); }, []);
  const filtered = useMemo(() => status === "all" ? shifts : shifts.filter((shift) => shift.status === status), [shifts, status]);
  const openShifts = shifts.filter((shift) => shift.status === "Open").length;
  const transactions = shifts.reduce((total, shift) => total + (shift.transactionsCount || 0), 0);

  return <div className="max-w-[1440px] mx-auto space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Cash management</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Cashier shifts</h1><p className="mt-1 text-sm text-slate-500">Review active terminals, drawer reconciliations, and historic shift activity.</p></div><button onClick={fetchShifts} className="self-start inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-700"><FaSyncAlt size={12} /> Refresh</button></div>
    <div className="grid sm:grid-cols-3 gap-4">{[{ label: "Total shifts", value: shifts.length, icon: <FaClock />, tone: "bg-sky-50 text-sky-600" }, { label: "Open terminals", value: openShifts, icon: <FaUser />, tone: "bg-emerald-50 text-emerald-600" }, { label: "Recorded transactions", value: transactions, icon: <FaReceipt />, tone: "bg-violet-50 text-violet-600" }].map((stat) => <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center gap-4"><div className={`w-10 h-10 grid place-items-center rounded-lg ${stat.tone}`}>{stat.icon}</div><div><p className="text-2xl font-bold text-slate-900">{stat.value}</p><p className="text-xs font-medium text-slate-500">{stat.label}</p></div></div>)}</div>
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3"><div><h2 className="font-bold text-slate-900">Shift history</h2><p className="text-sm text-slate-500 mt-1">Drawer values are recorded when a cashier closes their shift. Click on any row to view adjustment logs.</p></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"><option value="all">All statuses</option><option value="Open">Open</option><option value="Closed">Closed</option></select></div>
      {error ? <div className="p-8 text-center text-sm text-rose-600">{error}</div> : loading ? <div className="p-12 text-center text-sm text-slate-500">Loading shift records…</div> : filtered.length === 0 ? <div className="p-12 text-center"><FaClock className="mx-auto text-3xl text-slate-200" /><p className="mt-3 font-medium text-slate-700">No shifts found</p><p className="mt-1 text-sm text-slate-500">Shift records will appear after cashiers start work.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left min-w-[760px]"><thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3 font-semibold">Cashier</th><th className="px-5 py-3 font-semibold">Started</th><th className="px-5 py-3 font-semibold">Drawer</th><th className="px-5 py-3 font-semibold">Transactions</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((shift) => { const difference = shift.status === "Closed" ? (shift.endingCash || 0) - (shift.expectedCash || 0) : null; const isExpanded = expandedShiftId === shift._id; return <React.Fragment key={shift._id}><tr onClick={() => handleRowClick(shift._id)} className="hover:bg-slate-50/70 cursor-pointer"><td className="px-5 py-4"><p className="font-medium text-sm text-slate-800">{shift.cashierName}</p><p className="text-xs text-slate-500">{shift.cashierId}</p></td><td className="px-5 py-4 text-sm text-slate-600">{new Date(shift.startTime).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-5 py-4"><p className="text-sm font-medium text-slate-800">Opening {currency.format(shift.startingCash || 0)}</p>{shift.status === "Closed" && <p className={`text-xs mt-1 ${difference === 0 ? "text-emerald-600" : difference > 0 ? "text-sky-600" : "text-rose-600"}`}>Expected: {currency.format(shift.expectedCash || 0)} (Var: {currency.format(difference)})</p>}</td><td className="px-5 py-4 text-sm text-slate-700">{shift.transactionsCount || 0}</td><td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${shift.status === "Open" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{shift.status}</span></td></tr>{isExpanded && <tr><td colSpan={5} className="bg-slate-50/50 px-8 py-4"><div className="space-y-3"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cash Drawer Adjustment Logs</h4>{loadingLogs ? <p className="text-xs text-slate-400">Loading logs...</p> : expandedShiftLogs.length === 0 ? <p className="text-xs text-slate-400">No cash drops or payouts logged for this shift.</p> : <div className="max-w-md divide-y divide-slate-100 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">{expandedShiftLogs.map(log => <div key={log._id} className="p-3 flex justify-between items-center text-xs"><div><span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold mr-2 uppercase ${log.type === 'Cash-In' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{log.type}</span><span className="font-semibold text-slate-700">{log.reason}</span></div><div className="text-right"><span className={`font-bold ${log.type === 'Cash-In' ? 'text-emerald-600' : 'text-rose-600'}`}>{log.type === 'Cash-In' ? '+' : '-'}{currency.format(log.amount)}</span><p className="text-[9px] text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p></div></div>)}</div>}</div></td></tr>}</React.Fragment>; })}</tbody></table></div>}</section>
  </div>;
}
