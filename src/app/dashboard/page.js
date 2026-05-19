"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ResponsiveMenu from "@/components/ResponsiveMenu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Lock, Unlock } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCollected: 0,
    totalDue: 0,
    transportFee: 0,
    examFee: 0,
  });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([
    { name: "Paid", value: 0 },
    { name: "Due", value: 0 },
  ]);
  const [studentsByClassData, setStudentsByClassData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [defaultersData, setDefaultersData] = useState([]);
  const [currentSession, setCurrentSession] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);
  
  // Password protection state
  const [isRevenueUnlocked, setIsRevenueUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passwordInput === "ranjuMa'am") {
      setIsRevenueUnlocked(true);
      toast.success("Revenue insights unlocked!");
    } else {
      toast.error("Incorrect password!");
      setPasswordInput("");
    }
  };

  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Fetch summary stats
    const fetchStats = async () => {
      const res = await fetch("/api/dashboard/summary", { 
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setStats(data);
      setPieData([
        { name: "Paid", value: data.totalCollected },
        { name: "Due", value: data.totalDue },
      ]);
    };

    // Fetch bar chart data (fee per class)
    const fetchBarData = async () => {
      const res = await fetch("/api/dashboard/fees-by-class", {
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setBarData(data);
    };

    // Fetch students per class
    const fetchStudentsByClassData = async () => {
      const res = await fetch("/api/dashboard/students-by-class", {
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setStudentsByClassData(data);
    };

    // Fetch top defaulters
    const fetchDefaultersData = async () => {
      const res = await fetch("/api/dashboard/defaulters", {
        cache: "no-store",
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if(data.status === 200) setDefaultersData(data.data);
    };

    fetchStats();
    fetchBarData();
    fetchStudentsByClassData();
    fetchDefaultersData();
    setCurrentSession(localStorage.getItem("currentSession") || "2026-2027");
  }, []);

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
        body: JSON.stringify({
          sourceSession: "2026-2027",
          targetSession: currentSession
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Failed: " + (data.message || data.error));
      }
    } catch (e) {
      toast.error("Error occurred while migrating.");
    } finally {
      setIsMigrating(false);
    }
  };

  const COLORS = ["#34D399", "#F87171"];
  
  // Generate a list of years for the dropdown (from 2024 to current year + 1)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: Math.max(currentYear - 2023 + 2, 3) }, (_, i) => 2024 + i);

  return (
    <>
    <ResponsiveMenu />
    <div className="min-h-screen p-4 bg-orange-50">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">
        School Fee Dashboard
      </h1>

      {/* Session Migration Prompt */}
      {currentSession !== "2026-2027" && stats.totalStudents === 0 && (
        <div className="bg-blue-100 hover:bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-5 mb-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center transition-colors">
          <div className="mb-4 md:mb-0">
            <h3 className="font-bold text-lg">New Session Detected ({currentSession})</h3>
            <p className="text-sm mt-1">It looks like the <b>{currentSession}</b> database is currently empty.</p>
            <p className="text-sm">Would you like to initialize this session by copying Students & Fees from 2026-2027?</p>
            <p className="text-xs mt-2 text-red-600 font-semibold italic">* Note: All dues, extra classes fees, and previous transactions will be completely reset to zero.</p>
          </div>
          <button 
            disabled={isMigrating}
            onClick={handleMigrate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg active:transform active:scale-95 transition whitespace-nowrap disabled:bg-blue-400"
          >
            {isMigrating ? "Migrating Data..." : "Initialize Data"}
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 text-center rounded-lg shadow-md flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-semibold text-orange-600">
            {stats.totalStudents}
          </p>
        </div>

        {isRevenueUnlocked ? (
          <>
            <div className="bg-white p-4 text-center rounded-lg shadow-md flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-semibold text-green-600">
                ₹{stats.totalCollected}
              </p>
            </div>
            <div className="bg-white p-4 text-center rounded-lg shadow-md flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Total Due</p>
              <p className="text-2xl font-semibold text-red-500">
                ₹{stats.totalDue}
              </p>
            </div>
            <div className="bg-white p-4 text-center rounded-lg shadow-md flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Transport Fee</p>
              <p className="text-2xl font-semibold text-blue-500">
                ₹{stats.transportFee}
              </p>
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md col-span-1 sm:col-span-1 md:col-span-3 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
            <Lock className="text-gray-400 mb-3" size={32} />
            <h3 className="text-gray-700 font-semibold mb-2">Revenue Data Locked</h3>
            <form onSubmit={handleUnlock} className="flex w-full max-w-sm gap-2">
              <input 
                type="password" 
                placeholder="Enter Password..." 
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition flex items-center gap-2">
                <Unlock size={16} /> Unlock
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Fee Collection Per Class
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="fee" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        {isRevenueUnlocked ? (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Paid vs Due
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner flex flex-col items-center justify-center min-h-[300px] border border-gray-200 opacity-60">
            <Lock className="text-gray-400 mb-2" size={48} />
            <p className="text-gray-500 font-medium">Unlock to view Paid vs Due chart</p>
          </div>
        )}
      </div>

      {/* New Row: Monthly Revenue & Top Defaulters */}
      {isRevenueUnlocked && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Monthly Revenue Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700 text-center sm:text-left mb-2 sm:mb-0">
                Monthly Revenue Flow
              </h2>
              <select
                value={revenueYear}
                onChange={(e) => setRevenueYear(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-700 bg-gray-50"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Defaulters List */}
          <div className="bg-white p-4 rounded-lg shadow-md overflow-hidden flex flex-col h-full lg:max-h-[380px]">
            <h2 className="text-lg font-bold text-red-600 mb-3 border-b pb-2 flex items-center justify-between">
              <span>🚨 Top Defaulters</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{defaultersData.length} Students</span>
            </h2>
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {defaultersData.length > 0 ? (
                <ul className="space-y-3">
                  {defaultersData.map((student, idx) => (
                    <li key={idx} className="bg-red-50 p-3 rounded-lg border border-red-100 flex justify-between items-center transition hover:bg-red-100">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{student.name}</p>
                        <p className="text-xs text-gray-500">Class: {student.className} | Ph: {student.contact}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">₹{student.totalDue}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No defaulters found!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students By Class Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Bar Chart for Students Per Class */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center md:text-left">
            Students Per Class
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentsByClassData}>
              <XAxis dataKey="className" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table representation */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-auto" style={{ maxHeight: "360px" }}>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Class Wise Student List
          </h2>
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-orange-100 text-orange-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-sm font-semibold rounded-tl-md">Class Name</th>
                <th className="px-4 py-2 text-sm font-semibold rounded-tr-md">Total Students</th>
              </tr>
            </thead>
            <tbody>
              {studentsByClassData.length > 0 ? (
                studentsByClassData.map((item, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{item.className}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{item.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="px-4 py-4 text-sm text-gray-500 text-center">
                    Loading data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    </>
    
  );
};

export default Dashboard;
