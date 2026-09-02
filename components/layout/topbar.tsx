"use client";

import { useState } from "react";
import { Search, Bell, Radio } from "lucide-react";

export function Topbar() {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
      {/* Left: Global Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search calls, agents, frameworks..."
            className="w-full pl-10 pr-12 py-2 bg-neutral-50 hover:bg-neutral-100/60 focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 bg-white border border-neutral-200 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Controls & User Profile */}
      <div className="flex items-center gap-3.5">
        {/* Live Engine Status Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono">AI ENGINE ONLINE</span>
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-neutral-200" />

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 p-1 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer pl-1 pr-3">
          <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            M
          </div>
          <div className="text-left hidden md:block">
            <span className="text-xs font-semibold text-neutral-800 block leading-tight">
              Manager
            </span>
            <span className="text-[10px] text-neutral-400 font-medium block">
              QA Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
