import { type NextRequest, NextResponse } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type MarkFailedFn = (callId: string, reason: string) => Promise<void>;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function createStopCallHandler(markFailed: MarkFailedFn) {
  return async (_req: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const { id } = await context.params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid call ID format." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    try {
      await markFailed(id, "Cancelled by user");

      return NextResponse.json(
        { success: true, message: "Processing stopped." },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    } catch (err) {
      console.error(`Failed to stop call processing [id=${id}]:`, err);
      return NextResponse.json(
        { error: "Failed to stop processing." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }
  };
}
