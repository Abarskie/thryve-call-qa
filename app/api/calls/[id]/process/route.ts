import { createProcessCallHandler } from "@/lib/call-processing/process-route";
import { processCall } from "@/lib/call-processing/processor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export const POST = createProcessCallHandler(processCall);
