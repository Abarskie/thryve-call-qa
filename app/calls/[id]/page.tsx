import { Sidebar } from "@/components/layout/sidebar";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CallPageProps {
  params: Promise<{ id: string }>;
}

export default async function CallPage({ params }: CallPageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 space-y-6 flex-1">
          <div className="flex items-center gap-3">
            <Link 
              href="/calls"
              className="p-2.5 rounded-xl border border-[#1e2e4a] bg-[#131e32] text-slate-400 hover:text-white hover:bg-[#182338] transition-colors shadow-sm"
              aria-label="Back to Calls"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Call Evaluation Review</h1>
              <p className="text-xs text-slate-400 font-mono">Tracking ID: {id}</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 text-center bg-[#131e32] border border-[#1e2e4a] rounded-2xl shadow-sm p-10">
            <div className="h-16 w-16 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-5">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1 tracking-tight">
              Processing Audio Recording...
            </h2>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed mb-4">
              The audio recording has been uploaded and is queued for OpenAI Whisper transcription and QA framework evaluation.
            </p>
            <span className="text-xs font-mono text-blue-400 bg-[#0e1726] px-3 py-1.5 rounded-xl border border-[#1e2e4a]">
              ID: {id}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
