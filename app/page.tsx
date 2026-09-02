import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import {
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Activity,
  TrendingUp,
  Users2,
  ShieldAlert,
} from "lucide-react";

export default function Home() {
  const stats = [
    {
      name: "Average Call Score",
      value: "82%",
      change: "+3.2% this week",
      trend: "up",
      icon: TrendingUp,
      accent: "from-emerald-500/20 to-transparent",
    },
    {
      name: "Calls Analyzed",
      value: "126",
      change: "+18 this week",
      trend: "up",
      icon: Activity,
      accent: "from-indigo-500/20 to-transparent",
    },
    {
      name: "Active Sales Agents",
      value: "12",
      change: "4 monitored today",
      trend: "neutral",
      icon: Users2,
      accent: "from-cyan-500/20 to-transparent",
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Command Center Top Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-base font-semibold text-white tracking-tight">
              QA Command Center
            </h1>
            <span className="hidden sm:inline-flex items-center text-xs font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              LIVE MONITORING
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/calls/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <FileAudio className="h-4 w-4" />
              Upload Call
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 space-y-8 flex-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 shadow-sm backdrop-blur-sm hover:border-slate-700/80 transition-all group"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-50 pointer-events-none`}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      {stat.name}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="relative mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white tabular-nums font-mono">
                      {stat.value}
                    </span>
                  </div>
                  <p className="relative mt-1 text-xs text-slate-400 font-medium">
                    {stat.change}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent Calls Section */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl shadow-sm overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Recent Evaluated Calls</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time compliance evaluations and AI framework scores
                </p>
              </div>
              <Link
                href="/calls"
                className="text-xs font-medium text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:underline"
              >
                View all calls
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3 px-6">Agent</th>
                    <th className="py-3 px-6">Framework</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">QA Score</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentCalls.map((call) => (
                    <tr
                      key={call.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-3.5 px-6 font-medium text-white flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-300 font-semibold">
                          {call.agent.charAt(0)}
                        </div>
                        {call.agent}
                      </td>
                      <td className="py-3.5 px-6 text-slate-300">{call.framework}</td>
                      <td className="py-3.5 px-6 text-slate-400 text-xs">{call.date}</td>
                      <td className="py-3.5 px-6 font-semibold">
                        <span
                          className={`font-mono tabular-nums ${
                            call.score >= 80
                              ? "text-emerald-400"
                              : call.score >= 70
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {call.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-mono ${
                            call.status === "PASS"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                              : call.status === "PARTIAL"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                              : "bg-rose-950/80 text-rose-300 border border-rose-800/60"
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
