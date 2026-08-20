"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-white flex flex-col justify-between p-6">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-700 transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="LOOP Logo"
            width={28}
            height={28}
            className="w-7 h-7 object-contain rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo.png";
            }}
          />
          <span className="font-bold text-slate-900 text-sm tracking-tight">LOOP</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl border border-sky-100/90 shadow-xl shadow-sky-900/5 p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block">
              <div className="w-14 h-14 rounded-2xl bg-white border border-sky-100 shadow-sm flex items-center justify-center mx-auto hover:scale-105 transition cursor-pointer p-2.5">
                <Image
                  src="/logo.svg"
                  alt="LOOP Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/logo.png";
                  }}
                />
              </div>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to LOOP</h1>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your customer feedback intelligence workspace
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-300 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white focus:border-sky-300 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-sky-600/10 transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-1">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-sky-600 hover:text-sky-700 underline underline-offset-2 transition"
            >
              Create workspace
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Credentials (Click to fill)</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials("admin@demo.com")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  email === "admin@demo.com"
                    ? "border-sky-300 bg-sky-50/60"
                    : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                }`}
              >
                <span className="block text-[10px] font-bold text-slate-800">Admin</span>
                <span className="block text-[9px] text-slate-400 truncate">admin@demo.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("analyst@demo.com")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  email === "analyst@demo.com"
                    ? "border-sky-300 bg-sky-50/60"
                    : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                }`}
              >
                <span className="block text-[10px] font-bold text-slate-800">Analyst</span>
                <span className="block text-[9px] text-slate-400 truncate">analyst@demo.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoCredentials("viewer@demo.com")}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  email === "viewer@demo.com"
                    ? "border-sky-300 bg-sky-50/60"
                    : "border-slate-100 bg-slate-50 hover:bg-slate-100/70"
                }`}
              >
                <span className="block text-[10px] font-bold text-slate-800">Viewer</span>
                <span className="block text-[9px] text-slate-400 truncate">viewer@demo.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-400">
        LOOP Feedback Intelligence Platform © 2026. All rights reserved.
      </div>
    </div>
  );
}