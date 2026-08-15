"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
      } catch (err: unknown) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
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

  const maxThemeCount =
    charts.topThemesData.length > 0
      ? Math.max(...charts.topThemesData.map((t) => t.count), 1)
      : 1;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome, {session?.user?.name || "User"}! Here is your feedback overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Feedback */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 border-l-4 border-l-blue-600">
          <p className="text-xs text-gray-500 uppercase font-semibold">
            Total Feedback
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFeedback}</p>
          <p className="text-xs text-gray-400 mt-2">All time</p>
        </div>

        {/* Negative Percentage */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 border-l-4 border-l-red-600">
          <p className="text-xs text-gray-500 uppercase font-semibold">
            Negative Feedback
          </p>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.negativePercent}%</p>
          <p className="text-xs text-gray-400 mt-2">
            {Math.round((stats.negativePercent / 100) * stats.totalFeedback)} items
          </p>
        </div>

        {/* New This Week */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6 border-l-4 border-l-green-600">
          <p className="text-xs text-gray-500 uppercase font-semibold">
            New This Week
          </p>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.newThisWeek}</p>
          <p className="text-xs text-gray-400 mt-2">Last 7 days</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Feedback Volume Over Time */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Feedback Volume (30 Days)
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts.volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(date: string) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(date: any) => {
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

        {/* Sentiment Breakdown */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment Distribution
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts.sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {charts.sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {charts.sentimentData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-gray-600">
                  {item.name}: <strong>{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Themes with Progress Bars & Spike Indicators */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Themes</h2>
        {charts.topThemesData.length > 0 ? (
          <div className="space-y-4">
            {charts.topThemesData.map((theme, idx) => (
              <div
                key={idx}
                className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm text-gray-900">{theme.theme}</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                    {theme.count} items
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(theme.count / maxThemeCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8 text-sm">
            No themes assigned yet
          </p>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">Positive Feedback</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {charts.sentimentData.find((s) => s.name === "Positive")?.value || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">Neutral Feedback</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {charts.sentimentData.find((s) => s.name === "Neutral")?.value || 0}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">Top Theme</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 truncate">
              {charts.topThemesData[0]?.theme || "N/A"}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium">Avg Feedback/Day</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {Math.round(stats.totalFeedback / 30)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}