"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  type FrameworkWithStats,
  duplicateFrameworkAction,
  toggleFrameworkStatusAction,
} from "@/app/actions/frameworks";
import {
  Search,
  Plus,
  GitFork,
  CheckCircle2,
  XCircle,
  Pencil,
  Copy,
  Power,
  Layers,
  ListChecks,
  Loader2,
} from "lucide-react";

interface FrameworkListProps {
  initialFrameworks: FrameworkWithStats[];
}

export function FrameworkList({ initialFrameworks }: FrameworkListProps) {
  const [frameworks] = useState<FrameworkWithStats[]>(initialFrameworks);
  const [searchQuery, setSearchQuery] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filteredFrameworks = frameworks.filter(
    (fw) =>
      fw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fw.description &&
        fw.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function handleDuplicate(id: string) {
    setActingId(`dup-${id}`);
    startTransition(async () => {
      await duplicateFrameworkAction(id);
      setActingId(null);
    });
  }

  function handleToggleStatus(fw: FrameworkWithStats) {
    setActingId(`toggle-${fw.id}`);
    startTransition(async () => {
      await toggleFrameworkStatusAction(fw.id, fw.active);
      setActingId(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frameworks..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>

        <Link
          href="/frameworks/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs shadow-indigo-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Framework
        </Link>
      </div>

      {/* Framework Cards Grid */}
      {filteredFrameworks.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-xs">
          <GitFork className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
          <p className="font-semibold text-neutral-800 text-sm">No frameworks found</p>
          <p className="text-xs text-neutral-400 mt-1">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first sales framework to start evaluating agent calls"}
          </p>
          <Link
            href="/frameworks/new"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Framework
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredFrameworks.map((fw) => {
            const isDuplicating = actingId === `dup-${fw.id}`;
            const isToggling = actingId === `toggle-${fw.id}`;

            return (
              <div
                key={fw.id}
                className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between text-neutral-800 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-900 text-sm">{fw.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            fw.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          {fw.active ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                          ) : (
                            <XCircle className="h-2.5 w-2.5 text-neutral-400" />
                          )}
                          {fw.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {fw.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metrics Row */}
                  <div className="flex items-center gap-4 py-3 my-2 border-y border-neutral-100 text-xs text-neutral-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-neutral-400" />
                      <span>
                        <strong className="text-neutral-900 tabular-nums">{fw.stages_count}</strong> Stages
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5 text-neutral-400" />
                      <span>
                        <strong className="text-neutral-900 tabular-nums">{fw.requirements_count}</strong> Items
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-lg">
                        {fw.total_weight}% Weight
                      </span>
                    </div>
                  </div>

                  {/* Stages Breakdown Chips */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block">
                      Stages Breakdown
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {fw.stages.slice(0, 6).map((stage, idx) => (
                        <span
                          key={stage.id || idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-lg text-neutral-700"
                        >
                          <span className="font-semibold text-neutral-900">{stage.name}</span>
                          <span className="text-neutral-400 font-mono text-[10px]">({stage.weight}%)</span>
                        </span>
                      ))}
                      {fw.stages.length > 6 && (
                        <span className="text-[10px] text-neutral-400 self-center font-medium">
                          +{fw.stages.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-neutral-400">
                    Updated {new Date(fw.updated_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(fw.id)}
                      disabled={isDuplicating}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-2xs"
                      title="Duplicate framework"
                    >
                      {isDuplicating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Duplicate
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(fw)}
                      disabled={isToggling}
                      className={`p-1.5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        fw.active
                          ? "border-neutral-200 text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                          : "border-neutral-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                      title={fw.active ? "Deactivate framework" : "Activate framework"}
                      aria-label={fw.active ? `Deactivate ${fw.name}` : `Activate ${fw.name}`}
                    >
                      {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Power className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Edit */}
                    <Link
                      href={`/frameworks/${fw.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shadow-indigo-100"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
