"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  GitFork,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";

export function Sidebar() {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Calls", href: "/calls", icon: PhoneCall },
    { name: "Agents", href: "/agents", icon: Users },
    { name: "Frameworks", href: "/frameworks", icon: GitFork },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0e1726] border-b border-[#1e2e4a] px-4 flex items-center justify-between z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-600/30">
            T
          </div>
          <div>
            <span className="font-bold text-white text-xs tracking-tight block leading-tight">
              Thryve QA
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Call Quality Assurance
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-[#182338] rounded-xl border border-[#1e2e4a] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop Fixed & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-64 bg-[#0e1726] border-r border-[#1e2e4a] flex flex-col shrink-0 min-h-screen text-slate-200 shadow-2xl md:shadow-none transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1e2e4a]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-600/30 transition-transform group-hover:scale-105">
              T
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-tight text-sm leading-tight">
                Thryve Call QA
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Sales Quality Assurance
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Main Menu
          </span>

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
                prefetch={true}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-[#182338]/80 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Workspace Status & Sign Out */}
        <div className="p-3.5 border-t border-[#1e2e4a] space-y-2.5">
          <div className="p-3 rounded-xl bg-[#131e32] border border-[#1e2e4a]/80 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-white">AI Engine Active</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              OpenAI Whisper & Framework scoring ready.
            </p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
