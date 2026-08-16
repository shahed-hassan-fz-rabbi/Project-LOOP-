"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose?: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 space-y-2 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-slide-in ${
            toast.type === "success"
              ? "bg-emerald-900 border-emerald-800 text-emerald-100"
              : toast.type === "error"
              ? "bg-rose-900 border-rose-800 text-rose-100"
              : "bg-slate-900 border-slate-800 text-slate-100"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
          {toast.type === "info" && <Info className="h-4 w-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
          {onClose && (
            <button
              onClick={() => onClose(toast.id)}
              className="ml-auto text-slate-400 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}