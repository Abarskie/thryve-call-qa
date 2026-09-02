"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import type { CallFramework, Stage, Requirement } from "@/types/database";
import {
  createFrameworkAction,
  updateFrameworkAction,
} from "@/app/actions/frameworks";

interface FrameworkEditorProps {
  initialFramework?: CallFramework | null;
}

export function FrameworkEditor({ initialFramework }: FrameworkEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(initialFramework);

  // Form states
  const [name, setName] = useState(initialFramework?.name ?? "");
  const [description, setDescription] = useState(
    initialFramework?.description ?? ""
  );

  const defaultStages: Stage[] = [
    {
      id: "stage-1",
      name: "Opening",
      order: 1,
      weight: 15,
      requirements: [
        { id: "req-1-1", text: "Introduce yourself and state your company name clearly", order: 1 },
        { id: "req-1-2", text: "State the specific reason for your call", order: 2 },
      ],
    },
    {
      id: "stage-2",
      name: "Discovery & Needs Analysis",
      order: 2,
      weight: 35,
      requirements: [
        { id: "req-2-1", text: "Ask open-ended questions about current workflow or challenges", order: 1 },
        { id: "req-2-2", text: "Identify decision makers and current timeline", order: 2 },
      ],
    },
    {
      id: "stage-3",
      name: "Value Proposition & Offer",
      order: 3,
      weight: 30,
      requirements: [
        { id: "req-3-1", text: "Tailor the pitch directly to prospect's identified pain points", order: 1 },
      ],
    },
    {
      id: "stage-4",
      name: "Close & Next Steps",
      order: 4,
      weight: 20,
      requirements: [
        { id: "req-4-1", text: "Propose a concrete date and time for follow-up demo", order: 1 },
        { id: "req-4-2", text: "Confirm contact details and send calendar invitation", order: 2 },
      ],
    },
  ];

  const [stages, setStages] = useState<Stage[]>(
    initialFramework?.stages && initialFramework.stages.length > 0
      ? initialFramework.stages
      : defaultStages
  );

  // Calculate live total weight
  const totalWeight = stages.reduce((acc, s) => acc + Number(s.weight || 0), 0);
  const isWeightValid = totalWeight === 100;

  // Handlers for Stages
  function handleAddStage() {
    const newOrder = stages.length + 1;
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: "",
      order: newOrder,
      weight: Math.max(0, 100 - totalWeight),
      requirements: [
        {
          id: `req-${Date.now()}-1`,
          text: "",
          order: 1,
        },
      ],
    };
    setStages([...stages, newStage]);
  }

  function handleRemoveStage(index: number) {
    if (stages.length <= 1) {
      setError("A framework must have at least one stage.");
      return;
    }
    const updated = stages
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setStages(updated);
  }

  function handleMoveStage(index: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;

    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[targetIdx];
    newStages[targetIdx] = temp;

    setStages(newStages.map((s, i) => ({ ...s, order: i + 1 })));
  }

  function handleUpdateStageName(index: number, value: string) {
    const updated = [...stages];
    updated[index] = { ...updated[index], name: value };
    setStages(updated);
  }

  function handleUpdateStageWeight(index: number, value: number) {
    const updated = [...stages];
    updated[index] = { ...updated[index], weight: Math.max(0, Math.min(100, value)) };
    setStages(updated);
  }

  // Handlers for Requirements inside Stages
  function handleAddRequirement(stageIndex: number) {
    const stage = stages[stageIndex];
    const newReq: Requirement = {
      id: `req-${Date.now()}-${stage.requirements.length + 1}`,
      text: "",
      order: stage.requirements.length + 1,
    };
    const updated = [...stages];
    updated[stageIndex] = {
      ...stage,
      requirements: [...stage.requirements, newReq],
    };
    setStages(updated);
  }

  function handleRemoveRequirement(stageIndex: number, reqIndex: number) {
    const stage = stages[stageIndex];
    if (stage.requirements.length <= 1) {
      setError(`Stage "${stage.name || `Stage ${stageIndex + 1}`}" must have at least one requirement.`);
      return;
    }
    const updatedReqs = stage.requirements
      .filter((_, i) => i !== reqIndex)
      .map((r, i) => ({ ...r, order: i + 1 }));

    const updated = [...stages];
    updated[stageIndex] = {
      ...stage,
      requirements: updatedReqs,
    };
    setStages(updated);
  }

  function handleUpdateRequirementText(stageIndex: number, reqIndex: number, text: string) {
    const stage = stages[stageIndex];
    const updatedReqs = [...stage.requirements];
    updatedReqs[reqIndex] = { ...updatedReqs[reqIndex], text };

    const updated = [...stages];
    updated[stageIndex] = { ...stage, requirements: updatedReqs };
    setStages(updated);
  }

  // Form submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide a name for this framework.");
      return;
    }

    if (stages.length === 0) {
      setError("A framework must have at least one stage.");
      return;
    }

    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      if (!s.name.trim()) {
        setError(`Stage ${i + 1} is missing a name.`);
        return;
      }
      for (let j = 0; j < s.requirements.length; j++) {
        if (!s.requirements[j].text.trim()) {
          setError(`Requirement ${j + 1} in Stage "${s.name}" cannot be empty.`);
          return;
        }
      }
    }

    startTransition(async () => {
      const payload = {
        name,
        description,
        stages: stages.map((s, idx) => ({
          ...s,
          order: idx + 1,
          weight: Number(s.weight),
          requirements: s.requirements.map((r, rIdx) => ({
            ...r,
            order: rIdx + 1,
          })),
        })),
      };

      const result = isEditing && initialFramework
        ? await updateFrameworkAction(initialFramework.id, payload)
        : await createFrameworkAction(payload);

      if (!result.success) {
        setError(result.error ?? "Failed to save framework.");
      } else {
        router.push("/frameworks");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-16 text-slate-200">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/frameworks"
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEditing ? `Edit: ${initialFramework?.name}` : "Create Call Framework"}
            </h2>
            <p className="text-xs text-slate-400">
              Define the required stages and checklist items AI evaluates in sales recordings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/frameworks"
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-950/60 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEditing ? "Update Framework" : "Save Framework"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs font-medium text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Framework Meta Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 shadow-sm space-y-4 backdrop-blur-sm">
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Framework Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Inbound Demo Qualification Framework"
            className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Describe what type of calls this framework assesses and what quality standard is expected..."
            className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Weight Progress Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Total Score Weight:
            </span>
            <span
              className={`text-sm font-extrabold font-mono tabular-nums ${
                isWeightValid
                  ? "text-emerald-400"
                  : totalWeight > 100
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {totalWeight}% / 100%
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono font-medium">
            {isWeightValid ? (
              <span className="text-emerald-400 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Perfect 100% distribution
              </span>
            ) : totalWeight > 100 ? (
              <span className="text-rose-400 inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Over limit by {totalWeight - 100}%
              </span>
            ) : (
              <span className="text-amber-400 inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> {100 - totalWeight}% remaining
              </span>
            )}
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden flex border border-slate-800">
          {stages.map((stage, idx) => {
            const colors = [
              "bg-indigo-500",
              "bg-emerald-500",
              "bg-cyan-500",
              "bg-amber-500",
              "bg-purple-500",
              "bg-rose-500",
            ];
            const color = colors[idx % colors.length];
            return (
              <div
                key={stage.id}
                style={{ width: `${Math.max(0, Math.min(100, stage.weight))}%` }}
                className={`h-full ${color} transition-all duration-300`}
                title={`${stage.name || `Stage ${idx + 1}`}: ${stage.weight}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Stages Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Evaluation Stages ({stages.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddStage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Stage
          </button>
        </div>

        {/* Stages List */}
        <div className="space-y-4">
          {stages.map((stage, sIdx) => {
            return (
              <div
                key={stage.id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl shadow-sm p-5 space-y-4 transition-all backdrop-blur-sm"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {sIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStageName(sIdx, e.target.value)}
                      placeholder={`Stage ${sIdx + 1} Title (e.g. Discovery)`}
                      className="font-semibold text-sm text-white placeholder:text-slate-500 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5 transition-colors flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {/* Weight Input */}
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
                      <span className="text-xs font-mono text-slate-500">Weight:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={stage.weight}
                        onChange={(e) =>
                          handleUpdateStageWeight(sIdx, Number(e.target.value))
                        }
                        className="w-12 bg-transparent text-xs font-bold font-mono text-white focus:outline-none text-right"
                      />
                      <span className="text-xs font-bold font-mono text-slate-400">%</span>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                      <button
                        type="button"
                        onClick={() => handleMoveStage(sIdx, "up")}
                        disabled={sIdx === 0}
                        className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30 hover:bg-slate-900 transition-colors"
                        title="Move Stage Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStage(sIdx, "down")}
                        disabled={sIdx === stages.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30 hover:bg-slate-900 transition-colors"
                        title="Move Stage Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete Stage */}
                    <button
                      type="button"
                      onClick={() => handleRemoveStage(sIdx)}
                      disabled={stages.length <= 1}
                      className="p-1.5 rounded-lg border border-slate-800 text-rose-400 hover:border-rose-700 hover:bg-rose-950/60 transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      title="Delete Stage"
                      aria-label={`Delete Stage ${sIdx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stage Requirements Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                      Requirements Checklist ({stage.requirements.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddRequirement(sIdx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Requirement
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stage.requirements.map((req, rIdx) => {
                      return (
                        <div
                          key={req.id}
                          className="flex items-center gap-2 group bg-slate-950/80 hover:bg-slate-950 rounded-lg p-2 border border-slate-800/80 transition-colors"
                        >
                          <span className="text-xs font-mono text-slate-500 w-5 text-center shrink-0">
                            {rIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={req.text}
                            onChange={(e) =>
                              handleUpdateRequirementText(sIdx, rIdx, e.target.value)
                            }
                            placeholder="e.g. Introduce yourself and mention company name"
                            className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(sIdx, rIdx)}
                            disabled={stage.requirements.length <= 1}
                            className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:bg-rose-950/60 rounded transition-all disabled:hidden focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                            title="Delete Requirement"
                            aria-label={`Delete Requirement ${rIdx + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Stage Bottom Button */}
        <button
          type="button"
          onClick={handleAddStage}
          className="w-full py-3 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 bg-slate-900/30"
        >
          <Plus className="h-4 w-4" />
          Add Another Stage
        </button>
      </div>
    </form>
  );
}
