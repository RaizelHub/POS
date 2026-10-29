import { lazy, useEffect, useState, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, CircularProgress, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import {
  FaBell, FaBox, FaChartLine, FaChevronRight, FaClock, FaExclamationTriangle,
  FaHome, FaSearch, FaSignOutAlt, FaStore, FaTag, FaUser, FaUsers, FaReceipt,
  FaBoxes, FaExchangeAlt, FaBalanceScale, FaHistory, FaRedo
} from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import axios from "axios";
import config from "../config";
import novaLogo from "../images/nova_logo.png";

const UserList = lazy(() => import("./Userlist"));
const ProductList = lazy(() => import("./Productlist"));
const TotalSales = lazy(() => import("./TotalSales"));
const AdminProfile = lazy(() => import("./AdminProfile"));
const ShiftLog = lazy(() => import("./ShiftLog"));
const CouponManager = lazy(() => import("./CouponManager"));
const ReceiptCustomizer = lazy(() => import("./ReceiptCustomizer"));
const InventoryManager = lazy(() => import("./InventoryManager"));
const TransactionsLedger = lazy(() => import("./TransactionsLedger"));
const InventoryControl = lazy(() => import("./InventoryControl"));
const ReturnsManager = lazy(() => import("./ReturnsManager"));
const ReconciliationReports = lazy(() => import("./ReconciliationReports"));
const AuditTrail = lazy(() => import("./AuditTrail"));

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const drawerWidth = 268;

  useEffect(() => {
    const fetchAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");
      try {
        const { data } = await axios.get(`${config.apiUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdmin(data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        navigate("/admin-login");
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, [navigate]);

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setError(null);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${config.apiUrl}/api/analytics`, { headers });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching dashboard analytics:", err);
      setError("Unable to load store analytics. Please check backend connection.");
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const menuItems = [
    { text: "Overview", path: "/dashboard", icon: <FaHome /> },
    { text: "Products", path: "/dashboard/product-list", icon: <FaBox /> },
    { text: "Cashiers", path: "/dashboard/user-list", icon: <FaUsers /> },
    { text: "Sales reports", path: "/dashboard/total-sales", icon: <FaChartLine /> },
    { text: "Account settings", path: "/dashboard/admin-profile", icon: <FaUser /> },
  ];

  const operationsItems = [
    { text: "Cashier shifts", path: "/dashboard/shifts-log", icon: <FaClock /> },
    { text: "Promotions", path: "/dashboard/coupon-manager", icon: <FaTag /> },
    { text: "Receipt builder", path: "/dashboard/receipt-customizer", icon: <FaStore /> },
    { text: "Suppliers", path: "/dashboard/inventory-manager", icon: <FaBox /> },
    { text: "Inventory control", path: "/dashboard/inventory-control", icon: <FaBoxes /> },
    { text: "Returns & voids", path: "/dashboard/returns", icon: <FaExchangeAlt /> },
    { text: "Reconciliation", path: "/dashboard/reconciliation", icon: <FaBalanceScale /> },
    { text: "Transactions", path: "/dashboard/transactions-ledger", icon: <FaReceipt /> },
    { text: "Audit trail", path: "/dashboard/audit-trail", icon: <FaHistory /> },
  ];

  const isOverview = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  const sidebarContent = (
    <div className="h-full bg-slate-900 text-slate-300 flex flex-col">
      <div className="h-[76px] px-5 border-b border-slate-800 flex items-center gap-3">
        <img src={novaLogo} alt="SUELTO Logo" className="h-9 w-auto object-contain rounded-lg" />
        <div>
          <p className="font-bold text-white text-sm">SUELTO Retail</p>
          <p className="text-[11px] text-slate-500">Operations console</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-bold tracking-[.14em] uppercase text-slate-500">Workspace</p>
        {menuItems.map((item) => {
          const active = item.path === "/dashboard" ? isOverview : location.pathname === item.path;
          return (
            <Link
              key={item.text}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="w-4">{item.icon}</span>
              {item.text}
            </Link>
          );
        })}
        <p className="px-3 pt-7 pb-2 text-[10px] font-bold tracking-[.14em] uppercase text-slate-500">Operations</p>
        {operationsItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.text}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="w-4">{item.icon}</span>
              {item.text}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-1">
          <Avatar src={admin?.image} sx={{ width: 34, height: 34 }}>{admin?.firstname?.[0]}</Avatar>
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{admin?.firstname} {admin?.lastname}</p>
            <p className="text-[11px] text-slate-500">Store administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <FaSignOutAlt /> Sign out
        </button>
        <p className="mt-3 px-3 text-[10px] text-slate-600">SUELTO POS · v1.1</p>
      </div>
    </div>
  );

  const chartData = analytics?.salesByDay || analytics?.dailySales || [];
  const summary = analytics?.summary || {};
  const lowStock = analytics?.lowStockProducts || [];

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="text-center">
          <CircularProgress color="success" />
          <p className="mt-4 text-sm text-slate-500">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: drawerWidth, border: 0 } }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <aside className="fixed inset-y-0 left-0 w-[268px]">{sidebarContent}</aside>
      )}

      <div className={`min-w-0 flex-1 ${isMobile ? "" : "ml-[268px]"}`}>
        <header className="sticky top-0 z-20 h-[76px] bg-white border-b border-slate-200 px-5 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0 gap-3">
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <IoMenu />
              </IconButton>
            )}
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500">Retail operations / {isOverview ? "Overview" : "Management"}</p>
              <p className="font-bold text-slate-900">{isOverview ? "Store overview" : "Management workspace"}</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center max-w-sm flex-1 mx-auto relative">
            <FaSearch className="absolute left-3 text-slate-400 text-xs" />
            <input
              aria-label="Global search"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="Search products, transactions…"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-right">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
                <FaStore size={13} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Main Branch</p>
                <p className="text-[10px] text-slate-500">Open · Today</p>
              </div>
            </div>
            <button
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              <FaBell className="mx-auto" size={14} />
              {(summary.lowStockCount || 0) > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </button>
            <Avatar src={admin?.image} sx={{ width: 34, height: 34 }}>{admin?.firstname?.[0]}</Avatar>
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto p-5 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between">
              <p className="text-sm font-medium">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="inline-flex items-center gap-1.5 bg-white border border-rose-300 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors"
              >
                <FaRedo size={11} /> Retry
              </button>
            </div>
          )}

          {isOverview && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    Good day, {admin?.firstname || "Administrator"}.
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Authoritative retail performance based on persisted branch sales.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchAnalytics}
                    className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                    title="Refresh analytics data"
                  >
                    <FaRedo size={12} /> Refresh
                  </button>
                  <Link
                    to="/dashboard/product-list"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                  >
                    Manage catalog <FaChevronRight size={11} />
                  </Link>
                </div>
              </div>

              {/* Top Summary Metric Cards */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "Today's sales",
                    value: peso.format(summary.todaySales ?? 0),
                    note: `All-time revenue: ${peso.format(summary.totalRevenue ?? 0)}`,
                    icon: <FaChartLine />,
                    tone: "bg-emerald-50 text-emerald-600",
                  },
                  {
                    label: "Transactions today",
                    value: (summary.todayTransactions ?? 0).toLocaleString(),
                    note: `Average ticket: ${peso.format(summary.todayAverageTransactionValue ?? summary.averageTransactionValue ?? 0)}`,
                    icon: <FaReceipt />,
                    tone: "bg-sky-50 text-sky-600",
                  },
                  {
                    label: "Catalog products",
                    value: (summary.totalProducts ?? 0).toLocaleString(),
                    note: `${summary.totalCashiers ?? 0} active cashier terminal(s)`,
                    icon: <FaBox />,
                    tone: "bg-violet-50 text-violet-600",
                  },
                  {
                    label: "Low stock alerts",
                    value: (summary.lowStockCount ?? 0).toLocaleString(),
                    note: (summary.outOfStockCount ?? 0) > 0
                      ? `${summary.outOfStockCount} item(s) completely out of stock`
                      : (summary.lowStockCount ?? 0) > 0
                        ? "Items at or below reorder threshold"
                        : "Inventory levels healthy",
                    icon: <FaExclamationTriangle />,
                    tone: (summary.lowStockCount ?? 0) > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
                  },
                ].map((card) => (
                  <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">{card.label}</p>
                        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p>
                      </div>
                      <div className={`w-10 h-10 grid place-items-center rounded-lg ${card.tone}`}>
                        {card.icon}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">{card.note}</p>
                  </div>
                ))}
              </div>

              {/* Chart & Low-Stock Alerts */}
              <div className="grid xl:grid-cols-3 gap-6">
                <section className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="font-bold text-slate-900">7-Day Sales Trend</h2>
                      <p className="text-sm text-slate-500 mt-1">Net sales revenue (deducting returns)</p>
                    </div>
                    <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                      Live branch data
                    </span>
                  </div>
                  <div className="h-[280px]">
                    {chartData.length > 0 && chartData.some((d) => d.sales > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#059669" stopOpacity={0.22} />
                              <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                          <Tooltip formatter={(val) => [peso.format(val), "Revenue"]} />
                          <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2} fill="url(#salesFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full grid place-items-center text-center">
                        <div>
                          <FaChartLine className="mx-auto text-slate-300 text-3xl" />
                          <p className="mt-3 text-sm font-medium text-slate-600">No recorded sales in the last 7 days</p>
                          <p className="text-xs text-slate-400 mt-1">Complete sales transactions in terminal to populate trends.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900">Inventory Attention</h2>
                      <p className="text-xs text-slate-500 mt-0.5">At or below reorder threshold</p>
                    </div>
                    <Link to="/dashboard/inventory-control" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                      Restock →
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1">
                    {lowStock.length > 0 ? (
                      lowStock.slice(0, 6).map((item) => (
                        <div key={item._id} className="px-5 py-3.5 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg grid place-items-center ${item.quantity <= 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                            <FaBox size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{item.category || "General"}</p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold ${item.quantity <= 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                              {item.quantity <= 0 ? "Out of Stock" : `${item.quantity} left`}
                            </span>
                            <p className="text-[10px] text-slate-400">Min: {item.lowStockThreshold || 5}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center my-auto">
                        <div className="w-10 h-10 mx-auto grid place-items-center rounded-full bg-emerald-50 text-emerald-600 font-bold">
                          ✓
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-700">Inventory levels healthy</p>
                        <p className="mt-1 text-xs text-slate-400">No products below reorder thresholds.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Best Selling Products & Recent Transactions Section */}
              <div className="grid xl:grid-cols-2 gap-6">
                <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h2 className="font-bold text-slate-900 mb-1">Top Selling Products (30 Days)</h2>
                  <p className="text-xs text-slate-500 mb-4">Ranked by volume sold net of customer returns</p>
                  {(analytics?.topProducts || []).length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topProducts.map((p, idx) => (
                        <div key={p.name} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-none">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs font-bold grid place-items-center">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-800 truncate">{p.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">{p.quantity} units</span>
                            <span className="text-xs text-slate-400 ml-2">({peso.format(p.revenue)})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      No sales recorded in the past 30 days.
                    </div>
                  )}
                </section>

                <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-bold text-slate-900">Recent Transactions</h2>
                    <Link to="/dashboard/transactions-ledger" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                      View all →
                    </Link>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Latest checkout activity in this store branch</p>
                  {(analytics?.recentTransactions || []).length > 0 ? (
                    <div className="space-y-3">
                      {analytics.recentTransactions.map((tx) => (
                        <div key={tx._id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-none">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-xs truncate font-mono">
                              {tx.transactionId?.slice(0, 18)}…
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {tx.cashierName} · {tx.paymentMethod} · {tx.itemCount} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">{peso.format(tx.amount)}</p>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              tx.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {tx.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      No transactions recorded yet.
                    </div>
                  )}
                </section>
              </div>
            </section>
          )}

          <section className={isOverview ? "mt-7" : ""}>
            <Routes>
              <Route path="user-list" element={<UserList />} />
              <Route path="product-list" element={<ProductList />} />
              <Route path="total-sales" element={<TotalSales />} />
              <Route path="admin-profile" element={<AdminProfile />} />
              <Route path="shifts-log" element={<ShiftLog />} />
              <Route path="coupon-manager" element={<CouponManager />} />
              <Route path="receipt-customizer" element={<ReceiptCustomizer />} />
              <Route path="inventory-manager" element={<InventoryManager />} />
              <Route path="inventory-control" element={<InventoryControl />} />
              <Route path="returns" element={<ReturnsManager />} />
              <Route path="reconciliation" element={<ReconciliationReports />} />
              <Route path="transactions-ledger" element={<TransactionsLedger />} />
              <Route path="audit-trail" element={<AuditTrail />} />
            </Routes>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
