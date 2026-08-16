"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Calendar, ArrowRight, Loader2, Sparkles } from "lucide-react";

interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const [period, setPeriod] = useState("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [generatingTitle, setGeneratingTitle] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
      } else {
        setError(data.error || "Failed to load reports");
      }
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGenerating(true);

    try {
      let periodStart: Date;
      let periodEnd = new Date();

      if (period === "7days") {
        periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 7);
      } else if (period === "30days") {
        periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - 30);
      } else {
        if (!customStart || !customEnd) {
          setError("Please select both start and end dates");
          setGenerating(false);
          return;
        }
        periodStart = new Date(customStart);
        periodEnd = new Date(customEnd);
      }

      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          title: generatingTitle || `VoC Report (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()})`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate report");
        return;
      }

      await fetchReports();
      setShowGenerateForm(false);
      setGeneratingTitle("");
    } catch {
      setError("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-slate-500">Loading reports...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Voice-of-Customer Reports</h1>
          <p className="text-slate-500">
            Automated, executive-ready feedback intelligence reports powered by Claude
          </p>
        </div>
        <button
          onClick={() => setShowGenerateForm(!showGenerateForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Generate New Report
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Generate Form Modal / Box */}
      {showGenerateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold text-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Generate Executive VoC Synthesis</span>
          </div>

          <form onSubmit={handleGenerateReport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Report Title (Optional)
              </label>
              <input
                type="text"
                value={generatingTitle}
                onChange={(e) => setGeneratingTitle(e.target.value)}
                placeholder="e.g., Monthly Executive Feedback Summary"
                className="w-full px-3.5 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                Time Window
              </label>
              <div className="flex gap-4">
                {["7days", "30days", "custom"].map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      value={p}
                      checked={period === p}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize">{p === "7days" ? "Last 7 Days" : p === "30days" ? "Last 30 Days" : "Custom Window"}</span>
                  </label>
                ))}
              </div>
            </div>

            {period === "custom" && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generating ? "Synthesizing with Claude..." : "Run AI Report"}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-800">No reports generated yet.</p>
            <p className="text-sm text-slate-400 mt-1 mb-4">Run your first VoC report to get automated insights.</p>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Generate now →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition">
                      {report.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(report.periodStart).toLocaleDateString()} – {new Date(report.periodEnd).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Generated {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}