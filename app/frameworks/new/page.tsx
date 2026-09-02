import { Sidebar } from "@/components/layout/sidebar";
import { FrameworkEditor } from "@/components/frameworks/framework-editor";

export default function NewFrameworkPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex items-center px-8 shrink-0">
          <h1 className="text-base font-semibold text-white tracking-tight">Create Call Framework</h1>
        </header>

        <div className="p-8 flex-1">
          <FrameworkEditor />
        </div>
      </main>
    </div>
  );
}
