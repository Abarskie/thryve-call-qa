import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { createAudioStreamHandler } from "./audio-route";

test("audio-route handler unit tests", async (t) => {
  const validId = "123e4567-e89b-12d3-a456-426614174000";

  await t.test("returns 400 for invalid UUID format", async () => {
    const handler = createAudioStreamHandler(async () => null);
    const req = new NextRequest("http://localhost/api/calls/bad-id/audio");
    const res = await handler(req, { params: Promise.resolve({ id: "bad-id" }) });
    assert.equal(res.status, 400);
  });

  await t.test("returns 404 when call record is not found", async () => {
    const handler = createAudioStreamHandler(async () => null);
    const req = new NextRequest(`http://localhost/api/calls/${validId}/audio`);
    const res = await handler(req, { params: Promise.resolve({ id: validId }) });
    assert.equal(res.status, 404);
  });

  await t.test("returns 200 with audio buffer and headers when found", async () => {
    const mockAudioData = new Uint8Array([1, 2, 3, 4]);
    const handler = createAudioStreamHandler(async (id) => {
      assert.equal(id, validId);
      return {
        buffer: mockAudioData.buffer,
        contentType: "audio/mpeg",
        contentLength: 4,
      };
    });

    const req = new NextRequest(`http://localhost/api/calls/${validId}/audio`);
    const res = await handler(req, { params: Promise.resolve({ id: validId }) });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "audio/mpeg");
    assert.equal(res.headers.get("Content-Length"), "4");
    assert.equal(res.headers.get("Accept-Ranges"), "bytes");
  });
});

