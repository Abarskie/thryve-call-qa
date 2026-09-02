import { Sidebar } from "@/components/layout/sidebar";
import { Plus, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function CallsDirectoryPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <PhoneCall className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">Calls Directory</h1>
              <p className="text-[11px] text-slate-400">All uploaded and evaluated audio recordings</p>
            </div>
          </div>
          <Link
            href="/calls/upload"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Upload Call
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-xl p-16 text-center backdrop-blur-sm">
            <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <PhoneCall className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">No call recordings yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Upload an agent audio recording to automatically transcribe and evaluate compliance against your frameworks.
            </p>
            <Link
              href="/calls/upload"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/60 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload First Call
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
