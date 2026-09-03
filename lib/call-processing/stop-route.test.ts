import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createStopCallHandler } from "./stop-route";

test("stop-route handler unit tests", async (t) => {
  const validId = "123e4567-e89b-12d3-a456-426614174000";

  await t.test("rejects invalid UUID with 400", async () => {
    const handler = createStopCallHandler(async () => {});
    const req = new NextRequest("http://localhost/api/calls/invalid-id/stop", {
      method: "POST",
    });
    const res = await handler(req, { params: Promise.resolve({ id: "invalid-id" }) });
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.error, "Invalid call ID format.");
  });

  await t.test("marks call as failed with cancellation message and returns 200", async () => {
    let capturedId = "";
    let capturedReason = "";

    const handler = createStopCallHandler(async (id, reason) => {
      capturedId = id;
      capturedReason = reason;
    });

    const req = new NextRequest(`http://localhost/api/calls/${validId}/stop`, {
      method: "POST",
    });
    const res = await handler(req, { params: Promise.resolve({ id: validId }) });

    assert.equal(res.status, 200);
    assert.equal(capturedId, validId);
    assert.equal(capturedReason, "Cancelled by user");
    assert.equal(res.headers.get("Cache-Control"), "no-store");

    const json = await res.json();
    assert.equal(json.success, true);
  });

  await t.test("returns 500 when repository throws", async () => {
    const handler = createStopCallHandler(async () => {
      throw new Error("DB connection failed");
    });

    const req = new NextRequest(`http://localhost/api/calls/${validId}/stop`, {
      method: "POST",
    });
    const res = await handler(req, { params: Promise.resolve({ id: validId }) });

    assert.equal(res.status, 500);
    const json = await res.json();
    assert.equal(json.error, "Failed to stop processing.");
  });
});
