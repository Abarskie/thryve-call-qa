import OpenAI, { toFile } from "openai";
import type { TranscriptionResult } from "./types";
import type { TranscriptSegment } from "@/types/database";

export interface AudioInput {
  blob: Blob;
  fileName: string;
  contentType: string;
}

export type Transcriber = (input: AudioInput) => Promise<TranscriptionResult>;

interface RawSegment {
  speaker?: unknown;
  start?: unknown;
  end?: unknown;
  text?: unknown;
}

interface RawTranscriptionResponse {
  text?: unknown;
  duration?: unknown;
  segments?: unknown;
}

export function normalizeDiarizedTranscription(
  value: unknown
): TranscriptionResult {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid transcription response: response must be an object.");
  }

  const raw = value as RawTranscriptionResponse;

  if (typeof raw.text !== "string" || raw.text.trim().length === 0) {
    throw new Error("Invalid transcription response: missing or empty text.");
  }

  if (
    typeof raw.duration !== "number" ||
    !Number.isFinite(raw.duration) ||
    raw.duration < 0
  ) {
    throw new Error("Invalid transcription response: invalid duration.");
  }

  if (!Array.isArray(raw.segments) || raw.segments.length === 0) {
    throw new Error("Invalid transcription response: segments must be a non-empty array.");
  }

  const normalizedSegments: TranscriptSegment[] = [];

  for (let i = 0; i < raw.segments.length; i++) {
    const seg = raw.segments[i] as RawSegment;
    if (!seg || typeof seg !== "object") {
      throw new Error(`Invalid transcription response: segment ${i} is not an object.`);
    }

    if (typeof seg.speaker !== "string" || seg.speaker.trim().length === 0) {
      throw new Error(`Invalid transcription response: segment ${i} has invalid speaker.`);
    }

    if (
      typeof seg.start !== "number" ||
      !Number.isFinite(seg.start) ||
      seg.start < 0
    ) {
      throw new Error(`Invalid transcription response: segment ${i} has invalid start time.`);
    }

    if (
      typeof seg.end !== "number" ||
      !Number.isFinite(seg.end) ||
      seg.end < seg.start
    ) {
      throw new Error(`Invalid transcription response: segment ${i} has invalid end time.`);
    }

    if (typeof seg.text !== "string" || seg.text.trim().length === 0) {
      throw new Error(`Invalid transcription response: segment ${i} has invalid text.`);
    }

    normalizedSegments.push({
      speaker: seg.speaker.trim(),
      start_time: seg.start,
      end_time: seg.end,
      text: seg.text.trim(),
    });
  }

  return {
    text: raw.text.trim(),
    durationSeconds: Math.round(raw.duration),
    segments: normalizedSegments,
  };
}

export function createOpenAITranscriber(apiKey: string): Transcriber {
  const openai = new OpenAI({ apiKey });

  return async (input: AudioInput): Promise<TranscriptionResult> => {
    const file = await toFile(input.blob, input.fileName, {
      type: input.contentType,
    });

    const response = await openai.audio.transcriptions.create({
      file,
      model: "gpt-4o-transcribe-diarize",
      response_format: "diarized_json",
      chunking_strategy: "auto",
    });

    return normalizeDiarizedTranscription(response);
  };
}

export function createGeminiTranscriber(apiKey: string): Transcriber {
  return async (input: AudioInput): Promise<TranscriptionResult> => {
    const arrayBuffer = await input.blob.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = input.contentType || "audio/mp3";

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Audio,
                  },
                },
                {
                  text: `Transcribe this audio recording with speaker diarization.
Return a valid JSON object with:
- text: full transcript string
- duration: total duration in seconds as a number
- segments: array of objects with { id: string, type: "transcript.text.segment", speaker: string (e.g. "A", "B"), start: number, end: number, text: string }`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini audio transcription failed: ${errText}`);
    }

    const data = await res.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error("Empty transcription from Gemini.");
    }

    const parsed = JSON.parse(textContent);
    return normalizeDiarizedTranscription(parsed);
  };
}

