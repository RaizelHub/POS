import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, CircularProgress, Drawer, IconButton, useMediaQuery, useTheme } from "@mui/material";
import {
  FaBell, FaBox, FaChartLine, FaChevronRight, FaClock, FaExclamationTriangle,
  FaHome, FaSearch, FaSignOutAlt, FaStore, FaTag, FaUser, FaUsers, FaCrown, FaReceipt
} from "react-icons/fa";
import { IoClose, IoMenu } from "react-icons/io5";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import axios from "axios";
import UserList from "./Userlist";
import ProductList from "./Productlist";
import TotalSales from "./TotalSales";
import AdminProfile from "./AdminProfile";
import ShiftLog from "./ShiftLog";
import CouponManager from "./CouponManager";
import ReceiptCustomizer from "./ReceiptCustomizer";
import InventoryManager from "./InventoryManager";
import Leaderboard from "./Leaderboard";
import TransactionsLedger from "./TransactionsLedger";
import config from "../config";
import novaLogo from "../images/nova_logo.png";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

function Dashboard() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({ users: 0, products: 0, sales: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
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
        const { data } = await axios.get(`${config.apiUrl}/api/admin/profile`, { headers: { Authorization: `Bearer ${token}` } });
        setAdmin(data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        navigate("/admin-login");
      } finally { setLoading(false); }
    };
    fetchAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [usersRes, productsRes, salesRes, analyticsRes] = await Promise.all([
          axios.get(`${config.apiUrl}/api/users`, { headers }),
          axios.get(`${config.apiUrl}/api/products`, { headers }),
          axios.get(`${config.apiUrl}/api/total-sales-details`, { headers }),
          axios.get(`${config.apiUrl}/api/admin/analytics`, { headers }),
        ]);
        setStats({ users: usersRes.data.length, products: productsRes.data.length, sales: salesRes.data.totalSales || 0 });
        setAnalytics(analyticsRes.data);
        setLowStock(productsRes.data.filter((product) => product.quantity <= (product.lowStockThreshold || 5)));
      } catch (error) { console.error("Error fetching dashboard stats:", error); }
    };
    fetchStats();
  }, []);

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };
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
    { text: "Auto-Restock PO", path: "/dashboard/inventory-manager", icon: <FaBox /> },
    { text: "Leaderboards", path: "/dashboard/leaderboard", icon: <FaCrown /> },
    { text: "Transactions Ledger", path: "/dashboard/transactions-ledger", icon: <FaReceipt /> },
  ];
  const isOverview = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  const sidebarContent = (
    <div className="h-full bg-slate-900 text-slate-300 flex flex-col">
      <div className="h-[76px] px-5 border-b border-slate-800 flex items-center gap-3">
        <img src={novaLogo} alt="SUELTO Logo" className="h-9 w-auto object-contain rounded-lg" />
        <div><p className="font-bold text-white text-sm">SUELTO Retail</p><p className="text-[11px] text-slate-500">Operations console</p></div>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold tracking-[.14em] uppercase text-slate-500">Workspace</p>
        {menuItems.map((item) => {
          const active = item.path === "/dashboard" ? isOverview : location.pathname === item.path;
          return <Link key={item.text} to={item.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-teal-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            <span className="w-4">{item.icon}</span>{item.text}
          </Link>;
        })}
        <p className="px-3 pt-7 pb-2 text-[10px] font-bold tracking-[.14em] uppercase text-slate-500">Operations</p>
        {operationsItems.map((item) => {
          const active = location.pathname === item.path;
          return <Link key={item.text} to={item.path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-teal-700 text-white shadow-sm" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}><span className="w-4">{item.icon}</span>{item.text}</Link>;
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-1"><Avatar src={admin?.image} sx={{ width: 34, height: 34 }}>{admin?.firstname?.[0]}</Avatar><div className="min-w-0"><p className="text-sm text-white font-medium truncate">{admin?.firstname} {admin?.lastname}</p><p className="text-[11px] text-slate-500">Store administrator</p></div></div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"><FaSignOutAlt /> Sign out</button>
        <p className="mt-3 px-3 text-[10px] text-slate-600">SUELTO POS · v1.0</p>
      </div>
    </div>
  );

  const chartData = analytics?.salesByDay || analytics?.dailySales || [];
  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50"><div className="text-center"><CircularProgress color="success" /><p className="mt-4 text-sm text-slate-500">Preparing your workspace…</p></div></div>;

  return <div className="min-h-screen bg-slate-50 flex font-sans">
    {isMobile ? <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ "& .MuiDrawer-paper": { width: drawerWidth, border: 0 } }}>{sidebarContent}</Drawer> : <aside className="fixed inset-y-0 left-0 w-[268px]">{sidebarContent}</aside>}
    <div className={`min-w-0 flex-1 ${isMobile ? "" : "ml-[268px]"}`}>
      <header className="sticky top-0 z-20 h-[76px] bg-white border-b border-slate-200 px-5 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center min-w-0 gap-3">{isMobile && <IconButton onClick={() => setMobileOpen(true)} aria-label="Open navigation"><IoMenu /></IconButton>}<div className="hidden sm:block"><p className="text-xs text-slate-500">Retail operations / {isOverview ? "Overview" : "Management"}</p><p className="font-bold text-slate-900">{isOverview ? "Store overview" : "Management workspace"}</p></div></div>
        <div className="hidden lg:flex items-center max-w-sm flex-1 mx-auto relative"><FaSearch className="absolute left-3 text-slate-400 text-xs"/><input aria-label="Global search" className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:bg-white focus:border-teal-700 outline-none focus:ring-1 focus:ring-teal-700" placeholder="Search products, transactions…"/></div>
        <div className="flex items-center gap-3"><div className="hidden md:flex items-center gap-2 text-right"><div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 grid place-items-center"><FaStore size={13}/></div><div><p className="text-xs font-semibold text-slate-700">Main Branch</p><p className="text-[10px] text-slate-500">Open · Today</p></div></div><button aria-label="Notifications" className="relative w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><FaBell className="mx-auto" size={14}/><span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"/></button><Avatar src={admin?.image} sx={{ width: 34, height: 34 }}>{admin?.firstname?.[0]}</Avatar></div>
      </header>
      <main className="max-w-[1440px] mx-auto p-5 md:p-8">
        {isOverview && <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4"><div><p className="text-sm text-slate-500">{new Date().toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Good day, {admin?.firstname}.</h1><p className="mt-1 text-sm text-slate-500">Here’s how your store is performing today.</p></div><Link to="/dashboard/product-list" className="self-start inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-605 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm">Manage catalog <FaChevronRight size={11}/></Link></div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[{label:"Total sales",value:peso.format(stats.sales),note:"All recorded revenue",icon:<FaChartLine/>,tone:"bg-teal-50 text-teal-700"},{label:"Catalog products",value:stats.products.toLocaleString(),note:"Available in catalog",icon:<FaBox/>,tone:"bg-sky-50 text-sky-600"},{label:"Cashier accounts",value:stats.users.toLocaleString(),note:"Active store users",icon:<FaUsers/>,tone:"bg-violet-50 text-violet-600"},{label:"Low stock alerts",value:lowStock.length.toLocaleString(),note:lowStock.length ? "Items need attention" : "Inventory levels healthy",icon:<FaExclamationTriangle/>,tone:"bg-amber-50 text-amber-600"}].map((card) => <div key={card.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"><div className="flex justify-between"><div><p className="text-sm font-medium text-slate-500">{card.label}</p><p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{card.value}</p></div><div className={`w-10 h-10 grid place-items-center rounded-lg ${card.tone}`}>{card.icon}</div></div><p className="mt-3 text-xs text-slate-500">{card.note}</p></div>)}
          </div>
          <div className="grid xl:grid-cols-3 gap-6"><section className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm"><div className="flex items-start justify-between mb-6"><div><h2 className="font-bold text-slate-900">Sales performance</h2><p className="text-sm text-slate-500 mt-1">Revenue activity over the selected period</p></div><span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">Live data</span></div><div className="h-[280px]">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0f766e" stopOpacity={.22}/><stop offset="100%" stopColor="#0f766e" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#e2e8f0"/><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#64748b"}}/><YAxis tickLine={false} axisLine={false} tick={{fontSize:11,fill:"#64748b"}}/><Tooltip/><Area type="monotone" dataKey="sales" stroke="#0f766e" strokeWidth={2} fill="url(#salesFill)"/></AreaChart></ResponsiveContainer> : <div className="h-full grid place-items-center text-center"><div><FaChartLine className="mx-auto text-slate-200 text-3xl"/><p className="mt-3 text-sm font-medium text-slate-600">Sales trend will appear here</p><p className="text-xs text-slate-400 mt-1">Complete transactions to populate analytics.</p></div></div>}</div></section><section className="bg-white border border-slate-200 rounded-xl shadow-sm"><div className="p-5 border-b border-slate-100"><h2 className="font-bold text-slate-900">Inventory attention</h2><p className="text-sm text-slate-500 mt-1">Products at or below their threshold</p></div><div className="divide-y divide-slate-100">{lowStock.length ? lowStock.slice(0,5).map((item) => <div key={item._id} className="px-5 py-3.5 flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 grid place-items-center"><FaBox size={13}/></div><div className="min-w-0 flex-1"><p className="font-medium text-sm text-slate-800 truncate">{item.name}</p><p className="text-xs text-slate-500">{item.category || "Uncategorized"}</p></div><span className="text-xs font-bold text-rose-600">{item.quantity} left</span></div>) : <div className="p-8 text-center"><div className="w-10 h-10 mx-auto grid place-items-center rounded-full bg-emerald-50 text-emerald-600">✓</div><p className="mt-3 text-sm font-medium text-slate-700">Inventory looks healthy</p><p className="mt-1 text-xs text-slate-500">No low-stock items right now.</p></div>}</div></section></div>
        </section>}
        <section className={isOverview ? "mt-7" : ""}><Routes><Route path="user-list" element={<UserList/>}/><Route path="product-list" element={<ProductList/>}/><Route path="total-sales" element={<TotalSales/>}/><Route path="admin-profile" element={<AdminProfile/>}/><Route path="shifts-log" element={<ShiftLog/>}/><Route path="coupon-manager" element={<CouponManager/>}/><Route path="receipt-customizer" element={<ReceiptCustomizer/>}/><Route path="inventory-manager" element={<InventoryManager/>}/><Route path="leaderboard" element={<Leaderboard/>}/><Route path="transactions-ledger" element={<TransactionsLedger/>}/></Routes></section>
      </main>
    </div>
  </div>;
}

export default Dashboard;
