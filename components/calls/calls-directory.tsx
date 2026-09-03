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
} from "lucide-react";
import type { DashboardCall } from "@/app/actions/calls";

interface CallsDirectoryProps {
  initialCalls: DashboardCall[];
}

export function CallsDirectory({ initialCalls }: CallsDirectoryProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredCalls = initialCalls.filter((call) => {
    const matchesSearch =
      call.agentName.toLowerCase().includes(search.toLowerCase()) ||
      call.frameworkName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : call.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statuses = ["ALL", "PASS", "PARTIAL", "FAIL", "PENDING"];

  return (
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent or framework..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#131e32] border border-[#1e2e4a] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#131e32] border border-[#1e2e4a] p-1 rounded-xl overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-slate-500 ml-2 mr-1 shrink-0 hidden sm:inline" />
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-[#182338]"
              }`}
            >
              {st}
            </button>
          ))}
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
                  <th className="py-3 px-4 text-right">Action</th>
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
                    <td className="py-3 px-6 text-slate-300 font-medium">
                      {call.frameworkName}
                    </td>
                    <td className="py-3 px-6 text-slate-400 text-xs font-mono">
                      {call.createdAt}
                    </td>
                    <td className="py-3 px-6 font-semibold">
                      {call.score !== null ? (
                        <span
                          className={`tabular-nums text-sm font-bold ${
                            call.score >= 75
                              ? "text-emerald-400"
                              : call.score >= 60
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {call.score}%
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">—</span>
                      )}
                    </td>
                    <td className="py-3 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          call.status === "PASS"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : call.status === "PARTIAL"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : call.status === "FAIL"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {call.status === "PASS" && (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        )}
                        {call.status === "PARTIAL" && (
                          <AlertCircle className="h-3 w-3 text-amber-400" />
                        )}
                        {call.status === "FAIL" && (
                          <ShieldAlert className="h-3 w-3 text-rose-400" />
                        )}
                        {call.status === "PENDING" && (
                          <Clock className="h-3 w-3 text-blue-400" />
                        )}
                        {call.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/calls/${call.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-blue-400 transition-colors"
                      >
                        Details
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

