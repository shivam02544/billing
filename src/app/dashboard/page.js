"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Lock, Unlock, GraduationCap, TrendingUp, AlertTriangle,
  Truck, Search, UserPlus, Receipt, FileText, RefreshCw,
  Phone, MessageCircle, X, ChevronRight, Megaphone,
  Calculator, CreditCard, Bell, ExternalLink, IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { useAppSettings } from "@/hooks/useAppSettings";

const COLORS = ["#34D399", "#F87171"];

/* ─── Skeleton card ───────────────────────────────── */
function StatSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-8 w-16 rounded" />
    </div>
  );
}

/* ─── Stat card ───────────────────────────────────── */
function StatCard({ label, value, icon: Icon, iconClass, valueClass, loading }) {
  if (loading) return <StatSkeleton />;
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 card-hover">
      <div className={`p-3 rounded-xl ${iconClass}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Defaulters Full Modal ───────────────────────── */
function DefaultersModal({ defaulters, onClose }) {
  const [search, setSearch] = useState("");

  const filtered = defaulters.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.className || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.contact || "").includes(search)
  );

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const makeWhatsApp = (contact, name, due) => {
    const msg = encodeURIComponent(
      `Dear Parent of ${name},\n\nYour child's school fee of ₹${due} is pending.\n\nPlease pay at the earliest.\n\nNew Progressive Public School, Nauroo, Jehanabad.`
    );
    return `https://wa.me/91${contact}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleIn">

        {/* Modal header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              🚨 All Defaulters
            </h2>
            <p className="text-red-100 text-xs mt-0.5">
              {defaulters.length} students with pending dues — click actions to notify parents
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, class or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-all"
            />
          </div>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No students match your search.</div>
          ) : (
            filtered.map((student, idx) => (
              <div
                key={idx}
                className="bg-red-50 border border-red-100 rounded-2xl p-4 hover:border-red-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(student.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                      <span className="bg-red-100 text-red-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                        ₹{student.totalDue?.toLocaleString()} due
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Class: <span className="font-semibold text-gray-700">{student.className}</span>
                      {student.fatherName && (
                        <> · Father: <span className="font-semibold text-gray-700">{student.fatherName}</span></>
                      )}
                      {student.contact && student.contact !== "N/A" && (
                        <> · <span className="font-semibold text-gray-700">{student.contact}</span></>
                      )}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {student.contact && student.contact !== "N/A" && (
                    <>
                      <a
                        href={`tel:${student.contact}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        <Phone size={12} /> Call
                      </a>
                      <a
                        href={makeWhatsApp(student.contact, student.name, student.totalDue)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    </>
                  )}
                  <Link
                    href={`/payBill`}
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Receipt size={12} /> Pay Bill
                  </Link>
                  <Link
                    href={`/searchStudent`}
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors border border-gray-200"
                  >
                    <Search size={12} /> Find Student
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing <span className="font-bold">{filtered.length}</span> of {defaulters.length} defaulters
          </p>
          <Link
            href="/announcement"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <Megaphone size={13} /> Send Bulk Announcement
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════ */
const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, totalCollected: 0, totalDue: 0, transportFee: 0, examFee: 0 });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([{ name: "Paid", value: 0 }, { name: "Due", value: 0 }]);
  const [studentsByClassData, setStudentsByClassData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [defaultersData, setDefaultersData] = useState([]);
  const [currentSession, setCurrentSession] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showDefaultersModal, setShowDefaultersModal] = useState(false);

  // Password protection state
  const [isRevenueUnlocked, setIsRevenueUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const { settings } = useAppSettings();

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_TOKEN || passwordInput === "ranjuMa'am") {
      setIsRevenueUnlocked(true);
      toast.success("Revenue insights unlocked!");
    } else {
      toast.error("Incorrect password!");
      setPasswordInput("");
    }
  };

  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [summaryRes, barRes, byClassRes, revenueRes, defaultersRes] = await Promise.all([
          fetch("/api/dashboard/summary",          { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/dashboard/fees-by-class",    { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/dashboard/students-by-class",{ cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/dashboard/revenue-by-month", { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
          fetch("/api/dashboard/defaulters",       { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        ]);

        const summary    = await summaryRes.json();
        const bar        = await barRes.json();
        const byClass    = await byClassRes.json();
        const revenue    = await revenueRes.json();
        const defaulters = await defaultersRes.json();

        setStats(summary);
        setPieData([{ name: "Paid", value: summary.totalCollected }, { name: "Due", value: summary.totalDue }]);
        setBarData(bar);
        setStudentsByClassData(byClass);
        if (revenue.status === 200)    setRevenueData(revenue.data);
        if (defaulters.status === 200) setDefaultersData(defaulters.data);
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    setCurrentSession(localStorage.getItem("currentSession") || "2026-2027");
  }, []);

  // Use the setting for auto-refresh
  useEffect(() => {
    if (!settings.autoRefreshDashboard || !settings.autoRefreshInterval) return;
    const interval = setInterval(() => {
      window.location.reload();
    }, settings.autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [settings.autoRefreshDashboard, settings.autoRefreshInterval]);

  useEffect(() => {
    // Fetch monthly revenue with selected year
    const fetchRevenueData = async () => {
      const res = await fetch(`/api/dashboard/revenue-by-month?year=${revenueYear}`, {
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if(data.status === 200) setRevenueData(data.data);
    };
    fetchRevenueData();
  }, [revenueYear]);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const res = await fetch("/api/session/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceSession: "2026-2027", targetSession: currentSession }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Failed: " + (data.message || data.error));
      }
    } catch {
      toast.error("Error occurred while migrating.");
    } finally {
      setIsMigrating(false);
    }
  };

  // Generate a list of years for the dropdown (from 2024 to current year + 1)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: Math.max(currentYear - 2023 + 2, 3) }, (_, i) => 2024 + i);

  return (
    <>
      {showDefaultersModal && (
        <DefaultersModal
          defaulters={defaultersData}
          onClose={() => setShowDefaultersModal(false)}
        />
      )}

      <ResponsiveMenu />
      <div className="min-h-screen bg-orange-50">

        {/* ── Page header ─────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">School Fee Dashboard</h1>
              <p className="text-orange-100 text-sm mt-0.5">
                Session: <span className="font-bold">{currentSession}</span>
                {lastUpdated && (
                  <span className="ml-3 text-orange-200 text-xs">
                    · Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20 self-start sm:self-auto"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

          {/* ── Session Migration Prompt ─────────── */}
          {currentSession !== "2026-2027" && stats.totalStudents === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slideUp">
              <div>
                <h3 className="font-bold text-blue-800 text-lg">🆕 New Session Detected ({currentSession})</h3>
                <p className="text-sm text-blue-700 mt-1">
                  The <b>{currentSession}</b> database is currently empty. Would you like to initialize it by copying Students & Fees from 2026-2027?
                </p>
                <p className="text-xs text-red-600 font-semibold mt-1.5 italic">
                  * All dues, extra class fees, and transactions will be reset to zero.
                </p>
              </div>
              <button
                disabled={isMigrating}
                onClick={handleMigrate}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition whitespace-nowrap disabled:bg-blue-400 flex items-center gap-2"
              >
                {isMigrating ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Migrating...</>
                ) : "Initialize Data"}
              </button>
            </div>
          )}

          {/* ── Quick Actions — Primary ───────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/searchStudent", label: "Search Students", icon: Search,    bg: "bg-blue-500"   },
              { href: "/addNewStudent", label: "Add Student",     icon: UserPlus,  bg: "bg-green-500"  },
              { href: "/payBill",       label: "Pay Bill",        icon: Receipt,   bg: "bg-orange-500" },
              { href: "/generateBill",  label: "Generate Bills",  icon: FileText,  bg: "bg-indigo-500" },
            ].map(({ href, label, icon: Icon, bg }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <span className={`${bg} p-2 rounded-lg shrink-0`}>
                  <Icon size={16} className="text-white" />
                </span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          {/* ── Quick Actions — Secondary ─────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ...(settings.enableAnnouncements ? [{ href: "/announcement",    label: "Announcement",   icon: Megaphone,   color: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-200" }] : []),
              ...(settings.enableAgeCalculator ? [{ href: "/age-calculator",  label: "Age Calculator",  icon: Calculator,  color: "text-indigo-500", bg: "bg-indigo-50",  border: "border-indigo-200" }] : []),
              { href: "/important-fees",  label: "Fee Structure",   icon: IndianRupee, color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200"  },
              ...(settings.enableExportData ? [{ href: "/export-data",     label: "Export Data",     icon: ExternalLink,color: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-200"   }] : []),
            ].map(({ href, label, icon: Icon, color, bg, border }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 ${bg} border ${border} rounded-xl px-3 py-2.5 hover:shadow-sm hover:-translate-y-0.5 transition-all group`}
              >
                <Icon size={15} className={color} />
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{label}</span>
                <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>

          {/* ── Summary Stats ────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Students"
              value={stats.totalStudents}
              icon={GraduationCap}
              iconClass="bg-orange-500"
              valueClass="text-orange-600"
              loading={loading}
            />
            {(!settings.requirePasswordForRevenue || isRevenueUnlocked) ? (
              <>
                <StatCard
                  label="Total Collected"
                  value={`₹${stats.totalCollected.toLocaleString()}`}
                  icon={TrendingUp}
                  iconClass="bg-green-500"
                  valueClass="text-green-600"
                  loading={loading}
                />
                <StatCard
                  label="Total Due"
                  value={`₹${stats.totalDue.toLocaleString()}`}
                  icon={AlertTriangle}
                  iconClass="bg-red-400"
                  valueClass="text-red-500"
                  loading={loading}
                />
                <StatCard
                  label="Transport Fee"
                  value={`₹${stats.transportFee.toLocaleString()}`}
                  icon={Truck}
                  iconClass="bg-blue-500"
                  valueClass="text-blue-600"
                  loading={loading}
                />
              </>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 col-span-1 sm:col-span-1 md:col-span-3 flex flex-col items-center justify-center gap-3">
                <Lock className="text-gray-300" size={30} />
                <p className="text-gray-600 font-semibold text-sm">Revenue Data Locked</p>
                <form onSubmit={handleUnlock} className="flex w-full max-w-xs gap-2">
                  <input
                    type="password"
                    placeholder="Enter password..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-semibold text-sm transition flex items-center gap-1.5"
                  >
                    <Unlock size={14} /> Unlock
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Defaulters Alert ── */}
          {settings.enableDefaultersAlert && !loading && defaultersData.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-slideUp">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <Bell size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-red-700">
                    {defaultersData.length} students have pending dues
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Total outstanding: ₹{defaultersData.reduce((sum, s) => sum + (s.totalDue || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <Link
                href="/defaulters"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 whitespace-nowrap shadow-sm"
              >
                <Phone size={14} /> View All & Notify Parents
              </Link>
            </div>
          )}

          {/* ── Charts Row 1 ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-700 mb-4">Fee Collection Per Class</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="fee" fill="#F97316" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {(!settings.requirePasswordForRevenue || isRevenueUnlocked) ? (
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-base font-bold text-gray-700 mb-4">Paid vs Due</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
                <Lock className="text-gray-300 mb-2" size={40} />
                <p className="text-gray-400 font-medium text-sm">Unlock to view Paid vs Due chart</p>
              </div>
            )}
          </div>

          {/* ── Revenue & Defaulters ─────────────── */}
          {(!settings.requirePasswordForRevenue || isRevenueUnlocked) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-700 mb-2 sm:mb-0">Monthly Revenue Flow</h2>
                  <select
                    value={revenueYear}
                    onChange={(e) => setRevenueYear(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm font-medium text-gray-700 bg-gray-50 transition"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueData}>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                    <Bar dataKey="revenue" fill="#10B981" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Defaulters panel */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-[380px]">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <h2 className="text-base font-bold text-red-600 flex items-center gap-1.5">
                    🚨 Top Defaulters
                  </h2>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                    {defaultersData.length} Students
                  </span>
                </div>
                <div className="overflow-y-auto flex-grow space-y-2 pr-1">
                  {defaultersData.length > 0 ? (
                    defaultersData.map((student, idx) => (
                      <div
                        key={idx}
                        className="bg-red-50 p-3 rounded-xl border border-red-100 flex justify-between items-center hover:bg-red-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{student.name}</p>
                          <p className="text-xs text-gray-500">
                            {student.className} · {student.contact}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="font-bold text-red-600 text-sm">₹{student.totalDue}</p>
                          {student.contact && student.contact !== "N/A" && (
                            <a
                              href={`tel:${student.contact}`}
                              className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5 font-semibold"
                            >
                              <Phone size={9} /> Call
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      No defaulters found!
                    </div>
                  )}
                </div>
                {/* View All button */}
                {defaultersData.length > 0 && (
                  <Link
                    href="/defaulters"
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
                  >
                    <Phone size={13} /> View All & Notify Parents
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ── Students by Class ────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-700 mb-4">Students Per Class</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={studentsByClassData}>
                  <XAxis dataKey="className" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ maxHeight: "360px" }}>
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-700">Class-wise Student Count</h2>
              </div>
              <div className="overflow-y-auto flex-grow">
                <table className="min-w-full text-left">
                  <thead className="bg-orange-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-2.5 text-xs font-bold text-orange-700 uppercase tracking-wide">Class</th>
                      <th className="px-5 py-2.5 text-xs font-bold text-orange-700 uppercase tracking-wide">Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsByClassData.length > 0 ? (
                      studentsByClassData.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-orange-50 transition-colors">
                          <td className="px-5 py-3 text-sm text-gray-700 font-medium">{item.className}</td>
                          <td className="px-5 py-3">
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {item.count}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="px-5 py-8 text-sm text-gray-400 text-center">
                          <div className="skeleton h-4 w-32 mx-auto mb-2 rounded" />
                          <div className="skeleton h-4 w-24 mx-auto rounded" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;
