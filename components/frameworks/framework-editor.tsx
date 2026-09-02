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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/frameworks"
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isEditing ? `Edit: ${initialFramework?.name}` : "Create Call Framework"}
            </h2>
            <p className="text-xs text-slate-500">
              Define the required stages and checklist items AI evaluates in sales recordings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/frameworks"
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEditing ? "Update Framework" : "Save Framework"}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Framework Meta Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Framework Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Inbound Demo Qualification Framework"
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Describe what type of calls this framework assesses and what quality standard is expected..."
            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Weight Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Total Score Weight:
            </span>
            <span
              className={`text-sm font-extrabold ${
                isWeightValid
                  ? "text-emerald-700"
                  : totalWeight > 100
                  ? "text-rose-600"
                  : "text-amber-600"
              }`}
            >
              {totalWeight}% / 100%
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium">
            {isWeightValid ? (
              <span className="text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Perfect 100% distribution
              </span>
            ) : totalWeight > 100 ? (
              <span className="text-rose-600 inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Over limit by {totalWeight - 100}%
              </span>
            ) : (
              <span className="text-amber-600 inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> {100 - totalWeight}% remaining
              </span>
            )}
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
          {stages.map((stage, idx) => {
            const colors = [
              "bg-indigo-500",
              "bg-emerald-500",
              "bg-sky-500",
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
            <Layers className="h-4 w-4 text-slate-600" />
            <h3 className="text-base font-bold text-slate-900">
              Evaluation Stages ({stages.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddStage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
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
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4 transition-all"
              >
                {/* Stage Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {sIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStageName(sIdx, e.target.value)}
                      placeholder={`Stage ${sIdx + 1} Title (e.g. Discovery)`}
                      className="font-semibold text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:outline-none px-1 py-0.5 transition-colors flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    {/* Weight Input */}
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                      <span className="text-xs font-medium text-slate-500">Weight:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={stage.weight}
                        onChange={(e) =>
                          handleUpdateStageWeight(sIdx, Number(e.target.value))
                        }
                        className="w-12 bg-transparent text-xs font-bold text-slate-900 focus:outline-none text-right"
                      />
                      <span className="text-xs font-bold text-slate-700">%</span>
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => handleMoveStage(sIdx, "up")}
                        disabled={sIdx === 0}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                        title="Move Stage Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveStage(sIdx, "down")}
                        disabled={sIdx === stages.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-colors"
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
                      className="p-1.5 rounded-lg border border-transparent text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Requirements Checklist ({stage.requirements.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddRequirement(sIdx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      <Plus className="h-3 w-3" /> Add Requirement
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stage.requirements.map((req, rIdx) => {
                      return (
                        <div
                          key={req.id}
                          className="flex items-center gap-2 group bg-slate-50/60 hover:bg-slate-50 rounded-lg p-1.5 border border-slate-200/70 transition-colors"
                        >
                          <span className="text-xs font-medium text-slate-400 w-5 text-center shrink-0">
                            {rIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={req.text}
                            onChange={(e) =>
                              handleUpdateRequirementText(sIdx, rIdx, e.target.value)
                            }
                            placeholder="e.g. Introduce yourself and mention company name"
                            className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(sIdx, rIdx)}
                            disabled={stage.requirements.length <= 1}
                            className="opacity-0 group-hover:opacity-100 p-1 text-rose-600 hover:bg-rose-50 rounded transition-all disabled:hidden focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
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
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all flex items-center justify-center gap-2 bg-white"
        >
          <Plus className="h-4 w-4" />
          Add Another Stage
        </button>
      </div>
    </form>
  );
}
