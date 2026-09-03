import { NextResponse } from "next/server";
import { createCallProcessingRepository } from "@/lib/call-processing/repository";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const repository = createCallProcessingRepository();
    // Mark as failed/cancelled
    await repository.markFailed(params.id, "Cancelled by user");
    
    // Clear path cache
    revalidatePath(`/calls/${params.id}`);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Stop route error:", err);
    return NextResponse.json(
      { error: "Failed to stop processing" },
      { status: 500 }
    );
  }
}
