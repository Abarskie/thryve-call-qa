import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
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
  const teamAvgScore = agentsWithScores.length > 0
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
      bg: "bg-indigo-50 text-indigo-600",
    },
    {
      name: "Active Now",
      value: activeAgents,
      sub: "Receiving call audits",
      icon: UserCheck,
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "Team Avg Score",
      value: teamAvgScore !== null ? `${teamAvgScore}%` : "—",
      sub: "Across evaluated calls",
      icon: Award,
      bg: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      {/* Admina Twin Sidebar */}
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Admina Topbar */}
        <Topbar />

        {/* Content */}
        <div className="p-8 space-y-7 flex-1">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Sales Agents
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage team members, monitor quality compliance scores, and review call histories.
            </p>
          </div>

          {/* Admina Stat Cards */}
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

          {/* Table Container */}
          <AgentTable initialAgents={agents} />
        </div>
      </main>
    </div>
  );
}
