"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Quote,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface EvidenceItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POS" | "NEU" | "NEG";
  customerLabel?: string;
  createdAt: string;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  evidence?: EvidenceItem[];
  hasInsufficientEvidence?: boolean;
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  "What are customers saying about onboarding?",
  "Which features have the most complaints?",
  "What is the sentiment about performance and load speed?",
  "What are the recurring billing and pricing issues?",
];

export default function AskLoopPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am LOOP, your automated Voice-of-Customer intelligence analyst. Ask any questions about customer sentiment patterns, specific friction points, or recurring themes grounded in verified feedback quotes.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getTimeString = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: getTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });

      const data = await res.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.answer || "I could not retrieve enough relevant customer feedback to answer this inquiry.",
        evidence: data.evidence || [],
        hasInsufficientEvidence: data.hasInsufficientEvidence || (!data.evidence || data.evidence.length === 0),
        timestamp: getTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "An error occurred while connecting to the semantic retrieval engine. Please verify your connection.",
          timestamp: getTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "Chat cleared. Ask any new questions regarding customer feedback intelligence.",
        timestamp: "Just now",
      },
    ]);
  };

  // Helper to render bold markdown in answers
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 pb-4 border-b border-sky-100/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ask LOOP</h1>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              RAG Engine Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Retrieval-Augmented Generation grounded in real customer quotes. No hallucinations.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-100 hover:bg-sky-50 text-slate-600 text-xs font-semibold shadow-2xs transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Feed (Expands to fill all available height) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-6 py-6 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`space-y-3.5 max-w-2xl ${
                  isUser ? "items-end text-right" : "items-start text-left"
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    isUser
                      ? "bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-tr-xs font-medium"
                      : "bg-white border border-sky-100 text-slate-700 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{renderFormattedText(msg.text)}</p>
                  <span
                    suppressHydrationWarning
                    className={`block text-[10px] mt-2 font-medium ${
                      isUser ? "text-sky-200" : "text-slate-400"
                    }`}
                  >
                    {mounted ? msg.timestamp : "..."}
                  </span>
                </div>

                {/* Evidence Feedback Cards */}
                {!isUser && msg.evidence && msg.evidence.length > 0 && (
                  <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                        <Quote className="w-3.5 h-3.5 text-sky-600" />
                        <span>Grounded Evidence Citations ({msg.evidence.length})</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        100% Verified Quotes
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.evidence.map((ev, i) => (
                        <div
                          key={ev.id || i}
                          className="p-3 rounded-xl bg-white border border-sky-100 shadow-2xs space-y-2 hover:border-sky-200 transition"
                        >
                          <p className="text-xs text-slate-800 font-medium line-clamp-3 leading-relaxed">
                            "{ev.content}"
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-50">
                            <span className="font-semibold text-slate-600">{ev.channel}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${
                                ev.sentiment === "POS"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : ev.sentiment === "NEG"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-50 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {ev.sentiment}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insufficient Evidence Warning */}
                {!isUser && msg.hasInsufficientEvidence && msg.id !== "welcome" && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Low confidence match: Insufficient direct feedback matches this specific inquiry.</span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs rounded-tl-xs space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 font-medium ml-1">
                  Searching embeddings & synthesizing evidence...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries (Shows only at the start so it does not block active chat) */}
      {messages.length <= 1 && (
        <div className="space-y-2 shrink-0 pt-2 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            Suggested Inquiries
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((query, index) => (
              <button
                key={index}
                onClick={() => handleSend(query)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50/70 border border-sky-100 hover:border-sky-200 text-slate-700 text-xs font-medium transition shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer text-left"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="relative shrink-0 pt-2">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-sky-100 shadow-sm focus-within:border-sky-300 focus-within:ring-3 focus-within:ring-sky-500/10 transition">
          <input
            type="text"
            placeholder="Ask anything about customer friction, sentiments, or recurring requests..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none disabled:opacity-50"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}