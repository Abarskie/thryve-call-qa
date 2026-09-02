import { Sidebar } from "@/components/layout/sidebar";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CallPageProps {
  params: Promise<{ id: string }>;
}

export default async function CallPage({ params }: CallPageProps) {
  const { id } = await params;

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
              <h1 className="text-base font-semibold text-white tracking-tight">Call Review & Scorecard</h1>
              <p className="text-[11px] text-slate-400 font-mono">ID: {id}</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center bg-slate-900/40 border border-slate-800/80 rounded-xl backdrop-blur-sm p-12">
            <div className="h-16 w-16 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-950/50">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              Ingesting Call Audio...
            </h2>
            <p className="text-slate-400 max-w-md text-xs leading-relaxed">
              The recording is queued for OpenAI Whisper transcription and GPT-4o QA scoring.
              <br />
              <br />
              <span className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                Tracking ID: {id}
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
