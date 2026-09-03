import { Sidebar } from "@/components/layout/sidebar";
import { SettingsForm } from "@/components/settings/settings-form";
import { getSettingsAction } from "@/app/actions/settings";

export default async function SettingsPage() {
  const { data: initialSettings } = await getSettingsAction();

  return (
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6 flex-1">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Settings & Configuration
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Workspace identity, AI evaluation model parameters, and API credentials
            </p>
          </div>

          <div className="max-w-4xl">
            <SettingsForm initialSettings={initialSettings} />
          </div>
        </div>
      </main>
    </div>
  );
}
