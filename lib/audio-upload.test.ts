import assert from "node:assert/strict";
import test from "node:test";

import { validateAudioUploadFile } from "./audio-upload";

test("accepts a supported audio file at the 25 MB boundary", () => {
  assert.equal(
    validateAudioUploadFile({
      name: "call.MP3",
      type: "audio/mpeg",
      size: 25 * 1024 * 1024,
    }),
    null,
  );
});

test("rejects an audio file larger than 25 MB", () => {
  assert.equal(
    validateAudioUploadFile({
      name: "call.mp3",
      type: "audio/mpeg",
      size: 25 * 1024 * 1024 + 1,
    }),
    "Audio file must be 25 MB or smaller.",
  );
});

test("rejects an empty audio file", () => {
  assert.equal(
    validateAudioUploadFile({ name: "call.wav", type: "audio/wav", size: 0 }),
    "Audio file is empty.",
  );
});

test("rejects an unsupported file format", () => {
  assert.equal(
    validateAudioUploadFile({ name: "notes.pdf", type: "application/pdf", size: 1024 }),
    "Please select a valid audio file (.mp3, .wav, or .m4a).",
  );
});
