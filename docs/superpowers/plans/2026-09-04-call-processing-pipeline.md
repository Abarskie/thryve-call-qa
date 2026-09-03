# Call Processing Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Process uploaded calls through speaker-diarized OpenAI transcription and framework evaluation, persist every status and result in Supabase, and render a recoverable call report.

**Architecture:** A server-only processor coordinates focused transcription, evaluation, scoring, and Supabase repository modules. An idempotent Next.js route claims each call and performs the work, while the call review page starts eligible work and polls persisted state until it can render a completed report or actionable failure.

**Tech Stack:** Next.js 15 App Router, React 19, strict TypeScript, Supabase PostgreSQL and Storage, OpenAI Node SDK 7, Node test runner through `tsx`, Tailwind CSS, Lucide React.

**Spec:** `docs/superpowers/specs/2026-09-04-call-processing-pipeline-design.md`

## Global Constraints

- Keep processing inside the existing Next.js application; do not add Redis, a message broker, or a separate worker.
- Read `OPENAI_API_KEY` only from the server environment and never return or log it.
- Use `gpt-4o-transcribe-diarize`, `diarized_json`, and `chunking_strategy: "auto"`.
- Use the existing evaluation model selection with `gpt-4o-mini` as the default.
- Treat active calls as stale after exactly 15 minutes and poll active state every 2 seconds.
- Preserve the existing schema and all unrelated dirty-worktree changes.
- Use test-driven development: run each named failing test before implementation.

## File Map

- `lib/call-processing/types.ts`: processing contracts.
- `lib/call-processing/scoring.ts`: deterministic scoring and stale detection.
- `lib/call-processing/transcription.ts`: diarized OpenAI adapter.
- `lib/call-processing/evaluation.ts`: strict AI evaluation validation.
- `lib/call-processing/repository.ts`: Supabase claim, storage, and persistence.
- `lib/call-processing/processor.ts`: pipeline orchestration.
- `lib/call-processing/process-route.ts`: testable processing HTTP handler.
- `lib/call-processing/query.ts`: normalized report query.
- `app/api/calls/[id]/process/route.ts`: processing POST endpoint.
- `app/api/calls/[id]/route.ts`: status/report GET endpoint.
- `components/calls/call-review.tsx`: start, poll, retry, and state UI.
- `components/calls/call-report.tsx`: completed report.
- `app/calls/[id]/page.tsx`: server-loaded review route.

---

### Task 1: Domain Contracts And Scoring

**Files:**
- Create: `lib/call-processing/types.ts`
- Create: `lib/call-processing/scoring.ts`
- Test: `lib/call-processing/scoring.test.ts`

**Interfaces:**
- Consumes: `Stage`, `RequirementResult`, `StageScore`, `TranscriptSegment`, and `CallStatus` from `types/database.ts`.
- Produces: `TranscriptionResult`, `EvaluationDraft`, `ValidatedEvaluation`, `ProcessingCall`, `ProcessCallResult`, `scoreEvaluation()`, and `isStaleCall()`.

- [ ] **Step 1: Write the failing tests**

```ts
test("calculates deterministic weighted scores", () => {
  const result = scoreEvaluation(stages, [passResult, partialResult, failResult]);
  assert.deepEqual(result.stageScores.map((stage) => stage.score), [75, 0]);
  assert.equal(result.overallScore, 18.75);
  assert.deepEqual(result.requirements.map((item) => item.score), [100, 50, 0]);
});

test("excludes not-applicable requirements and renormalizes weights", () => {
  const result = scoreEvaluation(stages, [passResult, secondPassResult, notApplicableResult]);
  assert.equal(result.overallScore, 100);
});

test("marks only active records older than fifteen minutes stale", () => {
  const now = new Date("2026-09-04T01:00:00.000Z");
  assert.equal(isStaleCall("transcribing", "2026-09-04T00:44:59.999Z", now), true);
  assert.equal(isStaleCall("analyzing", "2026-09-04T00:45:00.000Z", now), false);
  assert.equal(isStaleCall("pending", "2026-09-03T00:00:00.000Z", now), false);
});
```

Fixtures must use a two-stage framework weighted 25 and 75, with complete `RequirementResult` fields.

