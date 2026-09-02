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
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link 
              href="/calls"
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              aria-label="Back to Calls"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Upload Call Audio</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  New Call Analysis
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Upload a sales call recording to automatically transcribe and evaluate it against a framework.
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
