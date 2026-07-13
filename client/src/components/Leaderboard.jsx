import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCrown, FaUsers, FaChartBar, FaAward, FaCalendarAlt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import config from '../config';

function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${config.apiUrl}/api/analytics/cashier-leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Could not retrieve cashier leaderboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (index) => {
    switch (index) {
      case 0: return 'text-amber-500 bg-amber-50 border-amber-200'; // Gold
      case 1: return 'text-slate-400 bg-slate-50 border-slate-200'; // Silver
      case 2: return 'text-amber-700 bg-amber-50/50 border-amber-200/50'; // Bronze
      default: return 'text-slate-550 bg-slate-100 border-slate-200';
    }
  };

  const colors = ['#F59E0B', '#94A3B8', '#B45309', '#10B981', '#6366F1', '#EC4899'];

  const chartData = data.map(item => ({
    name: `${item.firstname} ${item.lastname[0]}.`,
    sales: item.totalSales,
    count: item.transactionsCount
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FaCrown className="text-amber-500 animate-bounce" /> Cashier Performance Leaderboards
        </h2>
        <p className="text-slate-500 text-xs mt-1">Review top checkout volume, sales counts, and cashier transaction speed log analytics.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold">
          {error}
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
          <FaUsers className="text-slate-300 text-4xl mx-auto mb-2" />
          <p className="text-slate-650 text-sm font-semibold">No cashier transaction records found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Top 3 & Table rankings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top 3 Podiums */}
            <div className="grid grid-cols-3 gap-4 items-end pt-4 pb-2">
              
              {/* 2nd Place */}
              {data[1] && (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-slate-350 flex items-center justify-center font-bold text-slate-700 text-lg shadow-sm">
                      {data[1].image ? <img src={data[1].image} alt="2nd" className="w-full h-full object-cover rounded-full" /> : data[1].firstname[0]}
                    </div>
                    <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-[10px] font-bold flex items-center justify-center border border-slate-400">2nd</span>
                  </div>
                  <p className="text-xs font-bold text-slate-950 mt-2 truncate max-w-[80px] text-center">{data[1].firstname}</p>
                  <p className="text-[10px] text-slate-550 font-semibold mt-0.5">₱{data[1].totalSales.toLocaleString()}</p>
                  <div className="w-full h-12 bg-slate-100 border-t border-slate-200 rounded-t-lg mt-3 flex items-center justify-center text-xs font-bold text-slate-400">🥈 Silver</div>
                </div>
              )}

              {/* 1st Place */}
              {data[0] && (
                <div className="flex flex-col items-center">
                  <div className="relative -top-2">
                    <div className="w-18 h-18 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-700 text-xl shadow-md">
                      {data[0].image ? <img src={data[0].image} alt="1st" className="w-full h-full object-cover rounded-full" /> : data[0].firstname[0]}
                    </div>
                    <span className="absolute -top-3 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center border border-amber-600 shadow-sm animate-pulse">👑</span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-950 mt-1 truncate max-w-[100px] text-center">{data[0].firstname}</p>
                  <p className="text-xs font-bold text-amber-600 mt-0.5">₱{data[0].totalSales.toLocaleString()}</p>
                  <div className="w-full h-16 bg-amber-50 border-t border-amber-200 rounded-t-lg mt-3 flex items-center justify-center text-sm font-extrabold text-amber-500 shadow-sm">🥇 Gold</div>
                </div>
              )}

              {/* 3rd Place */}
              {data[2] && (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200/50 flex items-center justify-center font-bold text-amber-800 text-lg shadow-sm">
                      {data[2].image ? <img src={data[2].image} alt="3rd" className="w-full h-full object-cover rounded-full" /> : data[2].firstname[0]}
                    </div>
                    <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-amber-50 text-[10px] font-bold flex items-center justify-center border border-amber-800">3rd</span>
                  </div>
                  <p className="text-xs font-bold text-slate-950 mt-2 truncate max-w-[80px] text-center">{data[2].firstname}</p>
                  <p className="text-[10px] text-slate-550 font-semibold mt-0.5">₱{data[2].totalSales.toLocaleString()}</p>
                  <div className="w-full h-10 bg-amber-50/20 border-t border-amber-250/20 rounded-t-lg mt-3 flex items-center justify-center text-xs font-bold text-amber-750">🥉 Bronze</div>
                </div>
              )}

            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"><FaAward /> Leaderboard Rankings</span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase">All Active Shifts</span>
              </div>
              <div className="divide-y divide-slate-100">
                {data.map((item, index) => (
                  <div key={item._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border font-bold text-xs flex items-center justify-center ${getMedalColor(index)}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.firstname} {item.lastname}</p>
                        <p className="text-[11px] text-slate-400">{item.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-950 text-sm">₱{item.totalSales.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{item.transactionsCount} txs completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Recharts Bar Chart (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5"><FaChartBar className="text-indigo-500" /> Revenue Share</h3>
              <p className="text-xs text-slate-500 mt-0.5">Visual representation of total checkout volume generated by cashier.</p>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Sales Volume']} />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs font-semibold text-slate-550 leading-relaxed space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Performance tracked in real-time.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                <span>Leaderboard resets automatically weekly.</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Leaderboard;
