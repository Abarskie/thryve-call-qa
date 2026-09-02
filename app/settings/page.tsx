import { Sidebar } from "@/components/layout/sidebar";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettingsAction } from "@/app/actions/settings";
import { Sliders } from "lucide-react";

export default async function SettingsPage() {
  const { data: initialSettings } = await getSettingsAction();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
              <Sliders className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-tight leading-tight">
                Settings
              </h1>
              <p className="text-[11px] text-slate-400">
                Workspace configuration, AI model parameters & connected backends
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <SettingsForm initialSettings={initialSettings} />
          </div>
        </div>
      </main>
    </div>
  );
}
