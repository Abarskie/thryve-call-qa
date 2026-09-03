"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#0b1320] text-slate-100 flex flex-col justify-center items-center">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
