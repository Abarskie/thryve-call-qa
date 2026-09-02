import { Sidebar } from "@/components/layout/sidebar";
import { getFrameworksAction } from "@/app/actions/frameworks";
import { FrameworkList } from "@/components/frameworks/framework-list";
import { GitFork, CheckCircle2, Layers } from "lucide-react";

export const revalidate = 0;

export default async function FrameworksPage() {
  const result = await getFrameworksAction();
  const frameworks = result.success && result.data ? result.data : [];

  const totalFrameworks = frameworks.length;
  const activeFrameworks = frameworks.filter((f) => f.active).length;
  const totalStages = frameworks.reduce((acc, f) => acc + f.stages_count, 0);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <GitFork className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">
                Call Frameworks
              </h1>
              <p className="text-[11px] text-slate-400">
                Conversation structures, weighted stages & QA evaluation rubrics
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6 flex-1">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Total Frameworks
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
                  <GitFork className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
                {totalFrameworks}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Defined call playbooks</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Active Frameworks
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {activeFrameworks}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ready for call scoring</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Configured Stages
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
                {totalStages}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Total across playbooks</p>
            </div>
          </div>

          {/* List Component */}
          <FrameworkList initialFrameworks={frameworks} />
        </div>
      </main>
    </div>
  );
}
