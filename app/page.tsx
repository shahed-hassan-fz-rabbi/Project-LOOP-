"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Search,
  Play,
  BarChart3,
  Gauge,
  Rocket,
} from "lucide-react";

const YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "admin@demo.com";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "password123";

const VideoSkeleton = () => (
  <div className="aspect-video w-full bg-slate-900 animate-pulse flex items-center justify-center">
    <div className="text-slate-500 text-sm font-medium">Loading video...</div>
  </div>
);

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"sentiment" | "rag">("sentiment");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      
      {/* 1. Global Navbar */}
      <Navbar />

      <main className="flex-1 space-y-28 pb-20">
        
        {/* 2. Hero Section with Visible Background Image */}
        <section className="relative pt-36 pb-20 px-6 overflow-hidden min-h-[660px] flex items-center">
          
          {/* Background Image Container with Crisp Visibility */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <Image
              src="/hero-bg.png"
              alt="Customer Feedback Executive Environment"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-45"
            />
            {/* Subtle Vignette for Text Contrast without washing out the photo */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-slate-50" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,rgba(248,250,252,0.85)_100%)]" />
          </div>

          <div className="max-w-5xl mx-auto text-center space-y-8 relative w-full">
            


            {/* Main Headline */}
            <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Turn Scattered Feedback into{" "}
              <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Clear Product Decisions
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              LOOP ingests feedback from support tickets, app reviews, and surveys—
              automatically classifying sentiment, detecting spikes, and providing AI-grounded insights.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white text-sm font-bold shadow-xl shadow-sky-600/20 transition active:scale-95 cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-slate-300 bg-white/90 hover:bg-white text-slate-800 text-sm font-bold shadow-xs backdrop-blur-sm transition active:scale-95 cursor-pointer"
              >
                <span>Explore Live Demo</span>
              </Link>
            </div>

          

            {/* Live Synthesis Overview Mockup Card */}
            <div className="pt-8 max-w-4xl mx-auto">
              <div className="p-3 bg-white/90 rounded-3xl border border-sky-100 shadow-2xl backdrop-blur-md">
                <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 space-y-6 text-left">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-rose-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        Executive Overview • Live Workspace Ingestion
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ● Live Stream
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100">
                      <span className="text-[10px] font-bold uppercase text-sky-800 tracking-wider">
                        Total Volume
                      </span>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">154</p>
                      <p className="text-[11px] text-slate-500">Customer feedback items</p>
                    </div>
                    <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                        Positive
                      </span>
                      <p className="text-3xl font-extrabold text-emerald-800 mt-1">36%</p>
                      <p className="text-[11px] text-emerald-700">Satisfaction driver</p>
                    </div>
                    <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100">
                      <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider">
                        Friction
                      </span>
                      <p className="text-3xl font-extrabold text-rose-800 mt-1">51%</p>
                      <p className="text-[11px] text-rose-700">Reported pain points</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-sky-50/70 to-emerald-50/70 rounded-2xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        AI
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Latest Grounded Recommendation
                        </p>
                        <p className="text-xs text-slate-600">
                          "Streamline team invite flow within onboarding to cut drop-off by 25%."
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 shrink-0">
                      High Confidence
                    </span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3. Section 1: Platform Ingestion (id="features") */}
        <section id="features" className="px-6 max-w-6xl mx-auto space-y-12 scroll-mt-24">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/60">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Omnichannel Pipeline</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Connect Every <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-600">Voice Stream</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ingest raw feedback seamlessly from Support Tickets, App Store Reviews, Customer Portals, and CSV exports.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Automated Webhooks</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant feedback ingestion with real-time NLP classification as soon as customer reviews arrive.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Batch Processing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bulk analyze historical transcripts with exponential backoff and rate-limited vector embeddings.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Relational Normalization</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clean 3NF relational data structures linking feedback, multi-theme associations, and embeddings.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Section 2: Analytics & Trends (id="analytics") */}
        <section id="analytics" className="px-6 max-w-6xl mx-auto space-y-12 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Intelligence Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Actionable <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Velocity & Trends</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Track sentiment trends with automated spike detection and anomaly alerts across rolling time windows.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("sentiment")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "sentiment"
                    ? "bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md shadow-sky-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1.5" />
                Sentiment Polarity
              </button>
              <button
                onClick={() => setActiveTab("rag")}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === "rag"
                    ? "bg-gradient-to-r from-sky-600 to-emerald-600 text-white shadow-md shadow-sky-600/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Gauge className="w-4 h-4 inline mr-1.5" />
                Thematic Clustering
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                Timeseries Analytics
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                Spot Friction Before Churn Spikes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                LOOP continuously categorizes incoming complaints, highlighting recurring keywords such as onboarding friction, API latency, and billing issues.
              </p>
              <ul className="space-y-3 pt-2">
                {["Multi-channel sentiment distribution", "Automated friction anomaly alerts", "Confidence score filtering on themes"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>Top Emergent Themes</span>
                <span className="text-slate-400">Past 30 Days</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700">Onboarding & Invitations</span>
                    <span className="text-rose-700 font-bold">51% Friction</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500 w-[51%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700">Performance & API Latency</span>
                    <span className="text-amber-700 font-bold">32% Friction</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 w-[32%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-700">Core Dashboard & Reporting Value</span>
                    <span className="text-emerald-700 font-bold">86% Positive</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[86%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Section 3: Ask LOOP AI (id="rag") */}
        <section id="rag" className="px-6 max-w-6xl mx-auto space-y-12 scroll-mt-24">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/60">
              <Bot className="w-4 h-4 text-sky-600" />
              <span>Retrieval-Augmented Generation</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Conversational RAG <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-600">Grounded in Evidence</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Ask natural language questions about customer issues. LOOP synthesizes grounded answers with direct citations to original user quotes.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-sky-100 shadow-sm p-8 max-w-3xl mx-auto space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                "Why are users complaining about member onboarding?"
              </span>
            </div>

            <div className="space-y-4 bg-gradient-to-r from-sky-50/70 to-emerald-50/70 p-6 rounded-2xl border border-sky-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-900">LOOP Grounded Synthesis</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Users report delays of 20 to 30 minutes when trying to send workspace invitation links. The onboarding wizard lacks clear status updates during member provisioning.
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Retrieved Customer Evidence (2 Citations)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 italic">
                  "Onboarding flow is confusing. Took 30 minutes to invite my first team member."
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 italic">
                  "The welcome email was helpful but the setup wizard could be clearer."
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Section 4: Enterprise RBAC (id="security") */}
        <section id="security" className="px-6 max-w-6xl mx-auto space-y-12 scroll-mt-24">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Tenant Security</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Strict Isolation & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Role-Based Access</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Strict workspace boundaries with encrypted JWT authentication and role-based permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Admin Role
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Workspace Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full control over team invites, workspace renaming, API triggers, and bulk AI classification jobs.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                Analyst Role
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Synthesis & Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ingest feedback, query Ask LOOP RAG engine, explore trend anomalies, and generate executive dossiers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-3">
              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Viewer Role
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">Read-Only Auditing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Secure read-only access for stakeholders to review dashboards and export print-ready PDF briefs.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Section 5: Demo Video (id="demo-video") */}
        <section id="demo-video" className="px-6 max-w-5xl mx-auto space-y-8 scroll-mt-24">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200/60">
              <Play className="w-4 h-4 text-sky-600" />
              <span>Project Walkthrough Demo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              See LOOP <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-600">in Action</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Watch how LOOP ingests multi-channel feedback, detects emergent anomalies, and produces grounded executive PDF dossiers.
            </p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-sky-200/80 shadow-2xl bg-slate-950 max-w-4xl mx-auto">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-bold text-white">LOOP Enterprise Demo Walkthrough</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>HD 1080p</span>
                <span>•</span>
                <span>Full Product Flow</span>
              </div>
            </div>

            <div className="aspect-video w-full bg-slate-900 relative">
              <Suspense fallback={<VideoSkeleton />}>
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=0&controls=1&rel=0`}
                  title="LOOP AI Demo Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Suspense>
            </div>

            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Interactive Player Controls</span>
              <span className="text-emerald-400 font-medium">Ready for Viva Evaluation</span>
            </div>
          </div>
        </section>

        {/* 8. CTA Section */}
        <section className="px-6 max-w-5xl mx-auto pt-4">
          <div className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center text-white bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 shadow-xl shadow-sky-950/10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold">
              <Rocket className="w-4 h-4" />
              <span>Voice-of-Customer Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Synthesize Customer Feedback with Grounded AI?
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
              Eliminate product blind spots. Transform raw support tickets into prioritized roadmap actions today.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-bold shadow-xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
              >
                <span>Create Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-700/60 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold border border-sky-400/40 backdrop-blur-sm transition active:scale-95 cursor-pointer"
              >
                <span>Sign In with Demo Account</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 9. Global Footer */}
      <Footer />
    </div>
  );
}