import { Sidebar } from "@/components/layout/sidebar";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CallPageProps {
  params: Promise<{ id: string }>;
}

export default async function CallPage({ params }: CallPageProps) {
  const { id } = await params;

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
            <h1 className="text-lg font-semibold text-slate-900">Call Details</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Processing Call Audio...
            </h2>
            <p className="text-slate-500 max-w-md">
              The audio file is being processed. In the next step, we will add the AI transcription and QA evaluation engine to this page.
              <br />
              <br />
              <span className="text-sm font-mono text-slate-400">Call ID: {id}</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
