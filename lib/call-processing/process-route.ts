import { type NextRequest, NextResponse } from "next/server";
import type { ProcessCallInput } from "./processor";
import type { ProcessCallResult } from "./types";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProcessCallFn = (input: ProcessCallInput) => Promise<ProcessCallResult>;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function createProcessCallHandler(runProcessCall: ProcessCallFn) {
  return async (req: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const { id } = await context.params;

    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: "Invalid call ID format." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    let retry = false;
    const bodyText = await req.text();
    if (bodyText.trim().length > 0) {
      try {
        const parsed = JSON.parse(bodyText);
        retry = Boolean(parsed?.retry);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON body." },
          { status: 400, headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    const result = await runProcessCall({ callId: id, retry });

    let status = 200;
    switch (result.outcome) {
      case "completed":
      case "already_completed":
        status = 200;
        break;
      case "already_processing":
        status = 202;
        break;
      case "not_found":
        status = 404;
        break;
      case "retry_required":
        status = 409;
        break;
      case "failed":
        status = 500;
        break;
      case "not_configured":
        status = 503;
        break;
    }

    return NextResponse.json(result, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  };
}

