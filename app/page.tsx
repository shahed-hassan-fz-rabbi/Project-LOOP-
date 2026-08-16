import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  TrendingUp,
  Bot,
  Zap,
  BarChart3,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
            <Zap className="h-3.5 w-3.5" /> Next-Gen Customer Intelligence Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
            Turn Scattered Feedback into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Clear Product Decisions
            </span>
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            LOOP ingests feedback from support tickets, app reviews, and surveys—automatically classifying sentiment, detecting spikes, and providing AI-grounded insights with Claude.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 text-base"
            >
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-white border border-slate-300 text-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition text-base"
            >
              Explore Live Demo
            </Link>
          </div>

          <div className="inline-block bg-blue-50 border border-blue-200 text-blue-900 rounded-lg px-4 py-2 text-xs font-medium">
            Demo Credentials: <span className="font-bold">admin@demo.com</span> / <span className="font-bold">admin123</span>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why Teams Rely on LOOP</h2>
            <p className="text-slate-500 text-sm mt-2">Comprehensive AI infrastructure for modern product organizations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Ingestion</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect multiple channels and let AI parse sentiment scores, tag themes, and normalize customer feedback instantly.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Spike Detection</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive proactive alerts when complaints spike in specific categories before issues escalate.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
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