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
    <div className="flex min-h-screen bg-[#0b1320] text-slate-100">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 overflow-y-auto">
        <div className="p-6 md:p-8 flex-1">
          <FrameworkEditor initialFramework={result.data} />
        </div>
      </main>
    </div>
  );
}
