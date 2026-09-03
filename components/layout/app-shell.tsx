import React from "react";

import { Sidebar } from "@/components/layout/sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
