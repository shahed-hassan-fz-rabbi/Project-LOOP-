import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  ArrowRight,
  TrendingUp,
  Bot,
  Zap,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/60 via-white to-emerald-50/40 text-slate-800">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-8 shadow-xs">
            <Zap className="h-3.5 w-3.5 text-emerald-600" /> Next-Gen Customer Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
            Turn Scattered Feedback into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-600">
              Clear Product Decisions
            </span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            LOOP ingests feedback from support tickets, app reviews, and surveys—automatically classifying sentiment, detecting spikes, and providing AI-grounded insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition shadow-md shadow-sky-500/25 text-base active:scale-95"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 bg-white border border-sky-200/80 text-slate-800 rounded-xl font-semibold hover:bg-sky-50/50 hover:border-sky-300 transition text-base shadow-xs"
            >
              Explore Live Demo
            </Link>
          </div>

          <div className="inline-block bg-white/80 backdrop-blur-xs border border-sky-100 text-slate-600 rounded-xl px-5 py-2.5 text-xs font-medium shadow-xs">
            Demo Credentials: <span className="font-bold text-sky-700">admin@demo.com</span> / <span className="font-bold text-slate-800">admin123</span>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="py-20 px-6 max-w-6xl mx-auto border-t border-sky-100/80">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why Teams Rely on LOOP</h2>
            <p className="text-slate-500 text-sm mt-2">Comprehensive AI infrastructure for modern product organizations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200">
              <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-5">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Ingestion</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect multiple channels and let AI parse sentiment scores, tag themes, and normalize customer feedback instantly.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-5">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Spike Detection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive proactive alerts when complaints spike in specific categories before issues escalate to churn.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all duration-200">
              <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-5">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Grounded RAG (Ask LOOP)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask conversational questions in natural language and receive executive answers citing direct customer quotes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}