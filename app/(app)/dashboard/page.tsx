"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Inbox,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Layers,
  ChevronRight,
  Plus,
  Calendar,
  Sparkles,
} from "lucide-react";

interface Stats {
  totalFeedback: number;
  negativePercent: number;
  newThisWeek: number;
  periodDays: number;
}

interface Charts {
  volumeData: Array<{ date: string; count: number }>;
  sentimentData: Array<{ name: string; value: number; fill: string }>;
  topThemesData: Array<{ theme: string; count: number; trend: string; isSpike: boolean }>;
}

const PERIOD_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
  { label: "365 Days", value: 365 },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [charts, setCharts] = useState<Charts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async (days: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load analytics");
        return;
      }

      setStats(data.stats);
      setCharts(data.charts);
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  if (loading && !stats) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-28 bg-white rounded-2xl border border-sky-100 animate-pulse" />
          <div className="h-28 bg-white rounded-2xl border border-sky-100 animate-pulse" />
          <div className="h-28 bg-white rounded-2xl border border-sky-100 animate-pulse" />
          <div className="h-28 bg-white rounded-2xl border border-sky-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !stats || !charts) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm">
          {error || "Failed to load dashboard data."}
        </div>
      </div>
    );
  }

  const maxThemeCount =
    charts.topThemesData.length > 0
      ? Math.max(...charts.topThemesData.map((t) => t.count), 1)
      : 1;

  const topIssue = charts.topThemesData[0]?.theme || "Onboarding";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, {session?.user?.name || "Admin"}. Live overview across all feedback channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Period Selector (Soft Sky Theme) */}
          <div className="inline-flex p-1 rounded-xl bg-white border border-sky-100 shadow-2xs">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedPeriod(opt.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedPeriod === opt.value
                    ? "bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-sky-50/60"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Ingest Button (Sky & Emerald Gradient) */}
          <Link
            href="/inbox"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Feedback</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards Grid (Light Blue & Green Accents) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Total Volume</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalFeedback}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All-time records</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Negative Ratio</span>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.negativePercent}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{selectedPeriod}d window</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Weekly Intake</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.newThisWeek}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Last 7 rolling days</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Daily Velocity</span>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">
              {(stats.totalFeedback / selectedPeriod).toFixed(1)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Avg entries/day</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback Volume */}
        <div className="p-6 bg-white rounded-2xl border border-sky-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Volume Analysis ({selectedPeriod} Days)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily time-series ingestion rate</p>
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
              Timeseries
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.volumeData}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(date: string) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  labelFormatter={(date: any) => new Date(date).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#volGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="p-6 bg-white rounded-2xl border border-sky-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sentiment Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated NLP sentiment distribution</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Classification
            </span>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
            {charts.sentimentData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span>
                  {item.name}: <strong>{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Customer Themes (Sky-to-Emerald Gradient Bars) */}
      <div className="p-6 bg-white rounded-2xl border border-sky-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Theme Distribution & Trajectory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Volume breakdown across major customer themes</p>
          </div>
          <Link href="/trends" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            <span>View detailed trends</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {charts.topThemesData.length > 0 ? (
          <div className="space-y-4">
            {charts.topThemesData.map((theme, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800">{theme.theme}</span>
                    <span className="text-slate-400 font-normal">({theme.count} items)</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    {theme.trend.startsWith("+") ? (
                      <span className="text-rose-600 font-bold flex items-center gap-0.5 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        <TrendingUp className="w-3 h-3" /> {theme.trend}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <TrendingDown className="w-3 h-3" /> {theme.trend}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(theme.count / maxThemeCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No themes assigned for this time range.
          </div>
        )}
      </div>

      {/* Strategic Executive Summary Card (Light Blue & Green Gradient Banner) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-emerald-50/80 border border-sky-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Executive Synthesis
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Automated Brief
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              <strong className="text-slate-800">{topIssue}</strong> represents the highest volume driver, experiencing a {charts.topThemesData[0]?.trend || "+20%"} variation across this {selectedPeriod}-day observation window.
            </p>
          </div>
        </div>

        <Link
          href="/ask"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
        >
          <span>Deep Dive Query</span>
          <ChevronRight className="w-3.5 h-3.5 text-sky-500" />
        </Link>
      </div>

    </div>
  );
}