- [ ] **Step 2: Verify RED**

Run: `npx.cmd tsx --test lib/call-processing/scoring.test.ts`

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Define exact domain types**

```ts
export interface TranscriptionResult {
  text: string;
  durationSeconds: number;
  segments: TranscriptSegment[];
}

export interface EvaluationDraft {
  requirements_results: RequirementResult[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  summary: string;
}

export interface ValidatedEvaluation extends EvaluationDraft {
  overall_score: number;
  stage_scores: StageScore[];
}

export interface ProcessingCall {
  id: string;
  status: CallStatus;
  updatedAt: string;
  audioUrl: string;
  fileName: string;
  agentName: string;
  frameworkName: string;
  stages: Stage[];
}

export type ProcessCallResult =
  | { outcome: "completed" | "already_completed" | "already_processing" | "retry_required" | "not_found" }
  | { outcome: "not_configured" | "failed"; message: string };
```

- [ ] **Step 4: Implement scoring**

Map `PASS=100`, `PARTIAL=50`, `FAIL=0`, and persisted `NOT_APPLICABLE=0`. Exclude not-applicable requirements from stage averages, exclude stages with no applicable requirements from the overall denominator, normalize remaining stage weights, preserve framework order, and round to two decimals.

```ts
export function scoreEvaluation(
  stages: Stage[],
  requirements: RequirementResult[],
): { requirements: RequirementResult[]; stageScores: StageScore[]; overallScore: number };

export const STALE_AFTER_MS = 15 * 60 * 1000;
export function isStaleCall(status: CallStatus, updatedAt: string, now: Date): boolean;
```

- [ ] **Step 5: Verify GREEN**

Run: `npx.cmd tsx --test lib/call-processing/scoring.test.ts`

Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```powershell
git add -- lib/call-processing/types.ts lib/call-processing/scoring.ts lib/call-processing/scoring.test.ts
git commit -m "feat: add call processing score domain"
```

---

### Task 2: Diarized Transcription

**Files:**
- Create: `lib/call-processing/transcription.ts`
- Test: `lib/call-processing/transcription.test.ts`

**Interfaces:**
- Consumes: an audio `Blob`, filename, content type, and `TranscriptionResult`.
- Produces: `AudioInput`, `Transcriber`, `normalizeDiarizedTranscription()`, and `createOpenAITranscriber()`.

- [ ] **Step 1: Write failing normalization tests**

```ts
test("normalizes diarized segments", () => {
  assert.deepEqual(normalizeDiarizedTranscription({
    task: "transcribe",
    text: "Hello. Hi.",
    duration: 4.25,
    segments: [
      { id: "1", type: "transcript.text.segment", speaker: "A", start: 0, end: 1.5, text: " Hello. " },
      { id: "2", type: "transcript.text.segment", speaker: "B", start: 1.5, end: 4.25, text: " Hi. " },
    ],
  }), {
    text: "Hello. Hi.",
    durationSeconds: 4,
    segments: [
      { speaker: "A", start_time: 0, end_time: 1.5, text: "Hello." },
      { speaker: "B", start_time: 1.5, end_time: 4.25, text: "Hi." },
    ],
  });
});

test("rejects empty or malformed transcription output", () => {
  assert.throws(
    () => normalizeDiarizedTranscription({ text: "", duration: 0, segments: [] }),
    /invalid transcription response/i,
  );
});
```

- [ ] **Step 2: Verify RED**

Run: `npx.cmd tsx --test lib/call-processing/transcription.test.ts`

- [ ] **Step 3: Implement normalization and the adapter**

```ts
export interface AudioInput {
  blob: Blob;
  fileName: string;
  contentType: string;
}
export type Transcriber = (input: AudioInput) => Promise<TranscriptionResult>;
export function normalizeDiarizedTranscription(value: unknown): TranscriptionResult;
export function createOpenAITranscriber(apiKey: string): Transcriber;
```

Validate non-empty text and segments, finite non-negative duration, finite segment times where `end >= start`, and non-empty speaker/text strings. Use `OpenAI` plus `toFile`:

