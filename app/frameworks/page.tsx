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

  const statCards = [
    {
      name: "Total Frameworks",
      value: totalFrameworks,
      sub: "Defined call playbooks",
      icon: GitFork,
      bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      name: "Active Playbooks",
      value: activeFrameworks,
      sub: "Ready for call scoring",
      icon: CheckCircle2,
      bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    {
      name: "Configured Stages",
      value: totalStages,
      sub: "Total across frameworks",
      icon: Layers,
      bg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-7 flex-1">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Call Frameworks
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Define required conversation structures, weighted stages, and checklist requirements for automated QA scoring.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-colors flex items-center gap-4"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} shadow-inner`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                      {stat.name}
                    </span>
                    <div className="mt-1 text-2xl font-bold text-white tabular-nums">
                      {stat.value}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {stat.sub}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* List Component */}
          <FrameworkList initialFrameworks={frameworks} />
        </div>
      </main>
    </div>
  );
}
