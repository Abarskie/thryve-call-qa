import { type NextRequest, NextResponse } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AudioStreamData {
  buffer: ArrayBuffer;
  contentType: string;
  contentLength: number;
}

export type FetchAudioFn = (callId: string) => Promise<AudioStreamData | null>;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export function createAudioStreamHandler(fetchAudio: FetchAudioFn) {
  return async (
    _req: NextRequest,
    context: RouteContext
  ): Promise<NextResponse> => {
    const { id } = await context.params;

    if (!id || !UUID_REGEX.test(id)) {
      return new NextResponse("Invalid call ID format", { status: 400 });
    }

    try {
      const audio = await fetchAudio(id);

      if (!audio) {
        return new NextResponse("Audio recording not found", { status: 404 });
      }

      const headers = new Headers();
      headers.set("Content-Type", audio.contentType || "audio/mpeg");
      headers.set("Content-Length", audio.contentLength.toString());
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=3600");

      return new NextResponse(audio.buffer, { status: 200, headers });
    } catch (err) {
      console.error(`Audio streaming error [id=${id}]:`, err);
      return new NextResponse("Failed to stream audio", { status: 500 });
    }
  };
}
