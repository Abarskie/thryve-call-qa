import { createStopCallHandler } from "@/lib/call-processing/stop-route";
import { createCallProcessingRepository } from "@/lib/call-processing/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createStopCallHandler((id, reason) => {
  const repo = createCallProcessingRepository();
  return repo.markFailed(id, reason);
});

