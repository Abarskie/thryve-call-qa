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

  const statCards = [
    {
      name: "Total Frameworks",
      value: totalFrameworks,
      sub: "Defined call playbooks",
      icon: GitFork,
      bg: "bg-indigo-50 text-indigo-600",
    },
    {
      name: "Active Playbooks",
      value: activeFrameworks,
      sub: "Ready for call scoring",
      icon: CheckCircle2,
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "Configured Stages",
      value: totalStages,
      sub: "Total across frameworks",
      icon: Layers,
      bg: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 space-y-7 flex-1">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Call Frameworks
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
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
                  className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} shadow-xs`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
                      {stat.name}
                    </span>
                    <div className="mt-1 text-2xl font-bold text-neutral-900 tabular-nums">
                      {stat.value}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-medium">
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
