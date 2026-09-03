import assert from "node:assert/strict";
import test from "node:test";

import { getSupabaseServerUrl } from "./url";

test("prefers the server-only Supabase URL inside Docker", () => {
  assert.equal(
    getSupabaseServerUrl({
      SUPABASE_SERVER_URL: "http://host.docker.internal:54321",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    }),
    "http://host.docker.internal:54321",
  );
});

test("falls back to the public Supabase URL outside Docker", () => {
  assert.equal(
    getSupabaseServerUrl({
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    }),
    "http://127.0.0.1:54321",
  );
});

test("uses the placeholder only when neither URL is configured", () => {
  assert.equal(
    getSupabaseServerUrl({}),
    "https://placeholder.supabase.co",
  );
});
