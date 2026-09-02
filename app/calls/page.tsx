import { Sidebar } from "@/components/layout/sidebar";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CallsDirectoryPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <h1 className="text-lg font-semibold text-slate-900">Calls</h1>
          <Link
            href="/calls/upload"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Upload Call
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="text-center py-24 text-slate-500">
            <p>Call history will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
