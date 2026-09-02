import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  TrendingUp,
  Activity,
  Users2,
  ShieldAlert,
} from "lucide-react";

export default function Home() {
  const stats = [
    {
      name: "Average Call Score",
      value: "82%",
      change: "+3.2%",
      trend: "up",
      period: "vs last week",
      icon: TrendingUp,
      bg: "bg-indigo-50 text-indigo-600",
    },
    {
      name: "Calls Analyzed",
      value: "126",
      change: "+18",
      trend: "up",
      period: "this week",
      icon: Activity,
      bg: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "Active Sales Agents",
      value: "12",
      change: "+2 new",
      trend: "up",
      period: "monitored",
      icon: Users2,
      bg: "bg-cyan-50 text-cyan-600",
    },
  ];

  const recentCalls = [
    {
      id: "call-1",
      agent: "Sarah Connor",
      date: "Today, 02:45 PM",
      framework: "Cold Calling Framework",
      score: 88,
      status: "PASS",
    },
    {
      id: "call-2",
      agent: "John Miller",
      date: "Today, 01:15 PM",
      framework: "Discovery Call Framework",
      score: 74,
      status: "PARTIAL",
    },
    {
      id: "call-3",
      agent: "Alex Rivera",
      date: "Yesterday",
      framework: "Inbound Lead Qualification",
      score: 91,
      status: "PASS",
    },
    {
      id: "call-4",
      agent: "Emily Watson",
      date: "Yesterday",
      framework: "Cold Calling Framework",
      score: 58,
      status: "FAIL",
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      {/* Admina Twin Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Admina Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="p-8 space-y-7 flex-1">
          {/* Page Title & Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time sales call QA scoring, compliance monitoring & coaching insights
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/calls/upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <FileAudio className="h-4 w-4" />
                Upload Call Recording
              </Link>
            </div>
          </div>

          {/* Admina Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} shadow-xs`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block">
                        {stat.name}
                      </span>
                      <div className="mt-1 text-2xl font-bold text-neutral-900 tabular-nums">
                        {stat.value}
                      </div>
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {stat.period}
                      </span>
                    </div>
                  </div>

                  {/* Trend Pill Badge */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Evaluated Calls Table */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Recent Evaluated Calls
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Latest agent recordings evaluated against quality frameworks
                </p>
              </div>
              <Link
                href="/calls"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                View all calls
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-500 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Agent</th>
                    <th className="py-3.5 px-6">Framework</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">QA Score</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {recentCalls.map((call) => (
                    <tr
                      key={call.id}
                      className="hover:bg-neutral-50/70 transition-colors group"
                    >
                      <td className="py-3.5 px-6 font-medium text-neutral-900 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs text-neutral-700 font-bold">
                          {call.agent.charAt(0)}
                        </div>
                        <span className="font-semibold text-neutral-800">
                          {call.agent}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-neutral-600 font-medium">
                        {call.framework}
                      </td>
                      <td className="py-3.5 px-6 text-neutral-400 text-xs">
                        {call.date}
                      </td>
                      <td className="py-3.5 px-6 font-semibold">
                        <span
                          className={`tabular-nums text-sm font-bold ${
                            call.score >= 80
                              ? "text-emerald-600"
                              : call.score >= 70
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {call.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            call.status === "PASS"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : call.status === "PARTIAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {call.status === "PASS" && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          )}
                          {call.status === "PARTIAL" && (
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                          )}
                          {call.status === "FAIL" && (
                            <ShieldAlert className="h-3 w-3 text-rose-600" />
                          )}
                          {call.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
