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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden text-neutral-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Pencil className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <UserPlus className="h-4 w-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {isEditing ? "Edit Sales Agent" : "Add Sales Agent"}
              </h3>
              <p className="text-xs text-neutral-400">
                {isEditing
                  ? "Update agent details and contact information"
                  : "Register a sales rep for automated call compliance scoring"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="agent-name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Full Name *
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Connor"
                disabled={isPending}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-neutral-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="agent-email" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Email Address *
              </label>
              <input
                id="agent-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@company.com"
                disabled={isPending}
                className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-neutral-400 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-100 disabled:opacity-50"
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
