"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { createAgentAction, updateAgentAction, type AgentWithStats } from "@/app/actions/agents";
import { X, Loader2, UserPlus, Pencil } from "lucide-react";

interface AgentModalProps {
  open?: boolean;
  isOpen?: boolean;
  agent?: AgentWithStats | null;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (agent: AgentWithStats) => void;
}

export function AgentModal({
  open,
  isOpen,
  agent,
  onClose,
  onOpenChange,
  onSuccess,
}: AgentModalProps) {
  const show = open ?? isOpen ?? false;
  const isEditing = !!agent;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setEmail(agent.email);
    } else {
      setName("");
      setEmail("");
    }
    setError(null);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (show) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [agent, show, handleClose]);

  if (!show) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the agent's name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const result = isEditing && agent
        ? await updateAgentAction(agent.id, { name, email })
        : await createAgentAction({ name, email });

      if (!result.success || !result.data) {
        setError(result.error ?? "An error occurred.");
      } else {
        const fullAgent: AgentWithStats = {
          ...result.data,
          calls_count: agent?.calls_count ?? 0,
          average_score: agent?.average_score ?? null,
        };
        onSuccess?.(fullAgent);
        handleClose();
      }
    });
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="bg-[#131e32] rounded-2xl shadow-2xl border border-[#1e2e4a] w-full max-w-md overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1e2e4a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Pencil className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <UserPlus className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-white">
                {isEditing ? "Edit Sales Agent" : "Add Sales Agent"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? "Update agent details and contact information"
                  : "Register a sales rep for automated call compliance scoring"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="agent-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name *
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                disabled={isPending}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="agent-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address *
              </label>
              <input
                id="agent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@company.com"
                disabled={isPending}
                className="w-full px-3.5 py-2.5 text-xs bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#0e1726]/80 border-t border-[#1e2e4a] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-[#182338] border border-[#1e2e4a] rounded-xl hover:bg-[#1e2e4a] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
