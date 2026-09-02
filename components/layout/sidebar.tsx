"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  GitFork,
  Settings,
  Radio,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Calls", href: "/calls", icon: PhoneCall },
    { name: "Agents", href: "/agents", icon: Users },
    { name: "Frameworks", href: "/frameworks", icon: GitFork },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col shrink-0 min-h-screen text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white tracking-tight text-base leading-tight flex items-center gap-1.5">
              Thryve
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 tracking-wider">
                QA
              </span>
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 relative ${
                isActive
                  ? "bg-slate-900 text-white font-semibold shadow-inner border border-slate-800/80 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-emerald-400"
                  : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-500"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* System Status & Profile */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* Node Status */}
        <div className="px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-400">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            AI QA Engine
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-medium">
            ONLINE
          </span>
        </div>

        {/* Manager User Pill */}
        <div className="p-2 flex items-center gap-3 rounded-lg hover:bg-slate-900/40 transition-colors">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 shadow-sm">
            M
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">Manager</p>
            <p className="text-[11px] text-slate-500 truncate">QA Command Center</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
