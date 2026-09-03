import { createStopCallHandler } from "@/lib/call-processing/stop-route";
import { createCallProcessingRepository } from "@/lib/call-processing/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createStopCallHandler(async (id: string, reason: string) => {
  const repository = createCallProcessingRepository();
  await repository.markFailed(id, reason);
});
