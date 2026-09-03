import { createStopCallHandler } from "@/lib/call-processing/stop-route";
import { createCallProcessingRepository } from "@/lib/call-processing/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const repo = createCallProcessingRepository();

export const POST = createStopCallHandler((id, reason) =>
  repo.markFailed(id, reason)
);

