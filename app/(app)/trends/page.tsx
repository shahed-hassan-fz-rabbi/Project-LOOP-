"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Flame,
  ArrowRight,
} from "lucide-react";

interface SentimentCounts {
  POS?: number;
  NEU?: number;
  NEG?: number;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  totalCount: number;
  lastWeekCount?: number;
  prevWeekCount?: number;
  growth?: number;
  sentimentCounts?: SentimentCounts;
  isSpiking?: boolean;
}

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POS" | "NEU" | "NEG";
  status: string;
  customerLabel?: string;
  createdAt: string;
}

interface TimelineEntry {
  date: string;
  count: number;
}

interface ThemeDetailResponse {
  theme: {
    id: string;
    name: string;
    description: string;
    color: string;
    totalCount: number;
  };
  feedback: FeedbackItem[];
  timeline: TimelineEntry[];
}

const PERIOD_OPTIONS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
];

export default function TrendsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [comparativeTimeline, setComparativeTimeline] = useState<any[]>([]);
  const [topThemeNames, setTopThemeNames] = useState<Array<{ name: string; color: string }>>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [themeDetail, setThemeDetail] = useState<ThemeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchThemes = async (days: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/themes?days=${days}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load themes");
        return;
      }

      setThemes(data.themes || []);
      setComparativeTimeline(data.comparativeTimeline || []);
      setTopThemeNames(data.topThemeNames || []);

      if (data.themes && data.themes.length > 0) {
        setSelectedTheme((prev) => {
          if (!prev) return data.themes[0];
          const exists = data.themes.find((t: Theme) => t.id === prev.id);
          return exists || data.themes[0];
        });
      }
    } catch (err) {
      setError("Failed to load themes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    if (!selectedTheme) return;

    const fetchThemeDetail = async () => {
      setDetailLoading(true);
      try {
        const res = await fetch(`/api/themes/${selectedTheme.id}`);
        const data = await res.json();

        if (res.ok) {
          setThemeDetail(data);
        }
      } catch (err) {
        console.error("Failed to load theme detail", err);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchThemeDetail();
  }, [selectedTheme]);

  const handleInvestigateSpike = () => {
    const spikingThemes = themes.filter((t) => t.isSpiking);
    if (spikingThemes.length > 0) {
      setSelectedTheme(spikingThemes[0]);
    }
    const drilldownElement = document.getElementById("theme-drilldown-section");
    if (drilldownElement) {
      drilldownElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPercentage = (count: number = 0, total: number = 0) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  if (loading && themes.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-white rounded-2xl border border-sky-100 animate-pulse" />
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-sky-100 animate-pulse" />
        </div>
      </div>
    );
  }

  const spikingThemes = themes.filter((t) => t.isSpiking);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Themes & Velocity Trends</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor feedback cluster volume, anomaly spikes, and customer drill-down evidence.
          </p>
        </div>

        {/* Soft Blue / Light Emerald Period Filter */}
        <div className="inline-flex p-1 rounded-xl bg-white border border-sky-100 shadow-2xs self-start md:self-auto">
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
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Spike Alert Banner */}
      {spikingThemes.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/90 via-white to-rose-50/70 border border-rose-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-950">
                Anomaly Detected ({spikingThemes.length} Spiking Issues)
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                {spikingThemes.map((t) => `${t.name} (↑ ${t.growth}%)`).join(", ")} exceeded normal velocity thresholds.
              </p>
            </div>
          </div>
          <button
            onClick={handleInvestigateSpike}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 text-xs font-bold hover:bg-rose-100/70 transition-all active:scale-95 shadow-2xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Investigate Spike</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Multi-Theme Comparative Volume Chart */}
      {comparativeTimeline.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-sky-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Comparative Theme Trajectory ({selectedPeriod} Days)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Multi-line velocity comparison across top issue categories</p>
            </div>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
              Multi-Theme
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparativeTimeline}>
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
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                {topThemeNames.map((t, idx) => {
                  const palette = ["#0284c7", "#10b981", "#f97316", "#8b5cf6"];
                  const strokeColor = t.color || palette[idx % palette.length];
                  return (
                    <Line
                      key={t.name}
                      type="monotone"
                      dataKey={t.name}
                      stroke={strokeColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two-Column Theme Drill-down Section */}
      <div id="theme-drilldown-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-6">
        
        {/* Left Column: All Themes List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              All Themes ({themes.length})
            </span>
            <span className="text-xs text-slate-400">Ranked by volume</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {themes.map((theme) => {
              const isSelected = selectedTheme?.id === theme.id;
              const posCount = theme.sentimentCounts?.POS || 0;
              const neuCount = theme.sentimentCounts?.NEU || 0;
              const negCount = theme.sentimentCounts?.NEG || 0;
              const growthVal = theme.growth ?? 0;

              return (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex flex-col gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-white border-sky-500 shadow-md ring-2 ring-sky-500/10"
                      : "bg-white border-sky-100 hover:border-sky-200 shadow-2xs hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.color || "#0284c7" }}
                      />
                      <h3 className="font-bold text-slate-900 text-sm truncate max-w-[170px]">
                        {theme.name}
                      </h3>
                    </div>

                    <span className="text-xs font-bold text-sky-800 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-100">
                      {theme.totalCount}
                    </span>
                  </div>

                  {/* Growth & Spike Tag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {theme.isSpiking && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" /> Spike
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                          growthVal > 0
                            ? "text-rose-600"
                            : growthVal < 0
                            ? "text-emerald-600"
                            : "text-slate-500"
                        }`}
                      >
                        {growthVal > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : growthVal < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        {growthVal > 0 ? "+" : ""}
                        {growthVal}% vs prev
                      </span>
                    </div>
                  </div>

                  {/* Sentiment Mini Bar */}
                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 rounded-full"
                      style={{
                        width: `${getPercentage(posCount, theme.totalCount)}%`,
                      }}
                    />
                    <div
                      className="bg-slate-400 rounded-full"
                      style={{
                        width: `${getPercentage(neuCount, theme.totalCount)}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 rounded-full"
                      style={{
                        width: `${getPercentage(negCount, theme.totalCount)}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Theme Drill-Down Details */}
        <div className="lg:col-span-8">
          {selectedTheme ? (
            <div className="space-y-6">
              
              {/* Selected Theme Overview Card */}
              <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedTheme.name}
                      </h2>
                      {selectedTheme.isSpiking && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                          High Velocity Anomaly
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedTheme.description || "Category overview and customer quote breakdown"}
                    </p>
                  </div>

                  <span
                    className="w-4 h-4 rounded-full shrink-0 ring-4 ring-sky-50"
                    style={{ backgroundColor: selectedTheme.color || "#0284c7" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                  <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-100">
                    <p className="text-[10px] font-bold text-sky-700 uppercase">Period Volume</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      {selectedTheme.totalCount}
                    </p>
                  </div>
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">This Week</p>
                    <p className="text-2xl font-extrabold text-emerald-800 mt-1">
                      {selectedTheme.lastWeekCount ?? 0}
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Growth Delta</p>
                    <p
                      className={`text-2xl font-extrabold mt-1 ${
                        (selectedTheme.growth ?? 0) > 0
                          ? "text-rose-600"
                          : (selectedTheme.growth ?? 0) < 0
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {(selectedTheme.growth ?? 0) > 0 ? "+" : ""}
                      {selectedTheme.growth ?? 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Single Theme 30-Day Activity Timeline */}
              {themeDetail?.timeline && (
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {selectedTheme.name} Frequency Timeline
                    </h3>
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                      30-Day Trend
                    </span>
                  </div>

                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={themeDetail.timeline}>
                        <defs>
                          <linearGradient id="themeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={selectedTheme.color || "#0284c7"}
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor={selectedTheme.color || "#0284c7"}
                              stopOpacity={0}
                            />
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
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                          labelFormatter={(date: any) => new Date(date).toLocaleDateString()}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke={selectedTheme.color || "#0284c7"}
                          strokeWidth={2}
                          fill="url(#themeAreaGrad)"
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Sentiment Breakdown */}
              <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sentiment Distribution
                </h3>
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-emerald-700">Positive</span>
                      <span className="text-slate-800">
                        {selectedTheme.sentimentCounts?.POS || 0} (
                        {getPercentage(selectedTheme.sentimentCounts?.POS, selectedTheme.totalCount)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full"
                        style={{
                          width: `${getPercentage(selectedTheme.sentimentCounts?.POS, selectedTheme.totalCount)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-600">Neutral</span>
                      <span className="text-slate-800">
                        {selectedTheme.sentimentCounts?.NEU || 0} (
                        {getPercentage(selectedTheme.sentimentCounts?.NEU, selectedTheme.totalCount)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-slate-400 h-1.5 rounded-full"
                        style={{
                          width: `${getPercentage(selectedTheme.sentimentCounts?.NEU, selectedTheme.totalCount)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-rose-600">Negative</span>
                      <span className="text-slate-800">
                        {selectedTheme.sentimentCounts?.NEG || 0} (
                        {getPercentage(selectedTheme.sentimentCounts?.NEG, selectedTheme.totalCount)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full"
                        style={{
                          width: `${getPercentage(selectedTheme.sentimentCounts?.NEG, selectedTheme.totalCount)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Customer Feedback Quotes Evidence List */}
              <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Associated Feedback Quotes ({themeDetail?.feedback?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">Ground truth evidence</span>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {detailLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Loading quotes...
                    </div>
                  ) : themeDetail?.feedback && themeDetail.feedback.length > 0 ? (
                    themeDetail.feedback.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-100 bg-sky-50/20 hover:bg-sky-50/50 transition space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-slate-600">
                            {item.channel}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              item.sentiment === "POS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : item.sentiment === "NEG"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {item.sentiment === "POS"
                              ? "Positive"
                              : item.sentiment === "NEG"
                              ? "Negative"
                              : "Neutral"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                          "{item.content}"
                        </p>
                        <p className="text-[11px] text-slate-400 pt-0.5">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No direct feedback linked to this theme.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[400px] p-8 flex flex-col items-center justify-center bg-white rounded-2xl border border-sky-100 text-slate-400 text-xs">
              <Layers className="w-8 h-8 text-slate-300 mb-2" />
              <span>Select a theme from the left to view details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}