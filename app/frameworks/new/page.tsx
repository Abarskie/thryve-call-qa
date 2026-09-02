import { Sidebar } from "@/components/layout/sidebar";
import { FrameworkEditor } from "@/components/frameworks/framework-editor";

export default function NewFrameworkPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8">
          <h1 className="text-lg font-semibold text-slate-900">New Framework</h1>
        </header>

        <div className="p-8">
          <FrameworkEditor />
        </div>
      </main>
    </div>
  );
}
