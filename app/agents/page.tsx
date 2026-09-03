import { Sidebar } from "@/components/layout/sidebar";
import { getAgentsAction } from "@/app/actions/agents";
import { AgentTable } from "@/components/agents/agent-table";
import { Users, UserCheck, Award } from "lucide-react";

export const revalidate = 0;

export default async function AgentsPage() {
  const result = await getAgentsAction();
  const agents = result.success && result.data ? result.data : [];

  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.active).length;

  const agentsWithScores = agents.filter((a) => a.average_score !== null);
  const teamAvgScore =
    agentsWithScores.length > 0
      ? Math.round(
          (agentsWithScores.reduce((acc, a) => acc + (a.average_score ?? 0), 0) /
            agentsWithScores.length) *
            10
        ) / 10
      : null;

  const statCards = [
    {
      name: "Total Agents",
      value: totalAgents,
      sub: "Registered in workspace",
      icon: Users,
      bg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      name: "Active Now",
      value: activeAgents,
      sub: "Receiving call audits",
      icon: UserCheck,
      bg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    {
      name: "Team Avg Score",
      value: teamAvgScore !== null ? `${teamAvgScore}%` : "—",
      sub: "Across evaluated calls",
      icon: Award,
      bg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 space-y-7 flex-1">
          {/* Page Header */}
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Sales Agents
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage team members, monitor quality compliance scores, and review call histories.
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

          {/* Table Container */}
          <AgentTable initialAgents={agents} />
        </div>
      </main>
    </div>
  );
}
