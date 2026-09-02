"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  GitFork,
  Settings,
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
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <span className="font-semibold text-slate-900 tracking-tight text-lg">
            CallCoach AI
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
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
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-slate-900" : "text-slate-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
            M
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-900 truncate">Manager</p>
            <p className="text-xs text-slate-500 truncate">QA Team</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
