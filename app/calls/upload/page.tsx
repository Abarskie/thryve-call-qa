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

  const agents = agentsRes.data?.filter((a) => a.active) || [];
  const frameworks = frameworksRes.data?.filter((f) => f.active) || [];

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 space-y-6 flex-1">
          <div className="flex items-center gap-3">
            <Link 
              href="/calls"
              className="p-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-2xs"
              aria-label="Back to Calls"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Upload Call Audio</h1>
              <p className="text-xs text-neutral-500">Ingest recording for AI transcription & QA analysis</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-5 border-b border-neutral-100">
                <h2 className="text-base font-bold text-neutral-900">
                  New Call QA Review
                </h2>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
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
