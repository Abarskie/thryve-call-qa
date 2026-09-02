import Link from "next/link";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  GitFork,
  Settings,
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
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-lg">
              CallCoach AI
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-slate-100 text-slate-900"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-700" />
            Dashboard
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <PhoneCall className="h-4 w-4 text-slate-400" />
            Calls
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Users className="h-4 w-4 text-slate-400" />
            Agents
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <GitFork className="h-4 w-4 text-slate-400" />
            Frameworks
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
              M
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">Manager</p>
              <p className="text-xs text-slate-500 truncate">QA Team</p>
            </div>
          </div>
        </div>
      </aside>

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

