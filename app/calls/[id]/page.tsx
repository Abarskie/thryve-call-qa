import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CallPageProps {
  params: Promise<{ id: string }>;
}

export default async function CallPage({ params }: CallPageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar />

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
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Call Evaluation Review</h1>
              <p className="text-xs text-neutral-400 font-mono">Tracking ID: {id}</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 text-center bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-10">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-xs">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1 tracking-tight">
              Processing Audio Recording...
            </h2>
            <p className="text-neutral-500 max-w-md text-xs leading-relaxed mb-4">
              The audio recording has been uploaded and is queued for OpenAI Whisper transcription and QA framework evaluation.
            </p>
            <span className="text-xs font-mono text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200">
              ID: {id}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
