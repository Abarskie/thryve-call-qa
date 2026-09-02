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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8">
          <h1 className="text-lg font-semibold text-slate-900">Call Frameworks</h1>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quality Frameworks
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Define required conversation structures, stages, and checklist items for AI call scoring.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Frameworks
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <GitFork className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {totalFrameworks}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Defined call playbooks</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Frameworks
                </span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {activeFrameworks}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ready for call scoring</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Configured Stages
                </span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {totalStages}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Across all frameworks</p>
            </div>
          </div>

          {/* Framework List & Search */}
          <FrameworkList initialFrameworks={frameworks} />
        </div>
      </main>
    </div>
  );
}
