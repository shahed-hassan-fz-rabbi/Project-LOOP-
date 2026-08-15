"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, MessageSquareQuote, CheckCircle2 } from "lucide-react";

interface EvidenceItem {
  id: string;
  content: string;
  channel: string;
  sentiment: string;
  themes: string[];
  similarity: number;
}

interface Message {
  type: "user" | "assistant";
  content: string;
  evidence?: EvidenceItem[];
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "assistant",
      content:
        "Hi! I am LOOP, your AI product intelligence analyst. Ask any question about your customer feedback, sentiment patterns, or recurring pain points.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || input;
    if (!query.trim() || loading) return;

    setMessages((prev) => [...prev, { type: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            type: "assistant",
            content: data.error || "Failed to process your question.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: data.answer,
          evidence: data.evidence,
        },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "A network error occurred. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sentimentColor: Record<string, string> = {
    POS: "bg-emerald-100 text-emerald-800",
    NEU: "bg-slate-100 text-slate-700",
    NEG: "bg-rose-100 text-rose-800",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ask LOOP</h1>
            <p className="text-xs text-slate-500">
              Retrieval-Augmented Generation grounded in real customer quotes
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-5 text-sm leading-relaxed ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                    : "bg-white border border-slate-200/80 rounded-bl-none text-slate-800 shadow-sm"
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Evidence Section */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <MessageSquareQuote className="h-3.5 w-3.5 text-blue-600" />
                      Grounded Ground Truth Sources ({msg.evidence.length})
                    </p>
                    <div className="space-y-2.5">
                      {msg.evidence.map((item, i) => (
                        <div
                          key={item.id || i}
                          className="bg-slate-50/90 p-3 rounded-lg border border-slate-200/60"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {item.channel}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  sentimentColor[item.sentiment] || "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {item.sentiment}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-blue-600">
                              {Math.round(item.similarity * 100)}% match
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 italic mt-1">"{item.content}"</p>

                          {item.themes.length > 0 && (
                            <div className="flex gap-1 flex-wrap mt-2">
                              {item.themes.map((theme) => (
                                <span
                                  key={theme}
                                  className="text-[10px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.5 rounded"
                                >
                                  {theme}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="h-4 w-4 animate-spin text-blue-600" />
                <span>Searching workspace feedback & generating answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Tray */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          {messages.length === 1 && (
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Suggested Inquiries</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What are customers saying about onboarding?",
                  "Which features have the most complaints?",
                  "What is the sentiment about performance?",
                  "What are the top billing issues?",
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSubmit(undefined, suggestion)}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your customer feedback..."
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm flex items-center gap-2 transition"
            >
              <Send className="h-4 w-4" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}