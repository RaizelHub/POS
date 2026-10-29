import { lazy, useEffect, useState, useCallback } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, CircularProgress, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import {
  FaBell, FaBox, FaChartLine, FaChevronRight, FaClock, FaExclamationTriangle,
  FaHome, FaSearch, FaSignOutAlt, FaStore, FaTag, FaUser, FaUsers, FaReceipt,
  FaBoxes, FaExchangeAlt, FaBalanceScale, FaHistory, FaRedo, FaChevronLeft,
  FaCashRegister
} from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem("suelto_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("suelto_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

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
    { text: "Overview", path: "/dashboard", icon: <FaHome size={15} /> },
    { text: "Products", path: "/dashboard/product-list", icon: <FaBox size={14} /> },
    { text: "Cashiers", path: "/dashboard/user-list", icon: <FaUsers size={14} /> },
    { text: "Sales reports", path: "/dashboard/total-sales", icon: <FaChartLine size={14} /> },
    { text: "Account settings", path: "/dashboard/admin-profile", icon: <FaUser size={13} /> },
  ];

  const operationsItems = [
    { text: "Cashier shifts", path: "/dashboard/shifts-log", icon: <FaClock size={14} /> },
    { text: "Promotions", path: "/dashboard/coupon-manager", icon: <FaTag size={13} /> },
    { text: "Receipt builder", path: "/dashboard/receipt-customizer", icon: <FaStore size={14} /> },
    { text: "Suppliers", path: "/dashboard/inventory-manager", icon: <FaBox size={14} /> },
    { text: "Inventory control", path: "/dashboard/inventory-control", icon: <FaBoxes size={14} /> },
    { text: "Returns & voids", path: "/dashboard/returns", icon: <FaExchangeAlt size={13} /> },
    { text: "Reconciliation", path: "/dashboard/reconciliation", icon: <FaBalanceScale size={14} /> },
    { text: "Transactions", path: "/dashboard/transactions-ledger", icon: <FaReceipt size={13} /> },
    { text: "Audit trail", path: "/dashboard/audit-trail", icon: <FaHistory size={13} /> },
  ];

  const isOverview = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  // Map route path to human-readable title
  const currentRouteTitle = (() => {
    if (isOverview) return "Overview";
    const all = [...menuItems, ...operationsItems];
    const match = all.find((item) => item.path === location.pathname);
    return match ? match.text : "Management";
  })();

  const sidebarContent = (
    <div className="h-full bg-slate-900 text-slate-300 flex flex-col select-none border-r border-slate-800/80">
      {/* Brand Header — Compact Uniform h-14 (56px) */}
      <div className={`h-14 px-4 border-b border-slate-800/80 flex items-center ${isCollapsed && !isMobile ? "justify-center" : "justify-between"}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={novaLogo}
            alt="SUELTO Logo"
            className="h-8 w-auto object-contain rounded-lg shrink-0 shadow-xs"
          />
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0 overflow-hidden">
              <p className="font-bold text-white text-xs tracking-tight truncate leading-tight">SUELTO POS</p>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide truncate">Retail Operations</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {(!isCollapsed || isMobile) ? (
          <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-bold tracking-[.14em] uppercase text-slate-400">
            Workspace
          </p>
        ) : (
          <div className="w-5 h-px bg-slate-800 mx-auto my-2" />
        )}

        {menuItems.map((item) => {
          const active = item.path === "/dashboard" ? isOverview : location.pathname === item.path;
          return (
            <Link
              key={item.text}
              to={item.path}
              title={isCollapsed && !isMobile ? item.text : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? "bg-emerald-600 text-white shadow-xs font-semibold"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
              } ${isCollapsed && !isMobile ? "justify-center px-0 h-9" : ""}`}
            >
              <span className="shrink-0 grid place-items-center">{item.icon}</span>
              {(!isCollapsed || isMobile) && <span className="truncate">{item.text}</span>}
            </Link>
          );
        })}

        {(!isCollapsed || isMobile) ? (
          <p className="px-2.5 pt-5 pb-1.5 text-[10px] font-bold tracking-[.14em] uppercase text-slate-400">
            Operations
          </p>
        ) : (
          <div className="w-5 h-px bg-slate-800 mx-auto my-3" />
        )}

        {operationsItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.text}
              to={item.path}
              title={isCollapsed && !isMobile ? item.text : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                active
                  ? "bg-emerald-600 text-white shadow-xs font-semibold"
                  : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
              } ${isCollapsed && !isMobile ? "justify-center px-0 h-9" : ""}`}
            >
              <span className="shrink-0 grid place-items-center">{item.icon}</span>
              {(!isCollapsed || isMobile) && <span className="truncate">{item.text}</span>}
            </Link>
          );
        })}
      </nav>

      {/* POS Direct Link */}
      <div className="px-2.5 py-2 border-t border-slate-800/80">
        <Link
          to="/scan"
          title={isCollapsed && !isMobile ? "Open POS Register" : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25 border border-emerald-500/20 transition-all ${
            isCollapsed && !isMobile ? "justify-center px-0 h-9" : ""
          }`}
        >
          <FaCashRegister size={13} className="shrink-0" />
          {(!isCollapsed || isMobile) && <span>Open POS Register</span>}
        </Link>
      </div>

      {/* User Card & Sign Out */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/40">
        {(!isCollapsed || isMobile) ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <Avatar
                  src={admin?.image}
                  sx={{ width: 30, height: 30, fontSize: "0.8rem", bgcolor: "#059669" }}
                >
                  {admin?.firstname?.[0] || "A"}
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-white font-semibold truncate leading-tight">
                  {admin?.firstname} {admin?.lastname}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out of console"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <FaSignOutAlt size={13} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="relative">
              <Avatar
                src={admin?.image}
                sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "#059669" }}
              >
                {admin?.firstname?.[0] || "A"}
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            >
              <FaSignOutAlt size={12} />
            </button>
          </div>
        )}
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
          <CircularProgress color="success" size={32} thickness={4} />
          <p className="mt-3 text-xs font-medium text-slate-500">Preparing workspace…</p>
        </div>
      </div>
    );
  }

  const sidebarWidth = isCollapsed ? 68 : 240;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 antialiased selection:bg-emerald-500/20 selection:text-emerald-950">
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: 240, border: 0 } }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="fixed inset-y-0 left-0 z-30 transition-[width] duration-200 ease-in-out"
        >
          {sidebarContent}
        </aside>
      )}

      {/* Main Layout Area */}
      <div
        className="min-w-0 flex-1 flex flex-col transition-[margin-left] duration-200 ease-in-out"
        style={{ marginLeft: isMobile ? "0px" : `${sidebarWidth}px` }}
      >
        {/* Uniform Top Header — Exact h-14 (56px) */}
        <header className="sticky top-0 z-20 h-14 bg-white border-b border-slate-200/90 px-4 md:px-6 flex items-center justify-between gap-3 shadow-xs">
          {/* Left: Mobile Toggle / Desktop Collapse & Breadcrumbs */}
          <div className="flex items-center min-w-0 gap-2.5">
            {isMobile ? (
              <IconButton
                size="small"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
                className="text-slate-600"
              >
                <IoMenu size={19} />
              </IconButton>
            ) : (
              <button
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={isCollapsed ? "Expand sidebar (Ctrl+\\)" : "Collapse sidebar (Ctrl+\\)"}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                {isCollapsed ? <LuPanelLeftOpen size={16} /> : <LuPanelLeftClose size={16} />}
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Operations</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold truncate">{currentRouteTitle}</span>
            </div>
          </div>

          {/* Center: Compact Global Search with Keyboard Hint */}
          <div className="hidden md:flex items-center max-w-xs flex-1 mx-2 relative">
            <FaSearch className="absolute left-2.5 text-slate-400 text-[11px]" />
            <input
              aria-label="Global search"
              className="w-full bg-slate-50/80 border border-slate-200 rounded-lg py-1.5 pl-8 pr-11 text-xs placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 outline-none focus:ring-1 focus:ring-emerald-600 transition-all font-medium text-slate-800"
              placeholder="Search catalog, sales…"
            />
            <span className="absolute right-2 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-white border border-slate-200 select-none pointer-events-none">
              ⌘K
            </span>
          </div>

          {/* Right: POS Action, Branch Status, Notifications, Profile */}
          <div className="flex items-center gap-2">
            <Link
              to="/scan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors shrink-0"
            >
              <FaCashRegister size={11} />
              <span className="hidden sm:inline">Register POS</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 bg-slate-50/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Main Branch</span>
            </div>

            <button
              aria-label="Notifications"
              title="Store alerts"
              className="relative w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 grid place-items-center transition-colors"
            >
              <FaBell size={12} />
              {(summary.lowStockCount || 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <Avatar
              src={admin?.image}
              sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: "#0f172a" }}
            >
              {admin?.firstname?.[0] || "A"}
            </Avatar>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 lg:p-8">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center justify-between text-xs font-medium">
              <p>{error}</p>
              <button
                onClick={fetchAnalytics}
                className="inline-flex items-center gap-1.5 bg-white border border-rose-300 text-rose-700 px-2.5 py-1 rounded-md text-xs font-semibold hover:bg-rose-100 transition-colors"
              >
                <FaRedo size={10} /> Retry
              </button>
            </div>
          )}

          {isOverview && (
            <section className="space-y-6">
              {/* Executive Welcome & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
                    Good day, {admin?.firstname || "Administrator"}.
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchAnalytics}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    title="Refresh analytics data"
                  >
                    <FaRedo size={10} /> Refresh
                  </button>
                  <Link
                    to="/dashboard/product-list"
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    Catalog <FaChevronRight size={9} />
                  </Link>
                </div>
              </div>

              {/* High-Density KPI Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    label: "Today's Net Sales",
                    value: peso.format(summary.todaySales ?? 0),
                    note: `All-time: ${peso.format(summary.totalRevenue ?? 0)}`,
                    icon: <FaChartLine size={13} />,
                    accent: "border-l-emerald-600",
                    badgeTone: "bg-emerald-50 text-emerald-700",
                  },
                  {
                    label: "Transactions Today",
                    value: (summary.todayTransactions ?? 0).toLocaleString(),
                    note: `Average ticket: ${peso.format(summary.todayAverageTransactionValue ?? summary.averageTransactionValue ?? 0)}`,
                    icon: <FaReceipt size={13} />,
                    accent: "border-l-sky-600",
                    badgeTone: "bg-sky-50 text-sky-700",
                  },
                  {
                    label: "Catalog Products",
                    value: (summary.totalProducts ?? 0).toLocaleString(),
                    note: `${summary.totalCashiers ?? 0} cashier terminal(s)`,
                    icon: <FaBox size={13} />,
                    accent: "border-l-violet-600",
                    badgeTone: "bg-violet-50 text-violet-700",
                  },
                  {
                    label: "Low Stock Items",
                    value: (summary.lowStockCount ?? 0).toLocaleString(),
                    note: (summary.outOfStockCount ?? 0) > 0
                      ? `${summary.outOfStockCount} SKU(s) completely out of stock`
                      : (summary.lowStockCount ?? 0) > 0
                        ? "Items at or below reorder threshold"
                        : "Inventory healthy",
                    icon: <FaExclamationTriangle size={13} />,
                    accent: (summary.lowStockCount ?? 0) > 0 ? "border-l-amber-500" : "border-l-emerald-600",
                    badgeTone: (summary.lowStockCount ?? 0) > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className={`bg-white border border-slate-200/90 border-l-4 ${card.accent} rounded-xl p-4 shadow-xs`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                      <span className={`p-1.5 rounded-md ${card.badgeTone}`}>{card.icon}</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">{card.value}</p>
                    <p className="mt-1 text-[11px] text-slate-400 font-medium truncate">{card.note}</p>
                  </div>
                ))}
              </div>

              {/* 7-Day Trend Chart & Low-Stock Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <section className="xl:col-span-2 bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">7-Day Sales Trend</h2>
                      <p className="text-xs text-slate-400">Net revenue net of refunds and returns</p>
                    </div>
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                      Persisted records
                    </span>
                  </div>

                  <div className="h-[250px]">
                    {chartData.length > 0 && chartData.some((d) => d.sales > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                          <defs>
                            <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#059669" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#059669" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                          <Tooltip
                            formatter={(val) => [peso.format(val), "Net Sales"]}
                            contentStyle={{
                              backgroundColor: "#0f172a",
                              borderColor: "#1e293b",
                              borderRadius: "8px",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                          />
                          <Area type="monotone" dataKey="sales" stroke="#059669" strokeWidth={2} fill="url(#salesFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full grid place-items-center text-center">
                        <div>
                          <FaChartLine className="mx-auto text-slate-300 text-2xl" />
                          <p className="mt-2 text-xs font-semibold text-slate-600">No recorded sales in the last 7 days</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Transactions completed in the register will populate this curve.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Low Stock Drawer */}
                <section className="bg-white border border-slate-200/90 rounded-xl shadow-xs flex flex-col">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Inventory Alerts</h2>
                      <p className="text-xs text-slate-400">At or below reorder threshold</p>
                    </div>
                    <Link to="/dashboard/inventory-control" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                      Restock →
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[250px]">
                    {lowStock.length > 0 ? (
                      lowStock.slice(0, 6).map((item) => (
                        <div key={item._id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50/60 transition-colors">
                          <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${
                            item.quantity <= 0 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                          }`}>
                            <FaBox size={12} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-xs text-slate-800 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize truncate">{item.category || "General"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`text-xs font-bold font-mono ${item.quantity <= 0 ? "text-rose-600" : "text-amber-600"}`}>
                              {item.quantity <= 0 ? "Out" : `${item.quantity} left`}
                            </span>
                            <p className="text-[9px] text-slate-400">Min: {item.lowStockThreshold || 5}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center my-auto">
                        <div className="w-8 h-8 mx-auto grid place-items-center rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs">
                          ✓
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-700">Stock levels healthy</p>
                        <p className="text-[10px] text-slate-400">No items below reorder threshold.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Best Selling & Recent Transactions */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <section className="bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 shadow-xs">
                  <h2 className="text-sm font-bold text-slate-900">Top Velocity Products</h2>
                  <p className="text-xs text-slate-400 mb-3">Ranked by units sold in the past 30 days</p>
                  {(analytics?.topProducts || []).length > 0 ? (
                    <div className="space-y-2">
                      {analytics.topProducts.slice(0, 5).map((p, idx) => (
                        <div key={p.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold grid place-items-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-800 truncate">{p.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-slate-900 font-mono">{p.quantity} units</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">({peso.format(p.revenue)})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No sales recorded in the past 30 days.
                    </div>
                  )}
                </section>

                <section className="bg-white border border-slate-200/90 rounded-xl p-4 md:p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
                    <Link to="/dashboard/transactions-ledger" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                      Ledger →
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Latest verified sales tickets</p>
                  {(analytics?.recentTransactions || []).length > 0 ? (
                    <div className="space-y-2">
                      {analytics.recentTransactions.slice(0, 5).map((tx) => (
                        <div key={tx._id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 font-mono truncate">
                              {tx.transactionId}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {tx.cashierName} · {tx.paymentMethod} · {tx.itemCount} items
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-slate-900 font-mono">{peso.format(tx.amount)}</p>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                              tx.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {tx.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No transactions recorded yet.
                    </div>
                  )}
                </section>
              </div>
            </section>
          )}

          {/* Nested Sub-Routes */}
          <section className={isOverview ? "mt-6" : ""}>
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
