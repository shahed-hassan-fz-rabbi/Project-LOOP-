"use client";

import React, { useState, useEffect } from "react";
import {
  Inbox,
  Search,
  Plus,
  X,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
} from "lucide-react";

interface FeedbackTheme {
  theme: {
    id: string;
    name: string;
    color: string;
  };
}

interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POS" | "NEU" | "NEG";
  sentimentScore: number;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  customerLabel?: string;
  createdAt: string;
  feedbackThemes?: FeedbackTheme[];
}

const CHANNELS = [
  "All Channels",
  "Support Ticket",
  "App Store Review",
  "Community Post",
  "NPS Survey",
  "Sales Call Note",
  "Testimonial",
  "Feature Request",
];
const SENTIMENTS = ["All Sentiments", "POS", "NEU", "NEG"];
const STATUSES = ["All Statuses", "NEW", "REVIEWED", "ACTIONED"];

export default function InboxPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("All Channels");
  const [sentiment, setSentiment] = useState("All Sentiments");
  const [status, setStatus] = useState("All Statuses");

  // Add Feedback Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newChannel, setNewChannel] = useState("Support Ticket");
  const [newSentiment, setNewSentiment] = useState<"POS" | "NEU" | "NEG">("NEU");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal / Slide-over State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (channel !== "All Channels") params.append("channel", channel);
      if (sentiment !== "All Sentiments") params.append("sentiment", sentiment);
      if (status !== "All Statuses") params.append("status", status);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load feedback");
        return;
      }

      setFeedbacks(data.feedbacks || []);
      setError("");
    } catch (err) {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedbacks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, channel, sentiment, status]);

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          channel: newChannel,
          sentiment: newSentiment,
          customerLabel: "Manual User",
        }),
      });

      if (res.ok) {
        setNewContent("");
        setIsAddModalOpen(false);
        fetchFeedbacks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Feedback Inbox
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, inspect, and drill down into voice-of-customer messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Feedback</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedback text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition"
          />
        </div>

        <div>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition cursor-pointer"
          >
            {CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition cursor-pointer"
          >
            {SENTIMENTS.map((st) => (
              <option key={st} value={st}>
                {st === "POS"
                  ? "Positive"
                  : st === "NEG"
                  ? "Negative"
                  : st === "NEU"
                  ? "Neutral"
                  : st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition cursor-pointer"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Records ({feedbacks.length})
          </span>
          <span className="text-xs text-slate-400">Click any card to read full details</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-2xl border border-sky-100 animate-pulse"
              />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-sky-100 text-slate-400 text-xs flex flex-col items-center justify-center">
            <Inbox className="w-8 h-8 text-slate-300 mb-2" />
            <span>No matching feedback records found for this filter.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedFeedback(item)}
                className="p-5 bg-white rounded-2xl border border-sky-100/90 shadow-2xs hover:shadow-xs hover:border-sky-300 hover:ring-2 hover:ring-sky-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left: Content & Meta */}
                <div className="space-y-2 max-w-3xl">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed group-hover:text-sky-950 transition">
                    "{item.content}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">
                      {item.customerLabel || "Anonymous"}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{item.channel}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>

                    {/* Theme Badges */}
                    {item.feedbackThemes && item.feedbackThemes.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          {item.feedbackThemes.map((ft, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-100 font-semibold text-[10px]"
                            >
                              {ft.theme.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Badges & Action */}
                <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                      item.sentiment === "POS"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : item.sentiment === "NEG"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {item.sentiment === "POS"
                      ? "Positive"
                      : item.sentiment === "NEG"
                      ? "Negative"
                      : "Neutral"}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                      item.status === "ACTIONED"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : item.status === "REVIEWED"
                        ? "bg-emerald-50/60 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {item.status}
                  </span>

                  <div className="p-1 rounded-lg text-slate-300 group-hover:text-sky-600 transition">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Slide-Over / Full Read Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-2xl w-full p-7 space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                  Feedback Intelligence Details
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Voice of Customer Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full Message Quote */}
            <div className="p-5 rounded-2xl bg-sky-50/30 border border-sky-100/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Full Message Text
              </span>
              <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                "{selectedFeedback.content}"
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Customer</span>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                  {selectedFeedback.customerLabel || "Direct User"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Channel</span>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                  {selectedFeedback.channel}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Sentiment</span>
                <p className={`text-xs font-bold mt-1 ${
                  selectedFeedback.sentiment === "POS" ? "text-emerald-600" : selectedFeedback.sentiment === "NEG" ? "text-rose-600" : "text-slate-700"
                }`}>
                  {selectedFeedback.sentiment === "POS" ? "Positive" : selectedFeedback.sentiment === "NEG" ? "Negative" : "Neutral"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Date</span>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Assigned Themes */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Categorized Themes
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedFeedback.feedbackThemes && selectedFeedback.feedbackThemes.length > 0 ? (
                  selectedFeedback.feedbackThemes.map((ft, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-100 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Tag className="w-3 h-3 text-sky-600" />
                      {ft.theme.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No theme assigned yet.</span>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Feedback Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-sky-100 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ingest New Feedback
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit customer voice for automated analysis
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Feedback Text
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste customer message, survey response, or review here..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Channel Source
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition cursor-pointer"
                  >
                    {CHANNELS.filter((c) => c !== "All Channels").map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Sentiment
                  </label>
                  <select
                    value={newSentiment}
                    onChange={(e) => setNewSentiment(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-sky-100 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition cursor-pointer"
                  >
                    <option value="POS">Positive</option>
                    <option value="NEU">Neutral</option>
                    <option value="NEG">Negative</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Ingesting..." : "Ingest Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}