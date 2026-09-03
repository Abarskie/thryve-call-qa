import { Sidebar } from "@/components/layout/sidebar";
import { Plus, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function CallsDirectoryPage() {
  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 space-y-7 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Calls Directory
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                All uploaded sales recordings, transcriptions & AI evaluations
              </p>
            </div>

            <Link
              href="/calls/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              Upload Recording
            </Link>
          </div>

          {/* Empty State Card */}
          <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-16 text-center shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              No call recordings yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Upload an audio file to automatically transcribe dialogue, evaluate adherence against your framework, and calculate compliance scores.
            </p>
            <Link
              href="/calls/upload"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
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