```ts
await openai.audio.transcriptions.create({
  file: await toFile(input.blob, input.fileName, { type: input.contentType }),
  model: "gpt-4o-transcribe-diarize",
  response_format: "diarized_json",
  chunking_strategy: "auto",
});
```

- [ ] **Step 4: Verify GREEN and types**

Run: `npx.cmd tsx --test lib/call-processing/transcription.test.ts`

Run: `npx.cmd tsc --noEmit --incremental false`

- [ ] **Step 5: Commit**

```powershell
git add -- lib/call-processing/transcription.ts lib/call-processing/transcription.test.ts
git commit -m "feat: add diarized call transcription"
```

---

### Task 3: Structured Framework Evaluation

**Files:**
- Create: `lib/call-processing/evaluation.ts`
- Test: `lib/call-processing/evaluation.test.ts`

**Interfaces:**
- Consumes: agent name, framework name, `Stage[]`, `TranscriptionResult`, and `scoreEvaluation()`.
- Produces: `EvaluationInput`, `Evaluator`, `validateEvaluationDraft()`, and `createOpenAIEvaluator()`.

- [ ] **Step 1: Write failing validation tests**

```ts
test("validates all requirements and recalculates scores", () => {
  const result = validateEvaluationDraft(stages, validDraft);
  assert.equal(result.overall_score, 50);
  assert.deepEqual(result.stage_scores.map((stage) => stage.score), [50]);
  assert.deepEqual(result.requirements_results.map((item) => item.score), [100, 0]);
});

test("rejects missing, duplicate, and unknown requirement IDs", () => {
  assert.throws(
    () => validateEvaluationDraft(stages, duplicateDraft),
    /exactly one result for every framework requirement/i,
  );
});

test("rejects malformed statuses, evidence, timestamps, and coaching arrays", () => {
  assert.throws(() => validateEvaluationDraft(stages, malformedDraft), /invalid evaluation response/i);
});
```

Use complete fixtures. Limits are: evidence and explanation 500 characters, coaching items 300 characters, 10 items per coaching array, and summary 1,000 characters.

- [ ] **Step 2: Verify RED**

Run: `npx.cmd tsx --test lib/call-processing/evaluation.test.ts`

- [ ] **Step 3: Implement strict validation**

```ts
export interface EvaluationInput {
  agentName: string;
  frameworkName: string;
  stages: Stage[];
  transcript: TranscriptionResult;
  model?: "gpt-4o-mini" | "gpt-4o";
}
export type Evaluator = (input: EvaluationInput) => Promise<ValidatedEvaluation>;
export function validateEvaluationDraft(stages: Stage[], value: unknown): ValidatedEvaluation;
export function createOpenAIEvaluator(apiKey: string): Evaluator;
```

Require exactly one result for every framework requirement, unchanged IDs/text, allowed status values, bounded strings/arrays, and `MM:SS` or empty timestamps. Evidence may be empty only for `FAIL` and `NOT_APPLICABLE`. Overwrite model scores with `scoreEvaluation()`.

- [ ] **Step 4: Implement the OpenAI request**

Use `chat.completions.create()`, model `input.model ?? "gpt-4o-mini"`, temperature `0.1`, and strict `json_schema`. Require only requirement results, strengths, improvements, recommendations, and summary. The prompt must prohibit unsupported inference, require evidence/timestamps, retain IDs/text, evaluate every item, and clarify that A/B labels are speakers rather than known roles.

- [ ] **Step 5: Verify GREEN and types**

Run: `npx.cmd tsx --test lib/call-processing/evaluation.test.ts`

Run: `npx.cmd tsc --noEmit --incremental false`

- [ ] **Step 6: Commit**

```powershell
git add -- lib/call-processing/evaluation.ts lib/call-processing/evaluation.test.ts
git commit -m "feat: add structured framework evaluation"
```

---

### Task 4: Supabase Processing Repository

**Files:**
- Create: `lib/call-processing/repository.ts`
- Test: `lib/call-processing/repository.test.ts`

**Interfaces:**
- Consumes: `createAdminClient()`, existing database tables, joined agent/framework data, and `call-recordings` storage.
- Produces: `StoredAudio`, `ClaimResult`, `CallProcessingRepository`, `getStorageObjectPath()`, `getClaimEligibility()`, and `createCallProcessingRepository()`.

