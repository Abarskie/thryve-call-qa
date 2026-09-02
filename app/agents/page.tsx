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
  const teamAvgScore = agentsWithScores.length > 0
    ? Math.round(
        (agentsWithScores.reduce((acc, a) => acc + (a.average_score ?? 0), 0) /
          agentsWithScores.length) *
          10
      ) / 10
    : null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight">
                Sales Agents
              </h1>
              <p className="text-[11px] text-slate-400">
                Team roster, status control & performance statistics
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
                  Total Agents
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
                {totalAgents}
              </div>
              <p className="mt-1 text-xs text-slate-400">Registered in workspace</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Active Now
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {activeAgents}
              </div>
              <p className="mt-1 text-xs text-slate-400">Receiving call audits</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Team Average Score
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-indigo-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
                {teamAvgScore !== null ? `${teamAvgScore}%` : "—"}
              </div>
              <p className="mt-1 text-xs text-slate-400">Across evaluated calls</p>
            </div>
          </div>

          {/* Table Container */}
          <AgentTable initialAgents={agents} />
        </div>
      </main>
    </div>
  );
}
