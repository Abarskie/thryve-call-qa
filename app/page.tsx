import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import {
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileAudio,
} from "lucide-react";

export default function Home() {
  const stats = [
    { name: "Average Call Score", value: "82%", change: "+3.2% from last week" },
    { name: "Calls Analyzed", value: "126", change: "+18 this week" },
    { name: "Active Agents", value: "12", change: "2 onboarded recently" },
  ];

  const recentCalls = [
    {
      id: "call-1",
      agent: "Sarah Connor",
      date: "2026-03-02",
      framework: "Cold Calling Framework",
      score: 88,
      status: "PASS",
    },
    {
      id: "call-2",
      agent: "John Miller",
      date: "2026-03-02",
      framework: "Discovery Call Framework",
      score: 74,
      status: "PARTIAL",
    },
    {
      id: "call-3",
      agent: "Alex Rivera",
      date: "2026-03-01",
      framework: "Inbound Lead Qualification",
      score: 91,
      status: "PASS",
    },
    {
      id: "call-4",
      agent: "Emily Watson",
      date: "2026-03-01",
      framework: "Cold Calling Framework",
      score: 58,
      status: "FAIL",
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <FileAudio className="h-4 w-4" />
              Upload Call
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
              >
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {stat.name}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-slate-900">
                    {stat.value}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Recent Calls Section */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Calls</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest QA reviews and compliance scoring
                </p>
              </div>
              <Link
                href="#"
                className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                View all calls
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium uppercase tracking-wider">
                    <th className="py-3 px-6">Agent</th>
                    <th className="py-3 px-6">Framework</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Score</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {call.agent}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{call.framework}</td>
                      <td className="py-3.5 px-6 text-slate-500">{call.date}</td>
                      <td className="py-3.5 px-6 font-semibold">
                        <span
                          className={
                            call.score >= 80
                              ? "text-emerald-700"
                              : call.score >= 70
                              ? "text-amber-700"
                              : "text-rose-700"
                          }
                        >
                          {call.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            call.status === "PASS"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : call.status === "PARTIAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {call.status === "PASS" && <CheckCircle2 className="h-3 w-3" />}
                          {call.status !== "PASS" && <AlertCircle className="h-3 w-3" />}
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

