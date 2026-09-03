import Link from "next/link";
import { getDashboardDataAction } from "@/app/actions/calls";
import {
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Activity,
  Award,
  Users,
  ShieldAlert,
  Clock,
  ChevronRight,
} from "lucide-react";

export const revalidate = 0;

export default async function Home() {
  const result = await getDashboardDataAction();
  const { totalCalls, activeAgents, averageScore, recentCalls } = result.data;

  const stats = [
    {
      name: "Average Quality Score",
      value: averageScore !== null ? `${averageScore}%` : "—",
      sub: averageScore !== null ? "Across evaluated recordings" : "Awaiting first scored call",
      icon: Award,
      badge: averageScore !== null && averageScore >= 75 ? "Target met" : null,
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      name: "Calls Evaluated",
      value: totalCalls.toString(),
      sub: "Total recordings ingested",
      icon: Activity,
      badge: totalCalls > 0 ? "Live" : null,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Monitored Agents",
      value: activeAgents.toString(),
      sub: "Active sales representatives",
      icon: Users,
      badge: null,
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-7 flex-1">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Quality Assurance Overview
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time sales call QA scoring, compliance monitoring & coaching insights
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/calls/upload"
                prefetch={true}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <FileAudio className="h-3.5 w-3.5" />
                Upload Recording
              </Link>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-5 shadow-sm hover:border-slate-700/80 transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {stat.name}
                    </span>
                    <div className="text-2xl md:text-3xl font-bold text-white tabular-nums tracking-tight">
                      {stat.value}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {stat.sub}
                    </span>
                  </div>

                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Calls Section */}
          <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4.5 border-b border-[#1e2e4a] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Recent Call Reviews
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest agent recordings evaluated against QA frameworks
                </p>
              </div>
              <Link
                href="/calls"
                prefetch={true}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
              >
                View all calls
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentCalls.length === 0 ? (
              <div className="py-16 text-center text-slate-400 px-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <FileAudio className="h-6 w-6" />
                </div>
                <p className="font-semibold text-white text-sm">
                  No call recordings evaluated yet
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
                  Upload an audio file to automatically transcribe dialogue, evaluate quality compliance, and generate coaching notes.
                </p>
                <Link
                  href="/calls/upload"
                  prefetch={true}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors shadow-md shadow-blue-600/30"
                >
                  <FileAudio className="h-3.5 w-3.5" />
                  Upload First Call
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2e4a] bg-[#0e1726]/80 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-6">Sales Agent</th>
                      <th className="py-3 px-6">Framework Playbook</th>
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6">QA Score</th>
                      <th className="py-3 px-6">Compliance</th>
                      <th className="py-3 px-4 text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2e4a]/60 text-slate-300">
                    {recentCalls.map((call) => (
                      <tr
                        key={call.id}
                        className="hover:bg-[#182338]/80 transition-colors group cursor-pointer"
                      >
                        <td className="py-3 px-6 font-medium text-white">
                          <Link href={`/calls/${call.id}`} className="flex items-center gap-2.5 group-hover:text-blue-400 transition-colors">
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
                            View
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