- [ ] **Step 1: Write failing helper tests**

```ts
test("extracts an encoded call-recordings path", () => {
  assert.equal(
    getStorageObjectPath("http://127.0.0.1:54321/storage/v1/object/public/call-recordings/uploads/edmark%20test.MP3"),
    "uploads/edmark test.MP3",
  );
});

test("rejects URLs outside the recording bucket", () => {
  assert.throws(() => getStorageObjectPath("https://example.com/audio.mp3"), /invalid recording storage URL/i);
});

test("requires explicit retry for failed and stale active calls", () => {
  assert.equal(getClaimEligibility("pending", false, false), "claim");
  assert.equal(getClaimEligibility("failed", false, false), "retry_required");
  assert.equal(getClaimEligibility("failed", false, true), "claim");
  assert.equal(getClaimEligibility("transcribing", false, true), "already_processing");
  assert.equal(getClaimEligibility("transcribing", true, true), "claim");
  assert.equal(getClaimEligibility("completed", false, false), "already_completed");
});
```

- [ ] **Step 2: Verify RED**

Run: `npx.cmd tsx --test lib/call-processing/repository.test.ts`

- [ ] **Step 3: Define the repository contract**

```ts
export type ClaimResult =
  | { outcome: "claimed"; call: ProcessingCall }
  | { outcome: "already_completed" | "already_processing" | "retry_required" | "not_found" };

export interface StoredAudio {
  blob: Blob;
  fileName: string;
  contentType: string;
}

export interface CallProcessingRepository {
  claim(callId: string, retry: boolean, now: Date): Promise<ClaimResult>;
  downloadAudio(call: ProcessingCall): Promise<StoredAudio>;
  saveTranscript(callId: string, transcript: TranscriptionResult): Promise<void>;
  markAnalyzing(callId: string): Promise<void>;
  saveAnalysis(callId: string, analysis: ValidatedEvaluation): Promise<void>;
  markCompleted(callId: string, durationSeconds: number): Promise<void>;
  markFailed(callId: string, message: string): Promise<void>;
}
```

- [ ] **Step 4: Implement Supabase behavior**

`claim()` reads the call with `agents(name)` and `call_frameworks(name, stages)`, validates the join, checks stale/eligibility, then conditionally updates to `transcribing` while matching the previously read `status` and `updated_at`. A zero-row conditional update returns `already_processing`.

`downloadAudio()` parses the bucket path and calls `.storage.from("call-recordings").download(path)`. Persist transcript and analysis using `upsert(..., { onConflict: "call_id" })`. Transition `transcribing -> analyzing -> completed` conditionally. Set duration only at completion. `markFailed()` stores the safe message without deleting prior transcript data.

Wrap each Supabase failure with the operation name and `formatUnknownError()`; do not expose credentials.

- [ ] **Step 5: Verify GREEN and types**

Run: `npx.cmd tsx --test lib/call-processing/repository.test.ts`

Run: `npx.cmd tsc --noEmit --incremental false`

- [ ] **Step 6: Commit**

```powershell
git add -- lib/call-processing/repository.ts lib/call-processing/repository.test.ts
git commit -m "feat: add call processing repository"
```

---

### Task 5: Processor And POST Endpoint

**Files:**
- Create: `lib/call-processing/processor.ts`
- Test: `lib/call-processing/processor.test.ts`
- Create: `lib/call-processing/process-route.ts`
- Test: `lib/call-processing/process-route.test.ts`
- Create: `app/api/calls/[id]/process/route.ts`

**Interfaces:**
- Consumes: repository, `Transcriber`, `Evaluator`, `getSettingsAction()`, `formatUnknownError()`, and `OPENAI_API_KEY`.
- Produces: `processCall()`, `createProcessCallHandler()`, and the HTTP processing trigger.

- [ ] **Step 1: Write failing processor tests**

Use an in-memory repository fake and injected provider functions:

