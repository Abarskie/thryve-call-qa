import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Plus, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function CallsDirectoryPage() {
  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar />

        <div className="p-8 space-y-7 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Calls Directory
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                All uploaded sales recordings, transcriptions & AI evaluations
              </p>
            </div>

            <Link
              href="/calls/upload"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Upload Recording
            </Link>
          </div>

          {/* Empty State Card */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-16 text-center shadow-xs">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <PhoneCall className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              No call recordings yet
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Upload an audio file to automatically transcribe dialogue, evaluate adherence against your framework, and calculate compliance scores.
            </p>
            <Link
              href="/calls/upload"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs shadow-indigo-100 transition-colors"
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
