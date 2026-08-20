"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  ArrowRight,
  X,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  contentJson: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

interface ParsedReportContent {
  executiveSummary: string;
  reportType?: string;
  metrics: {
    totalFeedback: number;
    positiveRate: number;
    negativeRate: number;
    analyzedPeriod: string;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [reportType, setReportType] = useState("Weekly VoC Executive Brief");
  const [dateRange, setDateRange] = useState("30");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
        setError("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportType, dateRange }),
      });

      const data = await res.json();
      if (res.ok && data.report) {
        setIsGenerateModalOpen(false);
        router.push(`/reports/${data.report.id}`);
      } else {
        setError(data.error || "Failed to generate report");
      }
    } catch (err) {
      setError("An error occurred while generating report");
    } finally {
      setGenerating(false);
    }
  };

  const getParsedContent = (jsonStr: string): ParsedReportContent => {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return {
        executiveSummary: jsonStr || "Report summary unavailable.",
        metrics: { totalFeedback: 0, positiveRate: 0, negativeRate: 0, analyzedPeriod: "30 Days" },
      };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Voice-of-Customer Reports
            </h1>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
              Executive Briefs
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated, executive-ready intelligence dossiers synthesized from live customer feedback.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-60 bg-white rounded-3xl border border-sky-100 animate-pulse"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-sky-100 shadow-2xs flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-base font-bold text-slate-900">
              No reports generated yet
            </h3>
            <p className="text-xs text-slate-500">
              Run your first Voice-of-Customer report to aggregate sentiment patterns and executive action items.
            </p>
          </div>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition cursor-pointer"
          >
            Generate VoC Report →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const parsed = getParsedContent(report.contentJson);
            return (
              <div
                key={report.id}
                onClick={() => router.push(`/reports/${report.id}`)}
                className="p-6 bg-white rounded-3xl border border-sky-100/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between cursor-pointer group space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                      {parsed.reportType || "VoC Dossier"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-950 transition leading-snug">
                    {report.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {parsed.executiveSummary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-slate-700">
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{parsed.metrics?.totalFeedback || 0} entries</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {parsed.metrics?.positiveRate || 0}% pos
                    </span>
                  </div>

                  <span className="text-xs font-bold text-sky-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Generate VoC Report
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated executive intelligence synthesis
                </p>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition cursor-pointer"
                >
                  <option value="Weekly VoC Executive Brief">Weekly VoC Executive Brief</option>
                  <option value="Product Friction Deep Dive">Product Friction Deep Dive</option>
                  <option value="Monthly Customer Sentiment Summary">Monthly Customer Sentiment Summary</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Observation Window
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition cursor-pointer"
                >
                  <option value="7">Last 7 Days (Sprint Review)</option>
                  <option value="30">Last 30 Days (Monthly Overview)</option>
                  <option value="90">Last 90 Days (Quarterly Strategy)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {generating ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <span>Generate Report</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}