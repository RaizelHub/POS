import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, FaUser, FaRegMoneyBillAlt, FaCheckCircle, 
  FaHourglassHalf, FaSearch, FaArrowLeft, FaFilter, FaPrint
} from 'react-icons/fa';
import config from '../config';

const TransactionsLedger = ({ isModalView = false, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  // Filters state
  const [selectedCashier, setSelectedCashier] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Paid', 'Pay Later'

  useEffect(() => {
    fetchCashiers();
    fetchLedgerData();
  }, [selectedCashier, startDate, endDate]);

  const fetchCashiers = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/users`);
      if (res.ok) {
        const data = await res.json();
        // Filter only cashiers or show all accounts
        setCashiers(data);
      }
    } catch (err) {
      console.error("Error fetching cashier list:", err);
    }
  };

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      let queryParams = [];
      if (selectedCashier) queryParams.push(`cashierId=${selectedCashier}`);
      if (startDate) queryParams.push(`startDate=${startDate}`);
      if (endDate) queryParams.push(`endDate=${endDate}`);

      const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
      const res = await fetch(`${config.apiUrl}/api/transactions/ledger${queryString}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error("Error fetching transactions ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  // Confirm Pay Later payment for individual product item
  const handleConfirmItemPayment = async (userId, itemId) => {
    setConfirmingId(itemId);
    try {
      const res = await fetch(`${config.apiUrl}/api/transactions/pay-later/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, itemId })
      });
      if (res.ok) {
        // Refresh local listings
        await fetchLedgerData();
      } else {
        alert("Failed to confirm payment.");
      }
    } catch (err) {
      console.error("Error confirming credit item:", err);
    } finally {
      setConfirmingId(null);
    }
  };

  // Group transactions by date string (e.g. YYYY-MM-DD)
  const groupTransactionsByDate = () => {
    const groups = {};
    transactions.forEach(tx => {
      const dateStr = new Date(tx.transactionDate).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(tx);
    });
    return groups;
  };

  // Filter transactions by overall status
  const getFilteredTransactions = () => {
    if (statusFilter === 'All') return transactions;
    return transactions.filter(tx => {
      // Check if any product item matches status
      const hasStatus = tx.products.some(p => p.paymentStatus === statusFilter);
      return hasStatus;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  const groupedData = {};
  filteredTransactions.forEach(tx => {
    const dateStr = new Date(tx.transactionDate).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groupedData[dateStr]) {
      groupedData[dateStr] = [];
    }
    groupedData[dateStr].push(tx);
  });

  // Calculate totals
  const totalSales = transactions.reduce((sum, tx) => {
    // Sum only products marked 'Paid'
    const paidSum = tx.products
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((s, p) => s + p.totalPrice, 0);
    return sum + paidSum;
  }, 0);

  const totalOutstanding = transactions.reduce((sum, tx) => {
    // Sum only products marked 'Pay Later'
    const creditSum = tx.products
      .filter(p => p.paymentStatus === 'Pay Later')
      .reduce((s, p) => s + p.totalPrice, 0);
    return sum + creditSum;
  }, 0);

  return (
    <div className={`min-h-screen bg-slate-50 ${isModalView ? 'p-0' : 'p-6 md:p-8'} font-sans antialiased text-slate-800`}>
      
      {/* Title Header */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {isModalView && (
            <button 
              onClick={onClose}
              className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <FaArrowLeft />
            </button>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              🧾 Transaction Ledger & Credits
            </h1>
            <p className="text-xs text-slate-500">
              Audit checkout entries, track payment statuses, and reconcile customer tabs.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <FaRegMoneyBillAlt />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Revenue Collected</span>
            <span className="text-lg font-bold text-slate-900">₱{totalSales.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
            <FaHourglassHalf />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Credit Tab</span>
            <span className="text-lg font-bold text-slate-900">₱{totalOutstanding.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
            <FaCheckCircle />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Transaction Records</span>
            <span className="text-lg font-bold text-slate-900">{transactions.length}</span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wide">
          <FaFilter className="text-[10px] text-slate-400" /> Filter Logs
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Cashier Profile</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-slate-400 text-xs" />
              <select
                value={selectedCashier}
                onChange={(e) => setSelectedCashier(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-750 font-semibold focus:bg-white focus:outline-none focus:border-slate-350"
              >
                <option value="">All Cashiers</option>
                {cashiers.map(c => (
                  <option key={c._id} value={c._id}>{c.firstname} {c.lastname}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">From Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-slate-400 text-xs" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-750 font-semibold focus:bg-white focus:outline-none focus:border-slate-350"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">To Date</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 text-slate-400 text-xs" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-750 font-semibold focus:bg-white focus:outline-none focus:border-slate-350"
              />
            </div>
          </div>

          {/* Payment Status Quick Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">Payment Type Filter</label>
            <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
              {['All', 'Paid', 'Pay Later'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 py-1 text-center text-xs font-bold rounded transition-all ${statusFilter === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Querying transaction log sheets...</p>
        </div>
      ) : Object.keys(groupedData).length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm space-y-2">
          <FaSearch className="text-slate-300 text-3xl mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Matching Transactions</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters, dates, or cashier selection.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedData).map((dateGroup) => (
            <div key={dateGroup} className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">{dateGroup}</span>
              
              <div className="space-y-3">
                {groupedData[dateGroup].map((tx) => (
                  <div key={tx._id} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
                    
                    {/* Transaction header */}
                    <div className="flex flex-col sm:flex-row justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">TXID: {tx.transactionId?.slice(0, 8)}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({tx._id})</span>
                          {tx.promoCode && (
                            <span className="bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                              Promo: {tx.promoCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                          <span>🕒 {new Date(tx.transactionDate).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>👤 Cashier: <strong className="text-slate-700 font-semibold">{tx.userId ? `${tx.userId.firstname} ${tx.userId.lastname}` : 'System'}</strong></span>
                          <span>💼 Client: <strong className="text-slate-700 font-semibold">{tx.customerId ? tx.customerId.name : 'Walk-in'}</strong></span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Gross Charge</span>
                        <span className="text-base font-extrabold text-slate-950">₱{(tx.originalAmount - tx.discountAmount).toFixed(2)}</span>
                        {tx.discountAmount > 0 && (
                          <span className="text-[10px] text-emerald-650 font-bold block">Discounted: -₱{tx.discountAmount.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Products details table */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-450 font-bold block uppercase tracking-wider">Scanned Products Log</span>
                      <div className="divide-y divide-slate-100">
                        {tx.products.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-800 font-bold">{item.name}</span>
                              <span className="text-slate-400">({item.quantity} units x ₱{item.price.toFixed(2)})</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                {item.paymentStatus}
                              </span>

                              {item.paymentStatus === 'Pay Later' && (
                                <button
                                  onClick={() => handleConfirmItemPayment(tx.userId?._id || tx.userId, item._id)}
                                  disabled={confirmingId === item._id}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm hover:shadow transition-all disabled:opacity-50"
                                >
                                  {confirmingId === item._id ? 'Confirming...' : 'Collect Pay'}
                                </button>
                              )}

                              <span className="text-slate-900 font-bold w-20 text-right">₱{item.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Split details display */}
                    {tx.paymentMethod === 'Split' && tx.splitDetails && (
                      <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Split Fractions:</span>
                        <div className="flex gap-4">
                          <span>💵 Cash Amount: <strong className="text-slate-700">₱{tx.splitDetails.cashAmount.toFixed(2)}</strong></span>
                          <span>📱 Digital Amount: <strong className="text-slate-700">₱{tx.splitDetails.digitalAmount.toFixed(2)}</strong></span>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TransactionsLedger;
