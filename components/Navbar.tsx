import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">LOOP</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}