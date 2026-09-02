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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frameworks..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <Link
          href="/frameworks/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Framework
        </Link>
      </div>

      {/* Framework Cards Grid */}
      {filteredFrameworks.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-12 text-center shadow-sm backdrop-blur-sm">
          <GitFork className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-300 text-sm">No frameworks found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first sales framework to start evaluating agent calls"}
          </p>
          <Link
            href="/frameworks/new"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Framework
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFrameworks.map((fw) => {
            const isDuplicating = actingId === `dup-${fw.id}`;
            const isToggling = actingId === `toggle-${fw.id}`;

            return (
              <div
                key={fw.id}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between backdrop-blur-sm text-slate-200 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{fw.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                            fw.active
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                              : "bg-slate-900 text-slate-400 border border-slate-800"
                          }`}
                        >
                          {fw.active ? (
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                          ) : (
                            <XCircle className="h-2.5 w-2.5 text-slate-500" />
                          )}
                          {fw.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {fw.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metrics Row */}
                  <div className="flex items-center gap-4 py-2.5 my-2 border-y border-slate-800/80 text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        <strong className="text-white tabular-nums">{fw.stages_count}</strong> Stages
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        <strong className="text-white tabular-nums">{fw.requirements_count}</strong> Items
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-200 rounded">
                        {fw.total_weight}% Weight
                      </span>
                    </div>
                  </div>

                  {/* Stages Pills Preview */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      Stages Breakdown
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {fw.stages.slice(0, 6).map((stage, idx) => (
                        <span
                          key={stage.id || idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300"
                        >
                          <span className="font-semibold text-white">{stage.name}</span>
                          <span className="text-slate-500 font-mono text-[10px]">({stage.weight}%)</span>
                        </span>
                      ))}
                      {fw.stages.length > 6 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{fw.stages.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Updated {new Date(fw.updated_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(fw.id)}
                      disabled={isDuplicating}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700/80 rounded-lg hover:bg-slate-800 transition-colors"
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
                      className={`p-1.5 rounded-lg border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        fw.active
                          ? "border-slate-800 text-rose-400 hover:border-rose-700 hover:bg-rose-950/60"
                          : "border-slate-800 text-emerald-400 hover:border-emerald-700 hover:bg-emerald-950/60"
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
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
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
