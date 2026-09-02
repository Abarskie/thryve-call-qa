"use client";

import { useState, useTransition } from "react";
import { type AgentWithStats, toggleAgentStatusAction } from "@/app/actions/agents";
import { AgentModal } from "@/components/agents/agent-modal";
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

interface AgentTableProps {
  initialAgents: AgentWithStats[];
}

export function AgentTable({ initialAgents }: AgentTableProps) {
  const [agents, setAgents] = useState<AgentWithStats[]>(initialAgents);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentWithStats | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Filter agents by search query
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleOpenCreate() {
    setSelectedAgent(null);
    setModalOpen(true);
  }

  function handleOpenEdit(agent: AgentWithStats) {
    setSelectedAgent(agent);
    setModalOpen(true);
  }

  function handleToggleStatus(agent: AgentWithStats) {
    setTogglingId(agent.id);
    startTransition(async () => {
      const res = await toggleAgentStatusAction(agent.id, !agent.active);
      if (res.success && res.data) {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agent.id ? { ...a, active: res.data!.active } : a
          )
        );
      }
      setTogglingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by name or email..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Agent
        </button>
      </div>

      {/* Agents Table Card */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-6">Agent Name</th>
                <th className="py-3.5 px-6">Email</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Calls Analyzed</th>
                <th className="py-3.5 px-6">Avg Score</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                    <p className="font-medium text-neutral-700">No agents found</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {searchQuery ? "Try a different search query" : "Click 'Add Agent' to register a sales rep"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => {
                  const isToggling = togglingId === agent.id;

                  return (
                    <tr
                      key={agent.id}
                      className="hover:bg-neutral-50/70 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-6 font-medium text-neutral-900">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-xs text-neutral-700">
                            {agent.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-neutral-800">{agent.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-6 text-neutral-500 font-medium text-xs">
                        {agent.email}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            agent.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          {agent.active ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-neutral-400" />
                          )}
                          {agent.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Calls count */}
                      <td className="py-3.5 px-6 text-neutral-600 font-semibold tabular-nums">
                        {agent.calls_count}
                      </td>

                      {/* Average score */}
                      <td className="py-3.5 px-6 font-semibold">
                        {agent.average_score !== null ? (
                          <span
                            className={`tabular-nums text-sm font-bold ${
                              agent.average_score >= 80
                                ? "text-emerald-600"
                                : agent.average_score >= 70
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}
                          >
                            {agent.average_score}%
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(agent)}
                            className="p-1.5 rounded-lg border border-transparent text-neutral-400 hover:border-neutral-200 hover:text-neutral-800 hover:bg-neutral-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            title="Edit agent"
                            aria-label={`Edit ${agent.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(agent)}
                            disabled={isToggling}
                            className={`p-1.5 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                              agent.active
                                ? "border-neutral-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                                : "border-neutral-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                            title={agent.active ? "Deactivate agent" : "Activate agent"}
                            aria-label={agent.active ? `Deactivate ${agent.name}` : `Activate ${agent.name}`}
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
        isOpen={modalOpen}
        agent={selectedAgent}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
