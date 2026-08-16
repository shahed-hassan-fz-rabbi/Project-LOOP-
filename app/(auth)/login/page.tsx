"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm mb-3">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome to LOOP</h1>
            <p className="text-xs text-slate-500 mt-1">Sign in to your customer intelligence workspace</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? "Authenticating..." : "Sign In"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-semibold">
              Create workspace
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Demo Credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="font-bold text-slate-800 block">Admin</span>
                <span>admin@demo.com</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="font-bold text-slate-800 block">Analyst</span>
                <span>analyst@demo.com</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="font-bold text-slate-800 block">Viewer</span>
                <span>viewer@demo.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}