```ts
test("runs the complete pipeline in order", async () => {
  assert.deepEqual(await processCall({ callId: "call-1", retry: false }, deps), { outcome: "completed" });
  assert.deepEqual(events, [
    "claim", "download", "transcribe", "saveTranscript",
    "markAnalyzing", "evaluate", "saveAnalysis", "markCompleted",
  ]);
});

test("does not call providers for active or completed calls", async () => {
  repository.claimResult = { outcome: "already_processing" };
  assert.equal((await processCall({ callId: "call-1", retry: false }, deps)).outcome, "already_processing");
  assert.equal(providerCalls, 0);
});

test("stores only a safe stage error", async () => {
  transcriberError = new Error("provider failed with sk-secret-value");
  assert.deepEqual(await processCall({ callId: "call-1", retry: false }, deps), {
    outcome: "failed",
    message: "Audio transcription failed. Please retry processing.",
  });
  assert.equal(failedWrites[0].message, "Audio transcription failed. Please retry processing.");
});

test("checks configuration before claiming", async () => {
  assert.equal((await processCall({ callId: "call-1", retry: false }, { ...deps, apiKey: "" })).outcome, "not_configured");
  assert.equal(claimCalls, 0);
});

test("passes the configured evaluation model to the evaluator", async () => {
  await processCall({ callId: "call-1", retry: false }, { ...deps, evaluationModel: "gpt-4o" });
  assert.equal(evaluationInputs[0].model, "gpt-4o");
});
```

Add evaluation-failure and persistence-failure cases.

- [ ] **Step 2: Verify RED**

Run: `npx.cmd tsx --test lib/call-processing/processor.test.ts`

- [ ] **Step 3: Implement orchestration**

```ts
export interface ProcessCallInput { callId: string; retry: boolean; }
export interface ProcessorDependencies {
  apiKey: string;
  evaluationModel: "gpt-4o-mini" | "gpt-4o";
  repository: CallProcessingRepository;
  transcriber: Transcriber;
  evaluator: Evaluator;
  now: () => Date;
}
export async function processCall(
  input: ProcessCallInput,
  dependencies?: ProcessorDependencies,
): Promise<ProcessCallResult>;
```

Check the key before claiming. Production dependencies read only `defaultModel` from `getSettingsAction()`; they must ignore its `openaiApiKey` field and use only `process.env.OPENAI_API_KEY`. Pass `evaluationModel` through `EvaluationInput.model`. Execute the tested order. Track the current stage and map errors to:

- Download: `The uploaded recording could not be read. Please retry processing.`
- Transcription: `Audio transcription failed. Please retry processing.`
- Evaluation: `Call evaluation failed. Please retry processing.`
- Persistence: `The processing result could not be saved. Please retry processing.`

Log detailed errors with call ID and stage, but return and persist only the safe string.

- [ ] **Step 4: Write and run failing HTTP handler tests**

In `process-route.test.ts`, inject a fake `processCall` function and assert UUID validation, empty-body behavior, `retry: true` parsing, no-store headers, and these status mappings:

```ts
const cases = [
  [{ outcome: "completed" }, 200],
  [{ outcome: "already_completed" }, 200],
  [{ outcome: "already_processing" }, 202],
  [{ outcome: "not_found" }, 404],
  [{ outcome: "retry_required" }, 409],
  [{ outcome: "failed", message: "Call evaluation failed." }, 500],
  [{ outcome: "not_configured", message: "OpenAI is not configured." }, 503],
] as const;
```

Run: `npx.cmd tsx --test lib/call-processing/process-route.test.ts`

Expected: FAIL because the handler module does not exist.

- [ ] **Step 5: Implement the POST route**

Define `createProcessCallHandler(runProcessCall)` in `process-route.ts`. Validate UUID params, safely parse an empty body as `retry: false`, reject malformed non-empty JSON with 400, and map outcomes:

- `completed`, `already_completed`: 200.
- `already_processing`: 202.
- `not_found`: 404.
- `retry_required`: 409.
- `failed`: 500.
- `not_configured`: 503.

Return `{ outcome, message? }` with `Cache-Control: no-store`. The App Router file exports Node runtime, forced dynamic behavior, `maxDuration = 300`, and `POST = createProcessCallHandler(processCall)`.

- [ ] **Step 6: Verify GREEN, lint, and types**

Run: `npx.cmd tsx --test lib/call-processing/processor.test.ts lib/call-processing/process-route.test.ts`

