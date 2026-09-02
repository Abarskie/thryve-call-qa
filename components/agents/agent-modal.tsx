"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Loader2, UserPlus, Pencil } from "lucide-react";
import { createAgentAction, updateAgentAction, type AgentWithStats } from "@/app/actions/agents";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentWithStats | null;
  onSuccess?: () => void;
}

export function AgentModal({ isOpen, onClose, agent, onSuccess }: AgentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(agent);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setEmail(agent.email);
    } else {
      setName("");
      setEmail("");
    }
    setError(null);
  }, [agent, isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Pencil className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <UserPlus className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isEditing ? "Edit Agent" : "Add New Agent"}
              </h3>
              <p className="text-xs text-slate-500">
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
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="agent-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                disabled={isPending}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="agent-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="agent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                disabled={isPending}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
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
