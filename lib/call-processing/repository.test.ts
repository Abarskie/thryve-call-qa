import test from "node:test";
import assert from "node:assert/strict";
import { getStorageObjectPath, getClaimEligibility } from "./repository";

test("extracts an encoded call-recordings path", () => {
  assert.equal(
    getStorageObjectPath(
      "http://127.0.0.1:54321/storage/v1/object/public/call-recordings/uploads/edmark%20test.MP3"
    ),
    "uploads/edmark test.MP3"
  );
});

test("rejects URLs outside the recording bucket", () => {
  assert.throws(
    () => getStorageObjectPath("https://example.com/audio.mp3"),
    /invalid recording storage URL/i
  );
});

test("requires explicit retry for failed and stale active calls", () => {
  assert.equal(getClaimEligibility("pending", false, false), "claim");
  assert.equal(getClaimEligibility("failed", false, false), "retry_required");
  assert.equal(getClaimEligibility("failed", false, true), "claim");
  assert.equal(getClaimEligibility("transcribing", false, true), "already_processing");
  assert.equal(getClaimEligibility("transcribing", true, true), "claim");
  assert.equal(getClaimEligibility("completed", false, false), "already_completed");
});

