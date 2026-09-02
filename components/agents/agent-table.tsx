"use client";

import { useState, useTransition } from "react";
import {
  Search,
  UserPlus,
  Pencil,
  Power,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
} from "lucide-react";
import { toggleAgentStatusAction, type AgentWithStats } from "@/app/actions/agents";
import { AgentModal } from "@/components/agents/agent-modal";

interface AgentTableProps {
  initialAgents: AgentWithStats[];
}

export function AgentTable({ initialAgents }: AgentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithStats | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filteredAgents = initialAgents.filter((agent) => {
    const q = searchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(q) || agent.email.toLowerCase().includes(q);
  });

  function handleOpenCreate() {
    setSelectedAgent(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(agent: AgentWithStats) {
    setSelectedAgent(agent);
    setIsModalOpen(true);
  }

  function handleToggleStatus(agent: AgentWithStats) {
    setTogglingId(agent.id);
    startTransition(async () => {
      await toggleAgentStatusAction(agent.id, agent.active);
      setTogglingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Agent
        </button>
      </div>

      {/* Agents Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-6">Agent Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Calls Analyzed</th>
                <th className="py-3 px-6">Avg Score</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-slate-600">No agents found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery ? "Try a different search query" : "Click 'Add Agent' to create your first sales rep"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => {
                  const isToggling = togglingId === agent.id;
                  const initials = agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name with Avatar */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{agent.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-6 text-slate-600 font-mono text-xs">
                        {agent.email}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            agent.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {agent.active ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {agent.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Calls count */}
                      <td className="py-3.5 px-6 font-medium text-slate-700">
                        {agent.calls_count}
                      </td>

                      {/* Average score */}
                      <td className="py-3.5 px-6 font-semibold">
                        {agent.average_score !== null ? (
                          <span
                            className={
                              agent.average_score >= 80
                                ? "text-emerald-700"
                                : agent.average_score >= 70
                                ? "text-amber-700"
                                : "text-rose-700"
                            }
                          >
                            {agent.average_score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(agent)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit agent"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(agent)}
                            disabled={isToggling}
                            className={`p-1.5 rounded-md transition-colors ${
                              agent.active
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={agent.active ? "Deactivate agent" : "Activate agent"}
                          >
                            {isToggling ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agent={selectedAgent}
      />
    </div>
  );
}
