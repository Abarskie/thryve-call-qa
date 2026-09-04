import assert from "node:assert/strict";
import test from "node:test";

import {
  validateAudioUploadFile,
  validateStoredAudioUpload,
} from "./audio-upload";

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

test("accepts a valid direct-to-storage audio upload reference", () => {
  assert.equal(
    validateStoredAudioUpload({
      storagePath: "uploads/123e4567-e89b-42d3-a456-426614174000",
      fileName: "sales-call.MP3",
      fileType: "audio/mpeg",
      fileSize: 25 * 1024 * 1024,
    }),
    null,
  );
});

test("rejects an audio upload reference outside the generated uploads path", () => {
  assert.equal(
    validateStoredAudioUpload({
      storagePath: "other-folder/sales-call.mp3",
      fileName: "sales-call.mp3",
      fileType: "audio/mpeg",
      fileSize: 1024,
    }),
    "Invalid uploaded audio path.",
  );
});

test("keeps the 25 MB limit for direct-to-storage upload registration", () => {
  assert.equal(
    validateStoredAudioUpload({
      storagePath: "uploads/123e4567-e89b-42d3-a456-426614174000",
      fileName: "sales-call.mp3",
      fileType: "audio/mpeg",
      fileSize: 25 * 1024 * 1024 + 1,
    }),
    "Audio file must be 25 MB or smaller.",
  );
});
