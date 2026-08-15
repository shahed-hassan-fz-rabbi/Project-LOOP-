"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, Shield, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleBulkClassify = async () => {
    setLoading(true);
    setStatusMessage("Running Claude AI classification...");

    try {
      const res = await fetch("/api/feedback/classify-all", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`✅ ${data.message}`);
      } else {
        setStatusMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      setStatusMessage("❌ Failed to trigger AI classification.");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
      <p className="text-slate-500 mb-8">Workspace configurations and AI automation controls</p>

      {statusMessage && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
          {statusMessage}
        </div>
      )}

      {/* AI Automation Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">AI Intelligence Automation</h2>
            <p className="text-sm text-slate-500">Run batch sentiment analysis & theme tagging with Claude</p>
          </div>
        </div>

        {isAdmin ? (
          <div>
            <p className="text-sm text-slate-600 mb-4">
              Trigger background classification for all unclassified feedback records in this workspace.
            </p>
            <button
              onClick={handleBulkClassify}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Processing with Claude..." : "🤖 Run Bulk AI Classification"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-amber-600">Only workspace Admins can execute batch AI classification.</p>
        )}
      </div>

      {/* Workspace Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Workspace Details</h2>
            <p className="text-sm text-slate-500">Multi-tenant isolation status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-100">
          <div>
            <p className="text-slate-500 font-medium">Tenant Name</p>
            <p className="text-slate-800 font-semibold mt-0.5">Demo Company</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Your Role</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mt-1">
              <Shield className="h-3 w-3" />
              {(session?.user as any)?.role || "User"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}