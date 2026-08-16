"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, MessageSquareQuote, TrendingUp, TrendingDown } from "lucide-react";

interface ReportContent {
  narrative: string;
  statistics: {
    totalFeedback: number;
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
    channels: Record<string, number>;
    topThemes: Record<string, number>;
    topQuotes: string[];
  };
  sentimentShift: number;
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [content, setContent] = useState<ReportContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const id = params?.id;
        if (!id) return;

        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();

        if (res.ok) {
          setReport(data.report);
          setContent(data.content);
        } else {
          setError(data.error || "Report not found");
        }
      } catch {
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params]);

  if (loading) {
    return <div className="p-16 text-center text-slate-500">Loading VoC report...</div>;
  }

  if (error || !report || !content) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
          {error || "Report not found"}
        </div>
      </div>
    );
  }

  const maxThemeCount = Math.max(...Object.values(content.statistics.topThemes || {}), 1);
  const maxChannelCount = Math.max(...Object.values(content.statistics.channels || {}), 1);

  return (
    <div className="p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen print:p-0 print:m-0 print:max-w-full print:bg-white">
      {/* Action Header - Hidden on Print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => router.push("/reports")}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition shadow-sm"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Main Report Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8 print:border-none print:shadow-none print:p-0 print:mb-6">
        <div className="border-b border-slate-100 pb-6 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded print:border print:border-blue-200">
            Voice of Customer Report
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mt-3">{report.title}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Window: {new Date(report.periodStart).toLocaleDateString()} to {new Date(report.periodEnd).toLocaleDateString()}
          </p>
        </div>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-8 print:bg-slate-50 print:border print:border-slate-200">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Submissions</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{content.statistics.totalFeedback}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Positive Share</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {Math.round((content.statistics.sentimentBreakdown.positive / content.statistics.totalFeedback) * 100)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Negative Share</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">
              {Math.round((content.statistics.sentimentBreakdown.negative / content.statistics.totalFeedback) * 100)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Negative Shift</p>
            <p className={`text-2xl font-bold mt-1 flex items-center gap-1 ${content.sentimentShift > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {content.sentimentShift > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {content.sentimentShift > 0 ? `+${content.sentimentShift}%` : `${content.sentimentShift}%`}
            </p>
          </div>
        </div>

        {/* AI Narrative Section */}
        <div className="prose prose-slate max-w-none space-y-4 text-sm leading-relaxed text-slate-800">
          {content.narrative.split("\n\n").map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:grid-cols-2">
        {/* Top Themes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:border print:border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Top Feedback Themes</h2>
          <div className="space-y-3">
            {Object.entries(content.statistics.topThemes)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([theme, count]) => (
                <div key={theme}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{theme}</span>
                    <span>{count} mentions</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / maxThemeCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Channel Ingestion Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:border print:border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">Feedback Channels</h2>
          <div className="space-y-3">
            {Object.entries(content.statistics.channels)
              .sort((a, b) => b[1] - a[1])
              .map(([channel, count]) => (
                <div key={channel}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{channel}</span>
                    <span>{count} items</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${(count / maxChannelCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Notable Quotes */}
      {content.statistics.topQuotes && content.statistics.topQuotes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 print:border print:border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
            <MessageSquareQuote className="h-4 w-4 text-blue-600" /> Grounded Customer Voice Quotes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2">
            {content.statistics.topQuotes.map((quote, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs italic text-slate-700">
                "{quote}"
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global CSS to completely remove sidebar during print */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1.2cm;
          }
          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }
          aside, nav, header, .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
          }
          main, div {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}