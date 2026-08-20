"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md shadow-sm border-b border-sky-100/80 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center border border-emerald-200 bg-white shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="LOOP Logo"
                width={36}
                height={36}
                className="object-contain p-1"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none group-hover:text-sky-600 transition-colors">
                LOOP
              </span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">
                Feedback Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-sky-100/90 shadow-sm text-sm font-medium text-slate-600">
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className="px-3.5 py-1.5 rounded-full hover:text-sky-600 hover:bg-sky-50/70 transition-all cursor-pointer"
            >
              Platform
            </a>
            <a
              href="#analytics"
              onClick={(e) => handleSmoothScroll(e, "analytics")}
              className="px-3.5 py-1.5 rounded-full hover:text-emerald-600 hover:bg-emerald-50/70 transition-all cursor-pointer"
            >
              Analytics
            </a>
            <a
              href="#rag"
              onClick={(e) => handleSmoothScroll(e, "rag")}
              className="px-3.5 py-1.5 rounded-full hover:text-sky-600 hover:bg-sky-50/70 transition-all cursor-pointer"
            >
              Ask LOOP AI
            </a>
            <a
              href="#security"
              onClick={(e) => handleSmoothScroll(e, "security")}
              className="px-3.5 py-1.5 rounded-full hover:text-emerald-600 hover:bg-emerald-50/70 transition-all cursor-pointer"
            >
              Enterprise RBAC
            </a>
            <a
              href="#demo-video"
              onClick={(e) => handleSmoothScroll(e, "demo-video")}
              className="px-3.5 py-1.5 rounded-full text-sky-700 font-semibold hover:text-sky-900 hover:bg-sky-50 transition-all cursor-pointer"
            >
              Demo Video
            </a>
          </nav>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-xl shadow-sm hover:shadow transition active:scale-95 cursor-pointer"
            >
              
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-sky-600 rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-4 bg-white rounded-2xl border border-sky-100 shadow-xl space-y-3">
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 rounded-lg cursor-pointer"
            >
              Platform
            </a>
            <a
              href="#analytics"
              onClick={(e) => handleSmoothScroll(e, "analytics")}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
            >
              Analytics
            </a>
            <a
              href="#rag"
              onClick={(e) => handleSmoothScroll(e, "rag")}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-sky-50 rounded-lg cursor-pointer"
            >
              Ask LOOP AI
            </a>
            <a
              href="#security"
              onClick={(e) => handleSmoothScroll(e, "security")}
              className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
            >
              Enterprise RBAC
            </a>
            <a
              href="#demo-video"
              onClick={(e) => handleSmoothScroll(e, "demo-video")}
              className="block px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 rounded-lg cursor-pointer"
            >
              Demo Video
            </a>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="w-full text-center py-2 text-sm font-semibold bg-gradient-to-r from-sky-600 to-emerald-600 text-white rounded-lg shadow-sm"
              >
                Launch App
              </Link>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}