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
import type { CallFramework, Stage } from "@/types/database";
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
      name: "Pitch & Solution Alignment",
      order: 3,
      weight: 30,
      requirements: [
        { id: "req-3-1", text: "Present value proposition directly addressing discovered pains", order: 1 },
      ],
    },
    {
      id: "stage-4",
      name: "Closing & Next Steps",
      order: 4,
      weight: 20,
      requirements: [
        { id: "req-4-1", text: "Propose a concrete next step or meeting time", order: 1 },
      ],
    },
  ];

  const [stages, setStages] = useState<Stage[]>(
    initialFramework?.stages && initialFramework.stages.length > 0
      ? initialFramework.stages
      : defaultStages
  );

  // Calculate total weight
  const totalWeight = stages.reduce((acc, s) => acc + (Number(s.weight) || 0), 0);
  const isWeightValid = totalWeight === 100;

  function handleAddStage() {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: "",
      order: stages.length + 1,
      weight: 10,
      requirements: [
        { id: `req-${Date.now()}-1`, text: "", order: 1 }
      ],
    };
    setStages([...stages, newStage]);
  }

  function handleRemoveStage(index: number) {
    if (stages.length <= 1) return;
    setStages(stages.filter((_, i) => i !== index));
  }

  function handleMoveStage(index: number, direction: "up" | "down") {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stages.length) return;
    const nextStages = [...stages];
    const temp = nextStages[index];
    nextStages[index] = nextStages[targetIdx];
    nextStages[targetIdx] = temp;
    setStages(nextStages);
  }

  function handleUpdateStageName(index: number, newName: string) {
    const nextStages = [...stages];
    nextStages[index] = { ...nextStages[index], name: newName };
    setStages(nextStages);
  }

  function handleUpdateStageWeight(index: number, newWeight: number) {
    const nextStages = [...stages];
    nextStages[index] = { ...nextStages[index], weight: Math.max(0, Math.min(100, newWeight)) };
    setStages(nextStages);
  }

  function handleAddRequirement(stageIndex: number) {
    const nextStages = [...stages];
    const stage = nextStages[stageIndex];
    stage.requirements = [
      ...stage.requirements,
      { id: `req-${Date.now()}`, text: "", order: stage.requirements.length + 1 },
    ];
    setStages(nextStages);
  }

  function handleRemoveRequirement(stageIndex: number, reqIndex: number) {
    const nextStages = [...stages];
    const stage = nextStages[stageIndex];
    if (stage.requirements.length <= 1) return;
    stage.requirements = stage.requirements.filter((_, i) => i !== reqIndex);
    setStages(nextStages);
  }

  function handleUpdateRequirementText(
    stageIndex: number,
    reqIndex: number,
    text: string
  ) {
    const nextStages = [...stages];
    nextStages[stageIndex].requirements[reqIndex].text = text;
    setStages(nextStages);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a framework name.");
      return;
    }

    if (!isWeightValid) {
      setError(`Stage weights must sum to exactly 100%. Currently: ${totalWeight}%`);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-16 text-slate-100">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/frameworks"
            className="p-2.5 rounded-xl border border-[#1e2e4a] bg-[#131e32] text-slate-400 hover:text-white hover:bg-[#182338] transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEditing ? `Edit: ${initialFramework?.name}` : "Create Call Framework"}
            </h2>
            <p className="text-xs text-slate-400">
              Define the conversation stages and checklist items evaluated by AI in sales recordings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/frameworks"
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-[#131e32] border border-[#1e2e4a] rounded-xl hover:bg-[#182338] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/30 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEditing ? "Update Framework" : "Save Framework"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Framework Meta Card */}
      <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Framework Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Inbound Demo Qualification Framework"
            className="w-full px-3.5 py-2.5 text-xs bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Describe what type of calls this framework assesses and what quality standard is expected..."
            className="w-full px-3.5 py-2.5 text-xs bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Weight Progress Bar */}
      <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Total Score Weight:
            </span>
            <span
              className={`text-sm font-extrabold tabular-nums ${
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

          <div className="flex items-center gap-1.5 text-xs font-semibold">
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

        <div className="w-full bg-[#0e1726] rounded-full h-2.5 overflow-hidden flex border border-[#1e2e4a]">
          {stages.map((stage, idx) => {
            const colors = [
              "bg-blue-600",
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
            <Layers className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Evaluation Stages ({stages.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddStage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#131e32] border border-[#1e2e4a] rounded-xl hover:bg-[#182338] transition-colors shadow-sm"
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
                className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl shadow-sm p-6 space-y-4 transition-all"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e2e4a]">
                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="h-7 w-7 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-xs flex items-center justify-center shrink-0">
                      {sIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStageName(sIdx, e.target.value)}
                      placeholder={`Stage ${sIdx + 1} Title (e.g. Discovery)`}
                      className="font-bold text-sm text-white placeholder:text-slate-500 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 transition-colors flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {/* Weight Input */}
                    <div className="flex items-center gap-1 bg-[#0e1726] border border-[#1e2e4a] rounded-xl px-2.5 py-1">
                      <span className="text-xs font-medium text-slate-400">Weight:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={stage.weight}
                        onChange={(e) =>
                          handleUpdateStageWeight(sIdx, Number(e.target.value))
                        }
                        className="w-12 bg-transparent text-xs font-bold text-white focus:outline-none text-right"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-[#1e2e4a] rounded-xl overflow-hidden bg-[#0e1726]">
                      <button
                        type="button"
                        onClick={() => handleMoveStage(sIdx, "up")}
                        disabled={sIdx === 0}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-[#182338] transition-colors"
                        title="Move Stage Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStage(sIdx, "down")}
                        disabled={sIdx === stages.length - 1}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 hover:bg-[#182338] transition-colors"
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
                      className="p-1.5 rounded-xl border border-transparent text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Requirements Checklist ({stage.requirements.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddRequirement(sIdx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Requirement
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stage.requirements.map((req, rIdx) => {
                      return (
                        <div
                          key={req.id}
                          className="flex items-center gap-2 group bg-[#0e1726] hover:bg-[#182338]/80 rounded-xl p-2 border border-[#1e2e4a] transition-colors"
                        >
                          <span className="text-xs font-medium text-slate-500 w-5 text-center shrink-0">
                            {rIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={req.text}
                            onChange={(e) =>
                              handleUpdateRequirementText(sIdx, rIdx, e.target.value)
                            }
                            placeholder="e.g. Introduce yourself and mention company name"
                            className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none placeholder:text-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(sIdx, rIdx)}
                            disabled={stage.requirements.length <= 1}
                            className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:hidden focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
          className="w-full py-3.5 border-2 border-dashed border-[#1e2e4a] hover:border-slate-600 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 bg-[#131e32]/50 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Another Stage
        </button>
      </div>
    </form>
  );
}
