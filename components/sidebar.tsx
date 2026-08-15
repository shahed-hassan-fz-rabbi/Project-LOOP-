"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Inbox, 
  TrendingUp, 
  Bot, 
  FileText, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/ask", label: "Ask LOOP", icon: Bot },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">LOOP</h1>
          <p className="text-xs text-slate-400">Feedback Intelligence</p>
        </div>
      </div>

      {/* Workspace & Role Badge */}
      {session?.user && (
        <div className="px-6 py-3.5 bg-slate-800/50 border-b border-slate-800">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Workspace</p>
          <p className="font-medium text-sm text-white truncate">Demo Company</p>
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded capitalize">
            {(session.user as any)?.role?.toLowerCase() || "user"}
          </span>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}