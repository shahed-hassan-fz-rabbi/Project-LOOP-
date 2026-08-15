"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalFeedback: number;
  negativePercent: number;
  newThisWeek: number;
}

interface Charts {
  volumeData: Array<{ date: string; count: number }>;
  sentimentData: Array<{ name: string; value: number; fill: string }>;
  topThemesData: Array<{ theme: string; count: number }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load analytics");
          return;
        }

        setStats(data.stats);
        setCharts(data.charts);
      } catch (err: any) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!stats || !charts) {
    return (
      <div className="p-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {session?.user?.name}! Here's your feedback overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Total Feedback */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600 uppercase font-semibold">
            Total Feedback
          </p>
          <p className="text-4xl font-bold mt-2">{stats.totalFeedback}</p>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        {/* Negative Percentage */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-sm text-gray-600 uppercase font-semibold">
            Negative Feedback
          </p>
          <p className="text-4xl font-bold mt-2">{stats.negativePercent}%</p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round(
              (stats.negativePercent / 100) * stats.totalFeedback
            )}{" "}
            items
          </p>
        </div>

        {/* New This Week */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-sm text-gray-600 uppercase font-semibold">
            New This Week
          </p>
          <p className="text-4xl font-bold mt-2">{stats.newThisWeek}</p>
          <p className="text-xs text-gray-500 mt-2">
            Last 7 days
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Chart 1: Feedback Volume Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Feedback Volume (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => {
                  const d = new Date(date);
                  return d.toLocaleDateString();
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Sentiment Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sentiment Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={charts.sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {charts.sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Top Themes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Top Themes</h2>
        {charts.topThemesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.topThemesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="theme" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No themes assigned yet
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Positive Feedback</p>
            <p className="text-2xl font-bold mt-1">
              {charts.sentimentData.find((s) => s.name === "Positive")?.value || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Neutral Feedback</p>
            <p className="text-2xl font-bold mt-1">
              {charts.sentimentData.find((s) => s.name === "Neutral")?.value || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Top Theme</p>
            <p className="text-2xl font-bold mt-1">
              {charts.topThemesData[0]?.theme || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Feedback/Day</p>
            <p className="text-2xl font-bold mt-1">
              {Math.round(stats.totalFeedback / 30)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}