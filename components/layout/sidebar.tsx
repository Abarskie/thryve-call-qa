"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  GitFork,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  // Determine active section
  const currentSection = pathname.startsWith("/calls")
    ? "calls"
    : pathname.startsWith("/agents")
    ? "agents"
    : pathname.startsWith("/frameworks")
    ? "frameworks"
    : pathname.startsWith("/settings")
    ? "settings"
    : "dashboard";

  const railItems = [
    { id: "dashboard", label: "Dashboard", href: "/", icon: LayoutDashboard },
    { id: "calls", label: "Calls", href: "/calls", icon: PhoneCall },
    { id: "agents", label: "Agents", href: "/agents", icon: Users },
    { id: "frameworks", label: "Frameworks", href: "/frameworks", icon: GitFork },
  ];

  // Secondary panel menu links based on active rail item
  const panelMenus: Record<
    string,
    { title: string; subtitle: string; links: { name: string; href: string }[] }
  > = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview & Analytics",
      links: [
        { name: "Overview", href: "/" },
        { name: "Upload Call", href: "/calls/upload" },
        { name: "Evaluated Feed", href: "/calls" },
      ],
    },
    calls: {
      title: "Calls",
      subtitle: "Audio QA Audits",
      links: [
        { name: "All Calls", href: "/calls" },
        { name: "Upload Audio", href: "/calls/upload" },
      ],
    },
    agents: {
      title: "Sales Agents",
      subtitle: "Team Performance",
      links: [
        { name: "Agent Roster", href: "/agents" },
        { name: "Compliance QA", href: "/agents" },
      ],
    },
    frameworks: {
      title: "Frameworks",
      subtitle: "Conversation SOPs",
      links: [
        { name: "All Frameworks", href: "/frameworks" },
        { name: "Create Framework", href: "/frameworks/new" },
      ],
    },
    settings: {
      title: "Settings",
      subtitle: "System Configuration",
      links: [
        { name: "Workspace & Team", href: "/settings" },
        { name: "AI Model Engine", href: "/settings" },
        { name: "API Keys & DB", href: "/settings" },
      ],
    },
  };

  const activePanel = panelMenus[currentSection];

  return (
    <aside className="flex shrink-0 min-h-screen z-20">
      {/* 1. Icon Rail (Far Left, 68px) */}
      <div className="w-[68px] bg-white border-r border-neutral-200 flex flex-col items-center justify-between py-4 select-none shrink-0 shadow-xs">
        {/* Brand Logo Icon */}
        <div className="flex flex-col items-center gap-6 w-full">
          <Link
            href="/"
            className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm hover:bg-indigo-700 transition-colors"
            title="Thryve Call QA"
          >
            T
          </Link>

          {/* Rail Navigation Icons */}
          <nav className="flex flex-col items-center gap-2 w-full px-2.5">
            {railItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-semibold"
                      : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-105" />
                  
                  {/* Tooltip on Hover */}
                  <span className="absolute left-[74px] px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail: Settings Icon */}
        <div className="w-full px-2.5">
          <Link
            href="/settings"
            className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              currentSection === "settings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 font-semibold"
                : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            }`}
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 transition-transform group-hover:rotate-45" />
            <span className="absolute left-[74px] px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
              Settings
            </span>
          </Link>
        </div>
      </div>

      {/* 2. Menu Panel (Secondary Panel, 200px) */}
      <div className="w-52 bg-white border-r border-neutral-200 flex flex-col justify-between py-5 px-4 shrink-0 shadow-xs">
        {/* Panel Header */}
        <div>
          <div className="pb-4 mb-3 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
              Thryve Call QA
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-neutral-400 font-medium">v1.0</span>
              <span className="text-neutral-300">•</span>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                {activePanel.subtitle}
              </span>
            </div>
          </div>

          {/* Sub Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 px-2 block mb-2">
              {activePanel.title}
            </span>
            {activePanel.links.map((link) => {
              const isLinkActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isLinkActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <span>{link.name}</span>
                  {isLinkActive && <ChevronRight className="h-3 w-3 text-indigo-600" />}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Panel Footer Upgrade / Status Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-neutral-50 to-indigo-50/50 border border-neutral-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="text-[11px] font-bold text-neutral-900">
              AI QA Engine
            </span>
          </div>
          <p className="text-[10px] text-neutral-500 leading-tight">
            Whisper transcription & GPT-4o grading active.
          </p>
        </div>
      </div>
    </aside>
  );
}
