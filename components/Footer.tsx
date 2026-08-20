import Link from "next/link";
import Image from "next/image";
import { Sparkles, Shield, Cpu, Database, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col (2 spans) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700 bg-slate-800">
                <Image
                  src="/logo.png"
                  alt="LOOP Logo"
                  width={36}
                  height={36}
                  className="object-contain p-1"
                />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">LOOP</span>
            </div>
            
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Autonomous customer intelligence engine turning scattered multi-channel feedback into ranked, evidence-backed product roadmaps.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Next.js & Prisma Architecture
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Engines</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  AI Auto-Classification
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-emerald-400 transition-colors">
                  Theme Spike Detection
                </a>
              </li>
              <li>
                <a href="#rag" className="hover:text-emerald-400 transition-colors">
                  Ask LOOP (RAG Engine)
                </a>
              </li>
              <li>
                <a href="#reports" className="hover:text-emerald-400 transition-colors">
                  Voice-of-Customer VoC
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture & Stack */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Architecture</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-sky-400" />
                <span>Multi-Tenant DB</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>RBAC Security Layer</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>Anthropic Claude / Gemini</span>
              </li>
            </ul>
          </div>

          {/* Quick Access / Portal */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Access</p>
            <div className="space-y-2">
              <Link
                href="/login"
                className="block text-sm text-slate-300 hover:text-white font-medium transition"
              >
                Sign In to Workspace →
              </Link>
              <Link
                href="/login"
                className="block text-sm text-slate-300 hover:text-white font-medium transition"
              >
                Demo Sandbox
              </Link>
              <p className="text-xs text-slate-500 pt-1">
                Roles: Admin, Analyst & Viewer
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LOOP AI Intelligence Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer transition">Data Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer transition">Tenant Isolation</span>
            <span className="hover:text-slate-400 cursor-pointer transition">API Docs</span>
          </div>
        </div>

      </div>
    </footer>
  );
}