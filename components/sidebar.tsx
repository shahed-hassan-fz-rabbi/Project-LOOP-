"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Inbox, 
  TrendingUp, 
  Bot, 
  FileText, 
  Settings, 
  LogOut 
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
    <aside 
      className="w-64 bg-gradient-to-b from-sky-50/70 via-white to-emerald-50/70 text-slate-700 flex flex-col justify-between h-screen sticky top-0 border-r border-sky-100 shrink-0 print:hidden"
    >
      <div>
        {/* Workspace Brand Header */}
        <div className="p-6 border-b border-sky-100/80">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 shadow-sm border border-emerald-200/60 bg-white">
              <Image 
                src="/logo.png" 
                alt="LOOP Logo" 
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-base tracking-tight block leading-none">
                LOOP
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Feedback Intelligence</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100/80">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Workspace</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-semibold text-slate-800 truncate">
                Demo Company
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 font-bold border border-emerald-200">
                {(session?.user as any)?.role || "Admin"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-500/20 font-semibold"
                    : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer / Sign Out */}
      <div className="p-4 border-t border-sky-100/80 bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">{session?.user?.name || "User"}</p>
              <p className="text-[11px] text-slate-500 truncate">{session?.user?.email || ""}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}