import { useEffect, useState } from 'react';
import { FaHistory, FaSearch } from 'react-icons/fa';
import api from '../utils/api';

const AuditTrail = () => {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/audit-logs?limit=250')
      .then((response) => setLogs(response.data))
      .catch(() => setError('Unable to load the audit trail.'));
  }, []);

  const filtered = logs.filter((log) =>
    `${log.action} ${log.summary} ${log.actorId?.firstname || ''} ${log.actorId?.lastname || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Accountability</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Audit trail</h1>
          <p className="mt-1 text-sm text-slate-500">Security-sensitive sales and inventory actions.</p>
        </div>
        <label className="relative w-full max-w-xs">
          <FaSearch className="absolute left-3 top-3.5 text-xs text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity" className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm" />
        </label>
      </div>

      {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-14 text-center">
            <FaHistory className="mx-auto text-3xl text-slate-200" />
            <p className="mt-3 text-sm font-semibold text-slate-600">No matching activity</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <article key={log._id} className="grid gap-3 p-5 sm:grid-cols-[160px_1fr_auto] sm:items-center">
                <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{log.action}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{log.summary || log.entityType}</p>
                  <p className="mt-1 text-xs text-slate-500">{log.actorId ? `${log.actorId.firstname} ${log.actorId.lastname}` : 'System'} · {log.entityType}</p>
                </div>
                <time className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString('en-PH')}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuditTrail;

