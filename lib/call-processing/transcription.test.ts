import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDiarizedTranscription } from "./transcription";

test("normalizes diarized segments", () => {
  assert.deepEqual(
    normalizeDiarizedTranscription({
      task: "transcribe",
      text: "Hello. Hi.",
      duration: 4.25,
      segments: [
        {
          id: "1",
          type: "transcript.text.segment",
          speaker: "A",
          start: 0,
          end: 1.5,
          text: " Hello. ",
        },
        {
          id: "2",
          type: "transcript.text.segment",
          speaker: "B",
          start: 1.5,
          end: 4.25,
          text: " Hi. ",
        },
      ],
    }),
    {
      text: "Hello. Hi.",
      durationSeconds: 4,
      segments: [
        { speaker: "A", start_time: 0, end_time: 1.5, text: "Hello." },
        { speaker: "B", start_time: 1.5, end_time: 4.25, text: "Hi." },
      ],
    }
  );
});

test("rejects empty or malformed transcription output", () => {
  assert.throws(
    () => normalizeDiarizedTranscription({ text: "", duration: 0, segments: [] }),
    /invalid transcription response/i
  );
});