Run: `npm.cmd run lint`

Run: `npx.cmd tsc --noEmit --incremental false`

- [ ] **Step 7: Commit**

```powershell
git add -- lib/call-processing/processor.ts lib/call-processing/processor.test.ts lib/call-processing/process-route.ts lib/call-processing/process-route.test.ts app/api/calls/[id]/process/route.ts
git commit -m "feat: process uploaded calls"
```

---

### Task 6: Live Review State And Report

**Files:**
- Create: `lib/call-processing/query.ts`
- Create: `app/api/calls/[id]/route.ts`
- Create: `components/calls/call-review.tsx`
- Create: `components/calls/call-report.tsx`
- Test: `components/calls/call-review.test.tsx`
- Modify: `app/calls/[id]/page.tsx`

**Interfaces:**
- Consumes: call, agent, framework, transcript, analysis relations and both API endpoints.
- Produces: `CallReviewData`, `getCallReviewData()`, `CallReview`, and `CallReport`.

- [ ] **Step 1: Write failing render tests**

```tsx
test("renders persisted active status", () => {
  assert.match(renderToStaticMarkup(<CallReview initialCall={transcribingCall} now={NOW} />), /Transcribing recording/i);
});
test("renders a failure and retry command", () => {
  const html = renderToStaticMarkup(<CallReview initialCall={failedCall} now={NOW} />);
  assert.match(html, /Audio transcription failed/i);
  assert.match(html, /Retry processing/i);
});
test("replaces a stale spinner with retry", () => {
  const html = renderToStaticMarkup(<CallReview initialCall={staleCall} now={NOW} />);
  assert.match(html, /Processing was interrupted/i);
  assert.match(html, /Retry processing/i);
});
test("renders results, evidence, coaching, and speakers", () => {
  const html = renderToStaticMarkup(<CallReport call={completedCall} />);
  assert.match(html, /82%/);
  assert.match(html, /Ask about timeline/);
  assert.match(html, /When are you hoping to start/);
  assert.match(html, /Recommended actions/i);
  assert.match(html, /Speaker A/i);
});

test("polls only healthy active calls", () => {
  assert.equal(shouldPollCall(transcribingCall, new Date(NOW)), true);
  assert.equal(shouldPollCall(failedCall, new Date(NOW)), false);
  assert.equal(shouldPollCall(staleCall, new Date(NOW)), false);
  assert.equal(shouldPollCall(completedCall, new Date(NOW)), false);
});
```

Use complete typed fixtures without unsafe casts.

- [ ] **Step 2: Verify RED**

Run: `npx.cmd tsx --test components/calls/call-review.test.tsx`

- [ ] **Step 3: Implement the report query**

```ts
export interface CallReviewData {
  id: string;
  status: CallStatus;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  fileName: string;
  durationSeconds: number;
  agent: { id: string; name: string };
  framework: { id: string; name: string; stages: Stage[] };
  transcript: { rawText: string; segments: TranscriptSegment[] } | null;
  analysis: {
    overallScore: number;
    stageScores: StageScore[];
    requirementsResults: RequirementResult[];
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    summary: string | null;
  } | null;
}
export async function getCallReviewData(callId: string): Promise<CallReviewData | null>;
```

Normalize Supabase one-to-one objects or arrays and validate JSON arrays. Return `null` only for a missing call; throw formatted query errors.

- [ ] **Step 4: Implement GET status/report**

Validate the UUID, call `getCallReviewData()`, return `{ call }` with no-store caching, 404 for missing, and a safe logged 500 for query errors.

- [ ] **Step 5: Implement the client controller**

Export a pure `shouldPollCall(call, now)` helper used by the component and the tests. `CallReview` starts one non-retry POST for initial `pending`, starts two-second GET polling immediately for active states, prevents overlapping GETs, replaces local state from successful responses, and stops on completed, failed, stale, unmount, or terminal GET errors. A processing POST response with 400, 409, 500, or 503 stops automatic polling and displays its safe message; this is essential for missing configuration because the database remains `pending`. Retry POSTs `{ retry: true }`, disables itself while active, clears the request error after acceptance, then resumes polling.

