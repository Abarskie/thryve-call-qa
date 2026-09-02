import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { FrameworkEditor } from "@/components/frameworks/framework-editor";
import { getFrameworkByIdAction } from "@/app/actions/frameworks";

interface EditFrameworkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function EditFrameworkPage({ params }: EditFrameworkPageProps) {
  const { id } = await params;
  const result = await getFrameworkByIdAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8">
          <h1 className="text-lg font-semibold text-slate-900">Edit Framework</h1>
        </header>

        <div className="p-8">
          <FrameworkEditor initialFramework={result.data} />
        </div>
      </main>
    </div>
  );
}
