import assert from "node:assert/strict";
import test from "node:test";

import { formatUnknownError } from "./errors";

test("preserves the message from a native Error", () => {
  assert.equal(formatUnknownError(new Error("request failed"), "fallback"), "request failed");
});

test("formats details from a Supabase-style error object", () => {
  assert.equal(
    formatUnknownError(
      {
        message: "fetch failed",
        code: "PGRST000",
        details: "connection refused",
        hint: "start the local service",
      },
      "fallback",
    ),
    "fetch failed (code: PGRST000; details: connection refused; hint: start the local service)",
  );
});

test("uses the fallback for an empty object", () => {
  assert.equal(formatUnknownError({}, "fallback"), "fallback");
});
