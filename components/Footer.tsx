import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <span>LOOP</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AI-powered customer feedback intelligence platform for modern product teams.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/login" className="hover:text-white transition">Dashboard</Link></li>
            <li><Link href="/login" className="hover:text-white transition">Ask LOOP</Link></li>
            <li><Link href="/login" className="hover:text-white transition">VoC Reports</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Demo Accounts</h4>
          <ul className="space-y-1.5 text-xs">
            <li>Admin: admin@demo.com</li>
            <li>Analyst: analyst@demo.com</li>
            <li>Viewer: viewer@demo.com</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Tech Stack</h4>
          <p className="text-xs leading-relaxed text-slate-400">
            Next.js 16, Auth.js v5, Prisma, PostgreSQL & Claude AI.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 LOOP Inc. Multi-Tenant Enterprise Platform.</p>
        <p>Built for Zidio Development Internship.</p>
      </div>
    </footer>
  );
}