import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createProcessCallHandler } from "./process-route";
import type { ProcessCallResult } from "./types";

test("process-route handler unit tests", async (t) => {
  const validId = "123e4567-e89b-12d3-a456-426614174000";

  await t.test("rejects invalid UUID with 400", async () => {
    const handler = createProcessCallHandler(async () => ({ outcome: "completed" }));
    const req = new NextRequest("http://localhost/api/calls/invalid-id/process", {
      method: "POST",
    });
    const res = await handler(req, { params: Promise.resolve({ id: "invalid-id" }) });
    assert.equal(res.status, 400);
  });

  await t.test("parses empty body safely as retry: false", async () => {
    let capturedRetry: boolean | null = null;
    const handler = createProcessCallHandler(async ({ retry }) => {
      capturedRetry = retry;
      return { outcome: "completed" };
    });
    const req = new NextRequest(`http://localhost/api/calls/${validId}/process`, {
      method: "POST",
    });
    const res = await handler(req, { params: Promise.resolve({ id: validId }) });
    assert.equal(res.status, 200);
    assert.equal(capturedRetry, false);
    assert.equal(res.headers.get("Cache-Control"), "no-store");
  });

  await t.test("parses body with retry: true", async () => {
    let capturedRetry: boolean | null = null;
    const handler = createProcessCallHandler(async ({ retry }) => {
      capturedRetry = retry;
      return { outcome: "completed" };
    });
    const req = new NextRequest(`http://localhost/api/calls/${validId}/process`, {
      method: "POST",
      body: JSON.stringify({ retry: true }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await handler(req, { params: Promise.resolve({ id: validId }) });
    assert.equal(res.status, 200);
    assert.equal(capturedRetry, true);
  });

  await t.test("rejects malformed non-empty JSON body with 400", async () => {
    const handler = createProcessCallHandler(async () => ({ outcome: "completed" }));
    const req = new NextRequest(`http://localhost/api/calls/${validId}/process`, {
      method: "POST",
      body: "{not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await handler(req, { params: Promise.resolve({ id: validId }) });
    assert.equal(res.status, 400);
  });

  const cases: readonly [ProcessCallResult, number][] = [
    [{ outcome: "completed" }, 200],
    [{ outcome: "already_completed" }, 200],
    [{ outcome: "already_processing" }, 202],
    [{ outcome: "not_found" }, 404],
    [{ outcome: "retry_required" }, 409],
    [{ outcome: "failed", message: "Call evaluation failed." }, 500],
    [{ outcome: "not_configured", message: "OpenAI is not configured." }, 503],
  ] as const;

  for (const [result, expectedStatus] of cases) {
    await t.test(`maps outcome ${result.outcome} to HTTP ${expectedStatus}`, async () => {
      const handler = createProcessCallHandler(async () => result);
      const req = new NextRequest(`http://localhost/api/calls/${validId}/process`, {
        method: "POST",
      });
      const res = await handler(req, { params: Promise.resolve({ id: validId }) });
      assert.equal(res.status, expectedStatus);
      assert.equal(res.headers.get("Cache-Control"), "no-store");
      const json = await res.json();
      assert.equal(json.outcome, result.outcome);
    });
  }
});
