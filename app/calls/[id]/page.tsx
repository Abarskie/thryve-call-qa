import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCallReviewData } from "@/lib/call-processing/query";
import { getSettingsAction } from "@/app/actions/settings";
import { CallReview } from "@/components/calls/call-review";

export const dynamic = "force-dynamic";

interface CallPageProps {
  params: Promise<{ id: string }>;
}

export default async function CallPage({ params }: CallPageProps) {
  const { id } = await params;
  const call = await getCallReviewData(id);

  if (!call) {
    notFound();
  }

  const settingsRes = await getSettingsAction();
  const passingThreshold = settingsRes.data?.passingThreshold ?? 75;

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
              <h1 className="text-xl font-bold text-white tracking-tight">
                Call Evaluation Review
              </h1>
              <p className="text-xs text-slate-400 font-mono">Tracking ID: {id}</p>
            </div>
          </div>

          <CallReview
            initialCall={call}
            now={new Date().toISOString()}
            passingThreshold={passingThreshold}
          />
        </div>
      </main>
    </div>
  );
}
