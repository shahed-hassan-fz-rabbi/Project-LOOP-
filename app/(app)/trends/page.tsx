"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SentimentCounts {
  POS: number;
  NEU: number;
  NEG: number;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  totalCount: number;
  lastWeekCount: number;
  prevWeekCount: number;
  growth: number;
  sentimentCounts: SentimentCounts;
  isSpiking: boolean;
}

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POS" | "NEU" | "NEG";
  status: string;
  customerLabel?: string;
  createdAt: string;
  confidence?: number;
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

export default function TrendsPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [themeDetail, setThemeDetail] = useState<ThemeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch("/api/themes");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load themes");
          return;
        }

        setThemes(data.themes || []);
        if (data.themes && data.themes.length > 0) {
          setSelectedTheme(data.themes[0]);
        }
      } catch (err: unknown) {
        setError("Failed to load themes");
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  useEffect(() => {
    if (!selectedTheme) return;

    const fetchThemeDetail = async () => {
      try {
        const res = await fetch(`/api/themes/${selectedTheme.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load theme details");
          return;
        }

        setThemeDetail(data);
      } catch (err: unknown) {
        setError("Failed to load theme details");
      }
    };

    fetchThemeDetail();
  }, [selectedTheme]);

  const getGrowthColor = (growth: number) => {
    if (growth > 50) return "bg-red-100 text-red-800";
    if (growth > 0) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getPercentage = (count: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 font-medium">Loading trends...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Themes & Trends</h1>
      <p className="text-gray-600 mb-8">
        Monitor theme volume and emerging trends in customer feedback
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Theme List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">All Themes</h2>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {themes.length}
              </span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {themes.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No themes yet. Ingest feedback to generate themes.
                </div>
              ) : (
                themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition ${
                      selectedTheme?.id === theme.id ? "bg-blue-50/80 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: theme.color || "#3b82f6" }}
                        />
                        <h3 className="font-semibold text-gray-900 text-sm truncate max-w-[140px]">{theme.name}</h3>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {theme.totalCount}
                      </span>
                    </div>

                    {/* Growth indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      {theme.isSpiking && (
                        <span className="text-red-600 font-bold text-xs">🔴 SPIKING</span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${getGrowthColor(
                          theme.growth
                        )}`}
                      >
                        {theme.growth > 0 ? "+" : ""}
                        {theme.growth}%
                      </span>
                    </div>

                    {/* Sentiment mini-bars */}
                    <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{
                          width: `${getPercentage(theme.sentimentCounts.POS, theme.totalCount)}%`,
                        }}
                      />
                      <div
                        className="bg-gray-400"
                        style={{
                          width: `${getPercentage(theme.sentimentCounts.NEU, theme.totalCount)}%`,
                        }}
                      />
                      <div
                        className="bg-red-500"
                        style={{
                          width: `${getPercentage(theme.sentimentCounts.NEG, theme.totalCount)}%`,
                        }}
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Theme Detail */}
        <div className="lg:col-span-2">
          {selectedTheme ? (
            <div className="space-y-6">
              {/* Theme Stats */}
              <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedTheme.name}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {selectedTheme.description || "No description available"}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 shadow-sm"
                    style={{ backgroundColor: selectedTheme.color || "#3b82f6" }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Feedback</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {selectedTheme.totalCount}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {selectedTheme.lastWeekCount}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Growth Delta</p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        selectedTheme.growth > 0
                          ? "text-red-600"
                          : selectedTheme.growth < 0
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {selectedTheme.growth > 0 ? "+" : ""}
                      {selectedTheme.growth}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline Chart */}
              {themeDetail?.timeline && (
                <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                    Activity Timeline (Last 30 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={themeDetail.timeline}>
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
                        stroke={selectedTheme.color || "#3b82f6"}
                        dot={{ r: 2 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Sentiment Breakdown */}
              <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                  Sentiment Distribution
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-green-700">Positive</span>
                      <span className="text-gray-900">
                        {selectedTheme.sentimentCounts.POS} ({getPercentage(selectedTheme.sentimentCounts.POS, selectedTheme.totalCount)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${getPercentage(selectedTheme.sentimentCounts.POS, selectedTheme.totalCount)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">Neutral</span>
                      <span className="text-gray-900">
                        {selectedTheme.sentimentCounts.NEU} ({getPercentage(selectedTheme.sentimentCounts.NEU, selectedTheme.totalCount)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gray-400 h-2 rounded-full"
                        style={{
                          width: `${getPercentage(selectedTheme.sentimentCounts.NEU, selectedTheme.totalCount)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-red-700">Negative</span>
                      <span className="text-gray-900">
                        {selectedTheme.sentimentCounts.NEG} ({getPercentage(selectedTheme.sentimentCounts.NEG, selectedTheme.totalCount)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${getPercentage(selectedTheme.sentimentCounts.NEG, selectedTheme.totalCount)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Items */}
              {themeDetail?.feedback && (
                <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">
                    Associated Feedback ({themeDetail.feedback.length})
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {themeDetail.feedback.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-gray-600">
                            {item.channel}
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                              item.sentiment === "POS"
                                ? "bg-green-100 text-green-800"
                                : item.sentiment === "NEG"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.sentiment === "POS"
                              ? "Positive"
                              : item.sentiment === "NEG"
                              ? "Negative"
                              : "Neutral"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">{item.content}</p>
                        <p className="text-[11px] text-gray-400 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow border border-gray-100 p-12 text-center text-gray-500">
              <p>Select a theme from the left to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}