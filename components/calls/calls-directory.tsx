"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Clock,
  Plus,
  ChevronRight,
  Filter,
  XCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { deleteCallAction, type DashboardCall } from "@/app/actions/calls";

interface CallsDirectoryProps {
  initialCalls: DashboardCall[];
  passingThreshold?: number;
}

export function CallsDirectory({
  initialCalls,
  passingThreshold = 75,
}: CallsDirectoryProps) {
  const [calls, setCalls] = useState<DashboardCall[]>(initialCalls);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [stoppingId, setStoppingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [deleteConfirmCall, setDeleteConfirmCall] = useState<DashboardCall | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const passThreshold = passingThreshold;
  const partialThreshold = Math.round(passingThreshold * 0.8);

  const handleRetry = async (callId: string) => {
    setRetryingId(callId);
    try {
      setCalls((prev) =>
        prev.map((c) => (c.id === callId ? { ...c, status: "PENDING" } : c))
      );
      const res = await fetch(`/api/calls/${callId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retry: true }),
      });
      if (!res.ok) {
        setCalls((prev) =>
          prev.map((c) => (c.id === callId ? { ...c, status: "FAIL" } : c))
        );
      }
    } catch (err) {
      console.error("Failed to retry audit:", err);
      setCalls((prev) =>
        prev.map((c) => (c.id === callId ? { ...c, status: "FAIL" } : c))
      );
    } finally {
      setRetryingId(null);
    }
  };

  const handleStop = async (callId: string) => {
    setStoppingId(callId);
    try {
      const res = await fetch(`/api/calls/${callId}/stop`, {
        method: "POST",
      });
      if (res.ok) {
        setCalls((prev) =>
          prev.map((c) =>
            c.id === callId ? { ...c, status: "FAIL" } : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to stop audit:", err);
    } finally {
      setStoppingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCall) return;
    setIsDeleting(true);
    try {
      const res = await deleteCallAction(deleteConfirmCall.id);
      if (res.success) {
        setCalls((prev) => prev.filter((c) => c.id !== deleteConfirmCall.id));
        setDeleteConfirmCall(null);
      } else {
        alert(res.error || "Failed to delete call recording.");
      }
    } catch (err) {
      console.error("Failed to delete call:", err);
      alert("Failed to delete call recording.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.agentName.toLowerCase().includes(search.toLowerCase()) ||
      call.frameworkName.toLowerCase().includes(search.toLowerCase()) ||
      call.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      call.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131e32] border border-[#1e2e4a] p-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by agent name, framework, or tracking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0e1726] border border-[#1e2e4a] text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PASS">Compliant (PASS)</option>
            <option value="PARTIAL">Partial Compliance</option>
            <option value="FAIL">Non-Compliant (FAIL)</option>
            <option value="PENDING">Audit Pending</option>
          </select>
        </div>
      </div>

      {/* Directory Table or Empty State */}
      {filteredCalls.length === 0 ? (
        <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-14 text-center shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
            <PhoneCall className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            {initialCalls.length === 0
              ? "No call recordings yet"
              : "No matching calls found"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            {initialCalls.length === 0
              ? "Upload an audio recording to start automatic transcription and AI framework scoring."
              : "Try changing your search keywords or resetting your status filters."}
          </p>
          {initialCalls.length === 0 && (
            <Link
              href="/calls/upload"
              prefetch={true}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload First Call
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2e4a] bg-[#0e1726]/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Sales Agent</th>
                  <th className="py-3 px-6">QA Framework</th>
                  <th className="py-3 px-6">Evaluation Date</th>
                  <th className="py-3 px-6">Compliance Score</th>
                  <th className="py-3 px-6">Audit Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2e4a]/60 text-slate-300">
                {filteredCalls.map((call) => (
                  <tr
                    key={call.id}
                    className="hover:bg-[#182338]/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-6 font-medium text-white">
                      <Link
                        href={`/calls/${call.id}`}
                        className="flex items-center gap-2.5 group-hover:text-blue-400 transition-colors"
                      >
                        <div className="h-7 w-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs text-blue-400 font-bold">
                          {call.agentName.charAt(0)}
                        </div>
                        <span className="font-semibold">{call.agentName}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-6 text-slate-300">
                      {call.frameworkName}
                    </td>
                    <td className="py-3 px-6 text-slate-400 font-mono text-[11px]">
                      {call.createdAt}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`font-mono font-bold text-xs ${
                          call.score !== null
                            ? call.score >= passThreshold
                              ? "text-emerald-400"
                              : call.score >= partialThreshold
                              ? "text-amber-400"
                              : "text-rose-400"
                            : "text-slate-500"
                        }`}
                      >
                        {call.score !== null ? `${Math.round(call.score)}%` : "—"}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wider ${
                          call.status === "PASS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : call.status === "PARTIAL"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : call.status === "FAIL" || call.status === "FAILED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse"
                        }`}
                      >
                        {call.status === "PASS" && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        )}
                        {call.status === "PARTIAL" && (
                          <AlertCircle className="h-3 w-3 text-amber-400" />
                        )}
                        {(call.status === "FAIL" || call.status === "FAILED") && (
                          <ShieldAlert className="h-3 w-3 text-rose-400" />
                        )}
                        {call.status === "PENDING" && (
                          <Clock className="h-3 w-3 text-blue-400" />
                        )}
                        {call.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {call.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleStop(call.id);
                            }}
                            disabled={stoppingId === call.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
                            title="Stop call audit"
                          >
                            {stoppingId === call.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Stop Audit
                          </button>
                        )}

                        {(call.status === "FAIL" || call.status === "FAILED") && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRetry(call.id);
                            }}
                            disabled={retryingId === call.id}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                            title="Retry call audit"
                          >
                            {retryingId === call.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                            Retry
                          </button>
                        )}

                        <Link
                          href={`/calls/${call.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          Details
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteConfirmCall(call);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                          title="Delete call recording"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Delete Call Recording?
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {deleteConfirmCall.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete the recording for{" "}
              <strong className="text-white">{deleteConfirmCall.agentName}</strong>?
              This will permanently remove the audio file, transcript, and QA
              analysis. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCall(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#182338] hover:bg-[#202f4a] text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete Recording
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
