import { Sidebar } from "@/components/layout/sidebar";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettingsAction } from "@/app/actions/settings";
import { Sliders } from "lucide-react";

export default async function SettingsPage() {
  const { data: initialSettings } = await getSettingsAction();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                Settings
              </h1>
              <p className="text-xs text-slate-500">
                Workspace configuration, AI model parameters & integrations
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

