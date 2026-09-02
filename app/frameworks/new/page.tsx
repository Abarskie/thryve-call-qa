import { Sidebar } from "@/components/layout/sidebar";
import { FrameworkEditor } from "@/components/frameworks/framework-editor";

export default function NewFrameworkPage() {
  return (
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 flex-1">
          <FrameworkEditor />
        </div>
      </main>
    </div>
  );
}
