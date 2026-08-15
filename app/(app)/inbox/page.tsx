"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Upload, Sparkles, RefreshCw, Trash2 } from "lucide-react";

interface Feedback {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  status: string;
  createdAt: string;
  feedbackThemes?: Array<{ theme: { name: string } }>;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function InboxPage() {
  const { data: session } = useSession();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classifyingId, setClassifyingId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    channel: "Support Ticket",
    customerLabel: "",
  });

  const [csvFile, setCSVFile] = useState<File | null>(null);

  const [filters, setFilters] = useState({
    channel: "",
    sentiment: "",
    status: "",
    search: "",
  });

  const loadFeedback = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(filters.channel && { channel: filters.channel }),
        ...(filters.sentiment && { sentiment: filters.sentiment }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const res = await fetch(`/api/feedback?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load feedback");
        return;
      }

      setFeedback(data.feedback || []);
      setPagination(data.pagination);
    } catch (err: any) {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [filters]);

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add feedback");
        return;
      }

      setFormData({ content: "", channel: "Support Ticket", customerLabel: "" });
      setShowAddForm(false);
      loadFeedback();
    } catch (err: any) {
      setError("Failed to add feedback");
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    try {
      const body = new FormData();
      body.append("file", csvFile);

      const res = await fetch("/api/feedback/csv", {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Imported: ${data.imported}, Failed: ${data.failed}`);
        setCSVFile(null);
        loadFeedback();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Failed to upload CSV");
    }
  };

  const handleSimulate = async () => {
    try {
      const res = await fetch("/api/feedback/simulate", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`Imported ${data.created} items from simulated channel`);
        loadFeedback();
      }
    } catch (err) {
      setError("Failed to simulate feedback");
    }
  };

  const handleReClassify = async (id: string) => {
    setClassifyingId(id);
    try {
      const res = await fetch("/api/feedback/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId: id }),
      });

      const data = await res.json();
      if (res.ok) {
        loadFeedback(pagination.page);
      } else {
        alert(data.error || "Failed to classify");
      }
    } catch (err) {
      alert("Error re-classifying feedback");
    } finally {
      setClassifyingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadFeedback(pagination.page);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isViewer = (session?.user as any)?.role === "VIEWER";

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Feedback Inbox</h1>
          <p className="text-slate-500">Manage and analyze customer feedback from all channels</p>
        </div>

        {!isViewer && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition"
            >
              <Plus className="h-4 w-4" /> Add Feedback
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer font-medium text-sm transition">
              <Upload className="h-4 w-4" /> Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {csvFile && (
              <button
                onClick={handleCSVUpload}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg font-medium text-sm"
              >
                Upload {csvFile.name}
              </button>
            )}
            <button
              onClick={handleSimulate}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm transition"
            >
              <Sparkles className="h-4 w-4" /> Import Demo Tickets
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Add Feedback Form */}
      {showAddForm && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Add Single Feedback</h2>
          <form onSubmit={handleAddFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Feedback Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter customer quote or support message..."
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Channel</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900"
                >
                  <option>Support Ticket</option>
                  <option>App Store Review</option>
                  <option>NPS Survey</option>
                  <option>Sales Call Note</option>
                  <option>Community Post</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Customer Label</label>
                <input
                  type="text"
                  value={formData.customerLabel}
                  onChange={(e) => setFormData({ ...formData, customerLabel: e.target.value })}
                  placeholder="e.g. Enterprise Client"
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Save & Auto-Classify
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search feedback..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3.5 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <select
          value={filters.channel}
          onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
          className="px-3.5 py-2 border rounded-lg text-sm text-slate-900 bg-white"
        >
          <option value="">All Channels</option>
          <option>Support Ticket</option>
          <option>App Store Review</option>
          <option>NPS Survey</option>
          <option>Sales Call Note</option>
          <option>Community Post</option>
        </select>
        <select
          value={filters.sentiment}
          onChange={(e) => setFilters({ ...filters, sentiment: e.target.value })}
          className="px-3.5 py-2 border rounded-lg text-sm text-slate-900 bg-white"
        >
          <option value="">All Sentiments</option>
          <option value="POS">Positive</option>
          <option value="NEU">Neutral</option>
          <option value="NEG">Negative</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3.5 py-2 border rounded-lg text-sm text-slate-900 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="ACTIONED">Actioned</option>
        </select>
      </div>

      {/* Feedback Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-500">Loading inbox...</div>
      ) : feedback.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500">
          No feedback found. Try adding some or importing demo tickets!
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-4">Content</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Sentiment</th>
                <th className="p-4">Themes</th>
                <th className="p-4">Status</th>
                {!isViewer && <th className="p-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {feedback.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 max-w-sm">
                    <p className="font-medium text-slate-900 leading-snug line-clamp-2">{item.content}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{item.channel}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.sentiment === "POS"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.sentiment === "NEG"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.sentiment}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.feedbackThemes && item.feedbackThemes.length > 0 ? (
                        item.feedbackThemes.map((ft, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-indigo-50 text-indigo-700 font-medium">
                            {ft.theme.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={item.status}
                      disabled={isViewer}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="text-xs px-2.5 py-1 rounded-md font-semibold border border-slate-200 bg-white"
                    >
                      <option value="NEW">NEW</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="ACTIONED">ACTIONED</option>
                    </select>
                  </td>
                  {!isViewer && (
                    <td className="p-4 space-x-2">
                      <button
                        onClick={() => handleReClassify(item.id)}
                        disabled={classifyingId === item.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${classifyingId === item.id ? "animate-spin" : ""}`} />
                        Re-classify
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}