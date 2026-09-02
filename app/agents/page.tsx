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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Agents</h1>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Sales Agents
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage team members, monitor quality scores, and review call compliance.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Agents
                </span>
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {totalAgents}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Enrolled sales reps</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Agents
                </span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {activeAgents}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Available for calls</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Team Avg Score
                </span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {teamAvgScore !== null ? `${teamAvgScore}%` : "—"}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Across analyzed calls</p>
            </div>
          </div>

          {/* Agents Table */}
          <AgentTable initialAgents={agents} />
        </div>
      </main>
    </div>
  );
}
