import { Sidebar } from "@/components/layout/sidebar";
import { CallUploadForm } from "@/components/calls/call-upload-form";
import { getAgentsAction } from "@/app/actions/agents";
import { getFrameworksAction } from "@/app/actions/frameworks";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CallUploadPage() {
  const [agentsRes, frameworksRes] = await Promise.all([
    getAgentsAction(),
    getFrameworksAction(),
  ]);

  const agents = agentsRes.data?.filter(a => a.active) || [];
  const frameworks = frameworksRes.data?.filter(f => f.active) || [];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              href="/calls"
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label="Back to Calls"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">Upload Call Audio</h1>
              <p className="text-[11px] text-slate-400">Ingest recording for AI transcription & QA analysis</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 shadow-sm overflow-hidden backdrop-blur-sm">
              <div className="px-6 py-5 border-b border-slate-800/80">
                <h2 className="text-base font-semibold text-white">
                  New Call Analysis
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload an audio file to automatically transcribe dialogue, evaluate compliance against your chosen framework, and produce coaching feedback.
                </p>
              </div>
              <div className="p-6">
                <CallUploadForm agents={agents} frameworks={frameworks} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
