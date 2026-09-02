"use client";

import { useState, useTransition, useEffect } from "react";
import { createAgentAction, updateAgentAction, type AgentWithStats } from "@/app/actions/agents";
import { X, Loader2, UserPlus, Pencil } from "lucide-react";

interface AgentModalProps {
  isOpen: boolean;
  agent?: AgentWithStats | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AgentModal({ isOpen, agent, onClose, onSuccess }: AgentModalProps) {
  const isEditing = !!agent;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [agent, isOpen, onClose]);

  if (!isOpen) return null;

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

      if (!result.success) {
        setError(result.error ?? "An error occurred.");
      } else {
        onSuccess?.();
        onClose();
      }
    });
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 w-full max-w-md overflow-hidden text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                <Pencil className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <UserPlus className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-white">
                {isEditing ? "Edit Agent" : "Add New Agent"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? "Update agent details and contact information"
                  : "Add a sales rep to monitor and score call compliance"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs font-medium text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="agent-name" className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                disabled={isPending}
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="agent-email" className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="agent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                disabled={isPending}
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/60 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-950/60 disabled:opacity-50"
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
