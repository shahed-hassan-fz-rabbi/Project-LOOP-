"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/inbox", label: "Inbox", icon: "📥" },
  { href: "/themes", label: "Themes", icon: "🏷️" },
  { href: "/trends", label: "Trends", icon: "📈" },
  { href: "/ask", label: "Ask LOOP", icon: "🤖" },
  { href: "/reports", label: "Reports", icon: "📋" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">LOOP</h1>
        <p className="text-blue-200 text-sm">Feedback Intelligence</p>
      </div>

      {session?.user && (
        <div className="px-6 py-4 bg-blue-800/50 border-b border-blue-700">
          <p className="text-xs text-blue-200 uppercase">Workspace</p>
          <p className="font-semibold text-sm mt-1">Demo Company</p>
          <p className="text-xs text-blue-300 mt-2">
            {(session.user as any)?.role || "User"}
          </p>
        </div>
      )}

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === item.href
                ? "bg-blue-600 text-white"
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-blue-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}