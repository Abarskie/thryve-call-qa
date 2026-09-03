"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FrameworkWithStats,
  duplicateFrameworkAction,
  toggleFrameworkStatusAction,
} from "@/app/actions/frameworks";
import type { Stage } from "@/types/database";
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
  const router = useRouter();
  const [frameworks, setFrameworks] = useState<FrameworkWithStats[]>(initialFrameworks);
  const [searchQuery, setSearchQuery] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setFrameworks(initialFrameworks);
  }, [initialFrameworks]);

  const filteredFrameworks = frameworks.filter(
    (fw) =>
      fw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fw.description &&
        fw.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function handleDuplicate(id: string) {
    setActingId(`dup-${id}`);
    startTransition(async () => {
      const res = await duplicateFrameworkAction(id);
      if (res.success && res.data) {
        const rawStages = Array.isArray(res.data.stages) ? (res.data.stages as unknown as Stage[]) : [];
        const reqCount = rawStages.reduce(
          (sum, s) => sum + (Array.isArray(s.requirements) ? s.requirements.length : 0),
          0
        );
        const newFw: FrameworkWithStats = {
          ...res.data,
          stages_count: rawStages.length,
          requirements_count: reqCount,
          total_weight: 100,
        };
        setFrameworks((prev) => [newFw, ...prev]);
      }
      router.refresh();
      setActingId(null);
    });
  }

  function handleToggleStatus(fw: FrameworkWithStats) {
    setActingId(`toggle-${fw.id}`);
    // Optimistic toggle
    setFrameworks((prev) =>
      prev.map((f) => (f.id === fw.id ? { ...f, active: !fw.active } : f))
    );
    startTransition(async () => {
      await toggleFrameworkStatusAction(fw.id, fw.active);
      router.refresh();
      setActingId(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search frameworks..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-[#131e32] border border-[#1e2e4a] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        <Link
          href="/frameworks/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Framework
        </Link>
      </div>

      {/* Framework Cards Grid */}
      {filteredFrameworks.length === 0 ? (
        <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-12 text-center shadow-sm">
          <GitFork className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-white text-sm">No frameworks found</p>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first sales framework to start evaluating agent calls"}
          </p>
          <Link
            href="/frameworks/new"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-md shadow-blue-600/30"
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
                className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between text-slate-200 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">{fw.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            fw.active
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
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
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {fw.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metrics Row */}
                  <div className="flex items-center gap-4 py-3 my-2 border-y border-[#1e2e4a] text-xs text-slate-400 font-medium">
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
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-[#182338] text-blue-400 border border-[#1e2e4a] rounded-lg">
                        {fw.total_weight}% Weight
                      </span>
                    </div>
                  </div>

                  {/* Stages Breakdown Chips */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Stages Breakdown
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {fw.stages.slice(0, 6).map((stage, idx) => (
                        <span
                          key={stage.id || idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#182338] border border-[#1e2e4a] px-2.5 py-1 rounded-lg text-slate-300"
                        >
                          <span className="font-semibold text-white">{stage.name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({stage.weight}%)</span>
                        </span>
                      ))}
                      {fw.stages.length > 6 && (
                        <span className="text-[10px] text-slate-500 self-center font-medium">
                          +{fw.stages.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#1e2e4a]">
                  <Link
                    href={`/frameworks/${fw.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 transition-all"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit Framework
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(fw.id)}
                      disabled={isDuplicating}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                      title="Duplicate Framework"
                      aria-label={`Duplicate ${fw.name}`}
                    >
                      {isDuplicating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(fw)}
                      disabled={isToggling}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        fw.active
                          ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                          : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      }`}
                      title={fw.active ? "Deactivate Framework" : "Activate Framework"}
                      aria-label={fw.active ? `Deactivate ${fw.name}` : `Activate ${fw.name}`}
                    >
                      {isToggling ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Power className="h-3.5 w-3.5" />
                      )}
                    </button>
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
