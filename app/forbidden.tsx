import Link from "next/link";
import { ShieldAlert, LayoutDashboard } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h1>
        <p className="text-sm text-slate-600 mb-6">
          Your assigned role does not have sufficient permissions to modify or execute this action.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition"
        >
          <LayoutDashboard className="h-4 w-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}