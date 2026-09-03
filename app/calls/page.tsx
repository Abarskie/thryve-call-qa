import { Sidebar } from "@/components/layout/sidebar";
import { CallsDirectory } from "@/components/calls/calls-directory";
import { getDashboardDataAction } from "@/app/actions/calls";
import { Plus } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function CallsDirectoryPage() {
  const result = await getDashboardDataAction();
  const calls = result.success && result.data ? result.data.recentCalls : [];

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6 flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Call Recordings Directory
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                All ingested audio recordings, transcriptions & AI QA compliance audits
              </p>
            </div>

            <Link
              href="/calls/upload"
              prefetch={true}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              Upload Recording
            </Link>
          </div>

          {/* Interactive Calls Directory Table & Filters */}
          <CallsDirectory initialCalls={calls} />
        </div>
      </main>
    </div>
  );
}

