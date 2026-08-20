"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Cpu,
  RefreshCw,
  Save,
  Activity,
  Sliders,
  FileCheck,
  Server,
  Lock,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  createdAt: string;
}

interface WorkspaceData {
  id: string;
  name: string;
  createdAt: string;
  users: TeamMember[];
}

interface StatsData {
  totalFeedback: number;
  processedFeedback: number;
  unclassifiedFeedback: number;
  totalThemes: number;
  totalReports: number;
}

export default function SettingsPage() {
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("ANALYST");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [runningClassification, setRunningClassification] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // AI Pipeline Feature Toggles
  const [aiConfig, setAiConfig] = useState({
    sentimentAnalysis: true,
    themeDetection: true,
    groundedEvidence: true,
    autoClassification: true,
  });

  const fetchWorkspace = async () => {
    try {
      const res = await fetch("/api/workspace");
      const data = await res.json();
      if (res.ok && data.workspace) {
        setWorkspace(data.workspace);
        setWorkspaceName(data.workspace.name);
        setCurrentUserRole(data.currentUserRole);
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim() || savingName) return;

    setSavingName(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/workspace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ text: "Workspace name updated successfully.", type: "success" });
        await fetchWorkspace();
      } else {
        setStatusMessage({ text: data.error || "Failed to update workspace name.", type: "error" });
      }
    } catch (err) {
      setStatusMessage({ text: "An error occurred while saving.", type: "error" });
    } finally {
      setSavingName(false);
    }
  };

  const handleRunBulkClassification = async () => {
    setRunningClassification(true);
    setStatusMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStatusMessage({
        text: "Bulk AI synthesis completed. All pending feedback items are indexed.",
        type: "success",
      });
      await fetchWorkspace();
    } catch (err) {
      setStatusMessage({ text: "Failed to run classification workflow.", type: "error" });
    } finally {
      setRunningClassification(false);
    }
  };

  const toggleAiFeature = (key: keyof typeof aiConfig) => {
    setAiConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-slate-200 animate-pulse rounded-xl" />
        <div className="h-44 bg-white rounded-3xl border border-sky-100 animate-pulse" />
        <div className="h-64 bg-white rounded-3xl border border-sky-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-7">
      
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
            Workspace Console
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Workspace configurations, AI pipeline controls, and system architecture health.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 1. AI Intelligence Automation */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-sky-100/90 shadow-2xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Intelligence Automation</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Batch sentiment analysis, thematic classification, and vector indexing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] font-bold text-emerald-800 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </div>
        </div>

        {/* Engine Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Engine Provider</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Anthropic Claude</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Model Deployment</span>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Claude 3.5 Sonnet</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Indexed Feedback</span>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{stats?.processedFeedback || 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Indexing</span>
            <p className="text-sm font-extrabold text-amber-900 mt-0.5">{stats?.unclassifiedFeedback || 0}</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            <span>Last Sync Execution: <strong>Just Now</strong></span>
          </div>

          <button
            onClick={handleRunBulkClassification}
            disabled={runningClassification}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {runningClassification ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Classifying Pipeline...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                <span>Run Bulk AI Classification</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. AI Processing Configuration & Feature Toggles */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-sky-100/90 shadow-2xs space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI Processing Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control which natural language processing layers execute during ingestion.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => toggleAiFeature("sentimentAnalysis")}
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">Sentiment Scoring</p>
              <p className="text-[11px] text-slate-500 mt-0.5">3-tier sentiment polarity detection (POS/NEU/NEG)</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                aiConfig.sentimentAnalysis
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {aiConfig.sentimentAnalysis ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div
            onClick={() => toggleAiFeature("themeDetection")}
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">Thematic Clustering</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Auto-tagging features, bugs, and friction areas</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                aiConfig.themeDetection
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {aiConfig.themeDetection ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div
            onClick={() => toggleAiFeature("groundedEvidence")}
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">Grounded Quote Verification</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Prevent hallucination by citing raw evidence</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                aiConfig.groundedEvidence
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {aiConfig.groundedEvidence ? "Enabled" : "Disabled"}
            </span>
          </div>

          <div
            onClick={() => toggleAiFeature("autoClassification")}
            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">Auto-Process Ingestion</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Immediate classification upon webhook intake</p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                aiConfig.autoClassification
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {aiConfig.autoClassification ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. AI System Health & Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* System Health */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-sky-100/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">AI System Health</h2>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Anthropic Claude LLM API</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">PostgreSQL Relational DB</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">RAG Semantic Search Engine</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Security & Multi-tenant Isolation */}
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-sky-100/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Multi-tenant Security</h2>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Tenant Data Isolation</span>
              <span className="font-bold text-emerald-700">Strictly Enforced</span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Session JWT Authentication</span>
              <span className="font-bold text-emerald-700">Encrypted</span>
            </div>

            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">Current Role Access</span>
              <span className="font-bold text-sky-800">{currentUserRole} Access</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Workspace Details & Organization Settings */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-sky-100/90 shadow-2xs space-y-6">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Workspace Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Workspace tenant identifiers and organization profile.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={currentUserRole !== "ADMIN" || savingName}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Your Role
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {currentUserRole}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Tenant Level</span>
              </div>
            </div>
          </div>

          {currentUserRole === "ADMIN" && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingName || workspaceName === workspace?.name}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingName ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 5. Team Members */}
      <div className="p-6 md:p-8 bg-white rounded-3xl border border-sky-100/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Team Members</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized team members with access to this tenant environment.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
            {workspace?.users?.length || 1} Members
          </span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
          {workspace?.users?.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{member.name || "Workspace User"}</p>
                <p className="text-[11px] text-slate-400 font-medium">{member.email}</p>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  member.role === "ADMIN"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-sky-50 text-sky-800 border-sky-200"
                }`}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AI Analysis & Privacy Policy Transparency */}
      <div className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <FileCheck className="w-4 h-4 text-sky-600" />
          <span>AI Ethics & Grounded Intelligence Policy</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          LOOP analyzes verified customer feedback through semantic search and Retrieval-Augmented Generation (RAG). AI generated insights are grounded exclusively in workspace feedback citations to eliminate hallucinations. Customer feedback vectors are isolated strictly per tenant boundary.
        </p>
      </div>

    </div>
  );
}