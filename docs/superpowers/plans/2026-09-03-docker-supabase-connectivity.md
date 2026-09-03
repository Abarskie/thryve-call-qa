# Docker Supabase Connectivity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the seven-second navigation delay and unreadable dashboard error when Callsy QA runs in Docker against local Supabase.

**Architecture:** Keep the public Supabase URL for browser code and add an optional server-only URL for code running inside Docker. Centralize unknown-error formatting so Supabase response objects retain their message, code, details, and hint in server logs. Add an App Router loading boundary so navigation has immediate feedback while server data loads.

**Tech Stack:** Next.js 15, TypeScript, Supabase JS, Node test runner via `tsx`

**Spec:** User-approved repair plan in the 2026-09-03 debugging session.

## Global Constraints

- Preserve the existing public Supabase URL used by browser code.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or the new server-only URL to client bundles.
- Do not change unrelated UI or product behavior.

---

### Task 1: Server-side Supabase URL selection

**Files:**
- Create: `lib/supabase/url.ts`
- Create: `lib/supabase/url.test.ts`
- Modify: `lib/supabase/admin.ts`
- Modify: `lib/supabase/server.ts`
- Modify: `.env.example`
- Modify: `.env.local`

**Interfaces:**
- Consumes: `SUPABASE_SERVER_URL` and `NEXT_PUBLIC_SUPABASE_URL` environment variables.
- Produces: `getSupabaseServerUrl(env): string`.

- [ ] **Step 1: Write the failing URL-selection tests**

```ts
test("prefers the server-only Supabase URL", () => {
  assert.equal(getSupabaseServerUrl({
    SUPABASE_SERVER_URL: "http://host.docker.internal:54321",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  }), "http://host.docker.internal:54321");
});

test("falls back to the public Supabase URL", () => {
  assert.equal(getSupabaseServerUrl({
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  }), "http://127.0.0.1:54321");
});
```

- [ ] **Step 2: Run the test and verify it fails because the helper is missing**

Run: `npx tsx --test lib/supabase/url.test.ts`
Expected: FAIL because `getSupabaseServerUrl` is not exported.

- [ ] **Step 3: Implement the URL resolver and use it in server/admin clients**

```ts
type SupabaseEnvironment = Pick<NodeJS.ProcessEnv,
  "SUPABASE_SERVER_URL" | "NEXT_PUBLIC_SUPABASE_URL">;

export function getSupabaseServerUrl(env: SupabaseEnvironment = process.env): string {
  return env.SUPABASE_SERVER_URL || env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
}
```

- [ ] **Step 4: Run the URL-selection tests**

Run: `npx tsx --test lib/supabase/url.test.ts`
Expected: PASS.

### Task 2: Structured server error messages

**Files:**
- Create: `lib/errors.ts`
- Create: `lib/errors.test.ts`
- Modify: `app/actions/calls.ts`

**Interfaces:**
- Consumes: an `unknown` caught value.
- Produces: `formatUnknownError(error, fallback): string`.

- [ ] **Step 1: Write failing tests for Error and Supabase-like objects**

```ts
test("formats Supabase-like errors", () => {
  assert.equal(
    formatUnknownError({ message: "fetch failed", code: "PGRST000" }, "fallback"),
    "fetch failed (code: PGRST000)",
  );
});
```

- [ ] **Step 2: Run the tests and verify the helper is missing**

Run: `npx tsx --test lib/errors.test.ts`
Expected: FAIL because `formatUnknownError` is not exported.

- [ ] **Step 3: Implement the formatter and use it in the dashboard action**

The formatter checks native `Error`, then safely reads string `message`, `code`, `details`, and `hint` properties from plain objects, otherwise returning the fallback.

- [ ] **Step 4: Run the formatter tests**

Run: `npx tsx --test lib/errors.test.ts`
Expected: PASS.

### Task 3: Navigation loading boundary

**Files:**
- Create: `app/loading.tsx`

**Interfaces:**
- Produces: the App Router loading UI shown while server components resolve.

- [ ] **Step 1: Add a minimal loading boundary matching the existing dashboard shell**

Use fixed skeleton dimensions, `role="status"`, and screen-reader text. Do not modify existing pages.

- [ ] **Step 2: Verify through the production build and browser navigation**

Run: `npm run build`
Expected: exit code 0.

### Task 4: Runtime verification

**Files:**
- No additional source files.

- [ ] **Step 1: Start local Supabase and restart the app container**

Run Supabase from this repository so migrations and seed data load, then ensure the app container receives `SUPABASE_SERVER_URL=http://host.docker.internal:54321`.

- [ ] **Step 2: Run quality checks**

Run: `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
Expected: all commands exit 0.

- [ ] **Step 3: Verify affected routes**

Measure `/`, `/calls`, `/agents`, and `/frameworks`; confirm HTTP 200 without the prior seven-second timeout. Confirm `/settings` remains healthy.
