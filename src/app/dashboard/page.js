"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Fetch summary stats
    const fetchStats = async () => {
      const res = await fetch("/api/dashboard/summary");
      const data = await res.json();
      setStats(data);
      setPieData([
        { name: "Paid", value: data.totalCollected },
        { name: "Due", value: data.totalDue },
      ]);
    };

    // Fetch bar chart data (fee per class)
    const fetchBarData = async () => {
      const res = await fetch("/api/dashboard/fees-by-class");
      const data = await res.json();
      setBarData(data);
    };

    fetchStats();
    fetchBarData();
  }, []);

  const COLORS = ["#34D399", "#F87171"];

  return (
    <div className="min-h-screen p-4 bg-orange-50">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-6">
        School Fee Dashboard
      </h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 text-center rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Total Students</p>
          <p className="text-2xl font-semibold text-orange-600">
            {stats.totalStudents}
          </p>
        </div>
        <div className="bg-white p-4 text-center rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Total Collected</p>
          <p className="text-2xl font-semibold text-green-600">
            ₹{stats.totalCollected}
          </p>
        </div>
        <div className="bg-white p-4 text-center rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Total Due</p>
          <p className="text-2xl font-semibold text-red-500">
            ₹{stats.totalDue}
          </p>
        </div>
        <div className="bg-white p-4 text-center rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Transport Fee</p>
          <p className="text-2xl font-semibold text-blue-500">
            ₹{stats.transportFee}
          </p>
        </div>
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
      </div>
    </div>
  );
};

export default Dashboard;
