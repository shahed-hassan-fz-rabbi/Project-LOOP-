import Link from "next/link";
import { SearchX, LayoutDashboard, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <SearchX className="h-6 w-6" />
        </div>
        <p className="text-4xl font-extrabold text-slate-900 tracking-tight mb-1">404</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The requested URL or workspace resource could not be found.
        </p>
        <div className="flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition"
          >
            <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}