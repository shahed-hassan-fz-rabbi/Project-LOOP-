"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Quote,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface ReportDetail {
  id: string;
  title: string;
  contentJson: string;
  periodStart: string;
  periodEnd: string;
  generatedBy?: string;
  createdAt: string;
}

interface ParsedReport {
  executiveSummary: string;
  reportType?: string;
  metrics: {
    totalFeedback: number;
    positiveRate: number;
    negativeRate: number;
    analyzedPeriod: string;
  };
  findings: Array<{
    title: string;
    description: string;
    quote: string;
    type: string;
  }>;
  recommendations: string[];
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (res.ok && data.reports) {
          const matched = data.reports.find((r: ReportDetail) => r.id === params.id);
          if (matched) {
            setReport(matched);
          } else {
            setError("Report not found");
          }
        }
      } catch (err) {
        setError("Failed to load report document");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadReport();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-96 bg-white rounded-3xl border border-sky-100 animate-pulse" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center justify-between">
          <span>{error || "Report document not found."}</span>
          <Link href="/reports" className="text-xs font-bold underline">
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  let parsed: ParsedReport;
  try {
    parsed = JSON.parse(report.contentJson);
  } catch (e) {
    parsed = {
      executiveSummary: report.contentJson || "Summary unavailable.",
      metrics: { totalFeedback: 0, positiveRate: 0, negativeRate: 0, analyzedPeriod: "30 Days" },
      findings: [],
      recommendations: [],
    };
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }

          html,
          body,
          body > div,
          body > div > div,
          main,
          section,
          article {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            overflow-y: visible !important;
            overflow-x: visible !important;
            background: #ffffff !important;
            color: #0f172a !important;
            display: block !important;
            position: static !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            overflow: visible !important;
            max-height: none !important;
          }

          aside,
          nav,
          header,
          button,
          .no-print,
          .print\\:hidden {
            display: none !important;
          }

          main {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .report-outer-wrapper {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }

          .printable-report-canvas {
            display: block !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .print-section {
            break-inside: auto !important;
            page-break-inside: auto !important;
            overflow: visible !important;
            height: auto !important;
          }

          .print-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            overflow: visible !important;
            height: auto !important;
          }

          h1, h2, h3 {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      <div className="report-outer-wrapper p-6 md:p-10 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between no-print print:hidden">
          <button
            onClick={() => router.push("/reports")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Reports</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        <div className="printable-report-canvas bg-white rounded-3xl border border-sky-100 shadow-sm p-8 md:p-12 space-y-8 print-section">
          <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 print-card">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                  Voice-of-Customer Intelligence
                </span>
                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Grounded Analysis
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {report.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Observation Period: {new Date(report.periodStart).toLocaleDateString()} – {new Date(report.periodEnd).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500 space-y-1 shrink-0 pt-1">
              <p><strong>Generated:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
              <p><strong>Engine:</strong> LOOP Automated Synthesis</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 print-card">
            <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Analyzed Intake</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{parsed.metrics?.totalFeedback || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Customer feedback entries</p>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Positive Sentiment</span>
              <p className="text-3xl font-extrabold text-emerald-800 mt-1">{parsed.metrics?.positiveRate || 0}%</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">High satisfaction drivers</p>
            </div>

            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Critical Friction</span>
              <p className="text-3xl font-extrabold text-rose-800 mt-1">{parsed.metrics?.negativeRate || 0}%</p>
              <p className="text-[11px] text-rose-700 mt-0.5">Reported friction/bugs</p>
            </div>
          </div>

          <div className="space-y-2.5 print-section">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Executive Synthesis Summary
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80 whitespace-pre-line font-medium print-card">
              {parsed.executiveSummary}
            </p>
          </div>

          {parsed.findings && parsed.findings.length > 0 && (
            <div className="space-y-4 print-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Critical Findings & Customer Evidence
              </h2>
              <div className="space-y-3.5 print-section">
                {parsed.findings.map((f, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border border-sky-100 bg-white shadow-2xs space-y-2.5 print-card"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{f.title}</h3>
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-100">
                        {f.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>
                    
                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 italic border border-slate-200/80 flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>"{f.quote}"</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {parsed.recommendations && parsed.recommendations.length > 0 && (
            <div className="space-y-3.5 print-section">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Strategic Product Roadmap Actions
              </h2>
              <div className="space-y-2.5 print-section">
                {parsed.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-start gap-3 text-xs text-slate-800 font-medium leading-relaxed print-card"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 print-card">
            <span>LOOP Voice-of-Customer Intelligence Platform</span>
            <span>Confidential Executive Product Brief</span>
          </div>
        </div>
      </div>
    </>
  );
}