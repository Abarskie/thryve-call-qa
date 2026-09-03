import { type NextRequest, NextResponse } from "next/server";
import { getCallReviewData } from "@/lib/call-processing/query";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = await context.params;

  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: "Invalid call ID format." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const call = await getCallReviewData(id);

    if (!call) {
      return NextResponse.json(
        { error: "Call not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { call },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error(`Failed to get call review data [id=${id}]:`, err);
    return NextResponse.json(
      { error: "Failed to retrieve call review data." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

