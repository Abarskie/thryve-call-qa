import { createAudioStreamHandler } from "@/lib/call-processing/audio-route";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStorageObjectPath } from "@/lib/call-processing/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createAudioStreamHandler(async (id: string) => {
  const supabase = createAdminClient();

  const { data: call, error: callError } = await supabase
    .from("calls")
    .select("audio_url")
    .eq("id", id)
    .maybeSingle();

  if (callError || !call?.audio_url) {
    return null;
  }

  const path = getStorageObjectPath(call.audio_url);
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("call-recordings")
    .download(path);

  if (downloadError || !fileBlob) {
    return null;
  }

  const arrayBuffer = await fileBlob.arrayBuffer();

  return {
    buffer: arrayBuffer,
    contentType: fileBlob.type || "audio/mpeg",
    contentLength: arrayBuffer.byteLength,
  };
});

