"use client";

import Link from "next/link";
import Image from "next/image";
import { Shield, Cpu, Database, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      
      {/* Subtle Background Glow Accent matching Brand Theme */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-sky-500/5 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Col (2 spans) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center border border-emerald-500/30 bg-slate-900 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="LOOP Logo"
                  width={36}
                  height={36}
                  className="object-contain p-1"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight block leading-none">
                  LOOP
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mt-0.5">
                  Feedback Intelligence
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed font-normal">
              Autonomous customer intelligence engine turning scattered multi-channel feedback into ranked, evidence-backed product decisions.
            </p>

           
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">Core Engines</p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => handleScroll("features")}
                  className="hover:text-sky-400 transition-colors text-left cursor-pointer"
                >
                  AI Auto-Classification
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("analytics")}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Theme Spike Detection
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("rag")}
                  className="hover:text-sky-400 transition-colors text-left cursor-pointer"
                >
                  Ask LOOP (RAG Engine)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("demo-video")}
                  className="hover:text-emerald-400 transition-colors text-left cursor-pointer"
                >
                  Product Walkthrough
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture & Stack */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">Architecture</p>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Database className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Multi-Tenant DB (3NF)</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>RBAC Security Layer</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Anthropic Claude / Gemini</span>
              </li>
            </ul>
          </div>

          {/* Quick Access / Portal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform Access</p>
            <div className="space-y-2.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors group"
              >
                <span>Sign In to Workspace</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/login"
                className="block text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Demo Sandbox
              </Link>
              <p className="text-xs text-slate-500 pt-1">
                Roles: <span className="text-emerald-400/90 font-medium">Admin</span>, <span className="text-sky-400/90 font-medium">Analyst</span> & Viewer
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LOOP AI Customer Feedback Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition">Data Privacy</span>
            <span className="hover:text-slate-300 transition">Tenant Isolation</span>
            <span className="hover:text-slate-300 transition">API Telemetry</span>
          </div>
        </div>

      </div>
    </footer>
  );
}