Render persisted labels: `Queued for processing`, `Transcribing recording`, and `Evaluating framework`. Render an inline connection error when endpoints fail. Completed state requires both transcript and analysis; otherwise show inconsistent-result recovery.

- [ ] **Step 6: Implement the report**

Render header metadata and overall score, stage scores, requirement results grouped by framework order, evidence/timestamps/explanations, strengths, improvements, recommendations, and speaker-separated transcript. Format duration as `MM:SS` and speakers as `Speaker A`, `Speaker B`. Keep existing visual language, single-level cards, wrapping long content, and no unrelated UI changes.

- [ ] **Step 7: Replace the hardcoded page**

Server-load the call, call `notFound()` when absent, retain the back link and tracking ID, and render:

```tsx
<CallReview initialCall={call} now={new Date().toISOString()} />
```

- [ ] **Step 8: Verify GREEN, lint, and types**

Run: `npx.cmd tsx --test components/calls/call-review.test.tsx`

Run: `npm.cmd run lint`

Run: `npx.cmd tsc --noEmit --incremental false`

- [ ] **Step 9: Commit**

```powershell
git add -- lib/call-processing/query.ts app/api/calls/[id]/route.ts components/calls/call-review.tsx components/calls/call-report.tsx components/calls/call-review.test.tsx app/calls/[id]/page.tsx
git commit -m "feat: show live call processing reports"
```

---

### Task 7: Configuration And End-To-End Verification

**Files:**
- Modify: `.env.example`
- Verify without committing: `.env.local`
- Verify: all implementation files and `recording/edmark test.MP3`

**Interfaces:**
- Consumes: Tasks 1 through 6, local Supabase, existing `callsy-qa` container, and the existing pending call.
- Produces: documented configuration and end-to-end evidence.

- [ ] **Step 1: Document the required secret**

```dotenv
# Server-only OpenAI credential used for transcription and QA evaluation.
OPENAI_API_KEY=
```

Never put a real key in `.env.example`, source control, logs, snapshots, or browser-visible code.

- [ ] **Step 2: Run the complete test suite**

Run:

```powershell
npx.cmd tsx --test app/*.test.tsx components/layout/*.test.tsx components/calls/*.test.tsx lib/*.test.ts lib/call-processing/*.test.ts
```

Expected: all existing and new tests pass with zero failures, including the polling-state test.

- [ ] **Step 3: Run static and production checks**

Run each command separately:

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit --incremental false
npm.cmd run build
git diff --check
```

Expected: every command exits 0. CRLF warnings are acceptable; whitespace errors are not.

- [ ] **Step 4: Check configuration without exposing secrets**

```powershell
node --env-file=.env.local -e "console.log(JSON.stringify({openaiConfigured:Boolean(process.env.OPENAI_API_KEY),supabaseConfigured:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}))"
```

Expected: both values are `true`. If OpenAI is false, stop before the paid request and ask the user to add the key to `.env.local`; do not accept it in chat.

- [ ] **Step 5: Restart and health-check Docker**

Restart the existing `callsy-qa` container with its current launch configuration. Confirm the existing call URL returns HTTP 200 and inspect startup logs.

- [ ] **Step 6: Process the existing pending call**

Open call `ea04d9cd-4e05-4178-b316-2f9ccc2a0b95`. Verify persisted progression through `transcribing`, `analyzing`, and `completed`; do not infer progress from animation.

Query Supabase and confirm:

- `duration_seconds > 0`.
- Exactly one non-empty transcript with diarized segments.
- Exactly one analysis with score between 0 and 100.
- Requirement result count equals framework requirement count.
- Logs show one transcription and one evaluation attempt without secrets.
- Desktop and mobile report screenshots show the score, evidence, coaching, and transcript without overlap.

Retain the user's call and result. Delete only test-only records and objects.

- [ ] **Step 7: Commit configuration documentation**

```powershell
git add -- .env.example
git commit -m "docs: configure OpenAI call processing"
```

- [ ] **Step 8: Final audit**

Review `git status --short` and `git diff --stat`. Confirm no secret, build output, user recording, temporary browser profile, or unrelated file was staged. Report exact test counts, build result, Docker URL, final call status, and anything blocked by missing credentials.
