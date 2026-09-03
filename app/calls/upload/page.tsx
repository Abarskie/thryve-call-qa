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

  const agents = agentsRes.data?.filter((a) => a.active) || [];
  const frameworks = frameworksRes.data?.filter((f) => f.active) || [];

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6 flex-1">
          <div className="flex items-center gap-3">
            <Link 
              href="/calls"
              className="p-2.5 rounded-xl border border-[#1e2e4a] bg-[#131e32] text-slate-400 hover:text-white hover:bg-[#182338] transition-colors shadow-sm"
              aria-label="Back to Calls"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Upload Call Audio</h1>
              <p className="text-xs text-slate-400">Ingest recording for AI transcription & QA analysis</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-[#131e32] rounded-2xl border border-[#1e2e4a] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#1e2e4a]">
                <h2 className="text-base font-bold text-white">
                  New Call QA Review
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
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
