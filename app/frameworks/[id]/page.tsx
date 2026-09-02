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
    <div className="flex min-h-screen bg-neutral-100 text-neutral-800">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 flex-1">
          <FrameworkEditor initialFramework={result.data} />
        </div>
      </main>
    </div>
  );
}
