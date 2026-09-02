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
  const pathname = usePathname() || "";

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Calls", href: "/calls", icon: PhoneCall },
    { name: "Agents", href: "/agents", icon: Users },
    { name: "Frameworks", href: "/frameworks", icon: GitFork },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200/90 flex flex-col shrink-0 min-h-screen text-neutral-800 shadow-xs select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs transition-colors group-hover:bg-indigo-700">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-neutral-900 tracking-tight text-sm leading-tight">
              Thryve Call QA
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              Call Quality Assurance
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1.5 flex-1">
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Icon
                className={`h-4 w-4 transition-colors ${
                  isActive ? "text-indigo-600" : "text-neutral-400"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
