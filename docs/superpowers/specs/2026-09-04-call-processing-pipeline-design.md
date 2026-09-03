# Call Processing Pipeline Design

## Purpose

Implement the MVP call-processing flow so an uploaded audio recording is actually transcribed, evaluated against its selected QA framework, persisted, and displayed as a call report.

The implementation stays inside the existing Next.js application and Supabase project. It does not introduce Redis, a message broker, a separate worker service, or other infrastructure.

## Scope

This feature includes:

- Starting processing for an uploaded call.
- Downloading the recording from private Supabase Storage.
- Speaker-diarized transcription through OpenAI.
- Structured framework evaluation through OpenAI.
- Validation and persistence of transcript and analysis data.
- Real database-backed processing states.
- Failure reporting and safe retries.
- Rendering the completed call report.
- Processing the existing pending call after OpenAI credentials are configured.

This feature does not include:

- A durable external job queue.
- Parallel batch processing.
- Automatic imports from phone or CRM systems.
- Real-time transcription.
- Notifications or billing.
- Changes to authentication or organization-level authorization.

## Architecture

The Next.js application owns a server-only call processor. A route handler starts processing for one call ID and waits for the processor to finish. The review page triggers that endpoint and polls persisted call state independently, so the UI reflects database truth instead of assuming work is active.

Processing is idempotent. A conditional status update claims a call before any OpenAI request begins. Transcript and analysis rows use their existing unique `call_id` constraints and are written with upsert semantics. Refreshes, duplicate browser requests, and retries therefore cannot create duplicate records.

This architecture is suitable for the current low-volume Docker MVP. An application restart can interrupt an active request, so stale active calls are made recoverable. A durable queue can replace the triggering mechanism later without changing the processor's data contract or the report UI.

## Components

### Processing Service

A server-only module coordinates the pipeline and exposes a focused operation equivalent to:

```ts
processCall(callId: string): Promise<ProcessCallResult>
```

The service is responsible for status transitions and orchestration. Transcription, evaluation, output validation, and persistence remain separate focused modules or functions so each can be unit tested.

### Processing Route

`POST /api/calls/[id]/process` validates the call ID, invokes the processor, and returns a structured response. It never receives an OpenAI key from the browser.

Expected outcomes:

- `200`: processing completed, or the call was already completed.
- `202`: another request is already processing this call.
- `404`: the call does not exist.
- `409`: the call cannot currently be claimed.
- `500`: processing failed after the call was claimed.
- `503`: required server-side OpenAI configuration is missing.

### Call Data Query

A server-side query loads the call with its agent, framework, transcript, and analysis. The result is normalized into a typed view model used by both the initial server render and status refresh endpoint.

### Review Page

The existing `/calls/[id]` route becomes a real state-driven page. A small client component starts eligible work and polls for status while a call is active. Completed data is rendered by report components without changing the application shell or unrelated pages.

## Processing Lifecycle

The database remains the source of truth. Existing statuses are used as follows:

1. `pending`: uploaded and eligible to be claimed.
2. `transcribing`: claimed; storage download and transcription are active.
3. `analyzing`: transcript is saved; framework evaluation is active.
4. `completed`: transcript and analysis are saved and ready to display.
5. `failed`: processing stopped; `error_message` contains a safe, actionable summary.

The normal flow is:

```text
pending
  -> transcribing
  -> transcript saved
  -> analyzing
  -> analysis saved
  -> completed
```

Any failure after the claim changes the call to `failed`. A retry clears the prior error and claims the call again. Existing transcript or analysis data is reused or replaced safely through upserts.

An active call is stale when its `updated_at` value has not changed for 15 minutes. The UI offers retry for stale `transcribing` or `analyzing` calls. The retry operation conditionally reclaims only that stale record, preventing takeover of a healthy active request.

## Transcription

The processor obtains the storage object from the call record rather than trusting a browser-provided URL. The existing `audio_url` is parsed only to locate the object in the `call-recordings` bucket; storage access uses the server-side Supabase client.

OpenAI transcription uses:

- Model: `gpt-4o-transcribe-diarize`.
- Response format: `diarized_json`.
- Chunking strategy: `auto`, required for recordings longer than 30 seconds.
- Input filename and MIME type preserved from the uploaded object.

The returned text is stored in `transcripts.raw_text`. Diarized segments are normalized to the existing JSON shape:

```json
{
  "speaker": "A",
  "start_time": 0,
  "end_time": 4.5,
  "text": "Hello, this is Alex from Acme."
}
```

OpenAI's speaker identifiers are retained because the system has no enrolled voice references that could reliably identify which speaker is the agent. The report presents these as `Speaker A`, `Speaker B`, and so on. The evaluator receives the selected agent's name and is instructed to infer roles only when the transcript itself supports that inference.

The call's `duration_seconds` is updated from the transcription response.

## Framework Evaluation

The evaluator loads the exact framework associated with the call. It sends the framework stages, requirements, normalized transcript segments, agent name, and strict evaluation instructions to the server-configured OpenAI client.

The evaluation model uses the existing workspace model selection and defaults to `gpt-4o-mini`. The request requires structured JSON matching these persisted fields:

- `overall_score`: number from 0 through 100.
- `stage_scores`: one result for every framework stage.
- `requirements_results`: one result for every requirement.
- `strengths`: concise strings supported by the transcript.
- `improvements`: concise strings describing observed gaps.
- `recommendations`: actionable coaching strings.
- `summary`: concise call-level assessment.

Each requirement result includes:

- Framework requirement and stage identifiers.
- Requirement text.
- `PASS`, `PARTIAL`, `FAIL`, or `NOT_APPLICABLE`.
- Numeric score from 0 through 100.
- Transcript evidence, or an explicit empty value when no evidence exists.
- Timestamp derived from a matching transcript segment when available.
- Short explanation.

The model may assess evidence and status, but the application validates identifiers, enum values, array completeness, string lengths, and numeric bounds. It recalculates stage and overall scores from validated requirement results and framework weights before persistence. Model-supplied aggregate scores are not trusted as the final business calculation.

`NOT_APPLICABLE` requirements are excluded from the applicable score denominator. A stage with no applicable requirements receives a null display score and contributes no weight; remaining applicable stage weights are normalized for the overall score.

## Configuration And Security

`OPENAI_API_KEY` is read only from the server environment. It is never serialized to a client component, returned by a server action, logged, or stored in call records.

The initial implementation does not persist API credentials entered through the current Settings page. Docker processing requires `OPENAI_API_KEY` in `.env.local` and a container restart after configuration changes. If the variable is missing, processing stops before claiming a call and returns a clear configuration error.

Supabase service-role access remains server-only. OpenAI errors are logged with the call ID and pipeline stage, while API responses and `calls.error_message` contain a safe summary without credentials, request headers, or full provider payloads.

## Idempotency And Concurrency

Only one request may claim a call. The claim is implemented as a conditional database update from an eligible state to `transcribing`. A request that loses the claim reads the current status and returns without calling OpenAI.

The following cases are handled explicitly:

- `completed`: return the existing result without new OpenAI calls.
- Healthy `transcribing` or `analyzing`: return `202`.
- `pending`: claim and process.
- `failed`: process only through an explicit retry request.
- Stale `transcribing` or `analyzing`: process only through an explicit retry request.

Database writes occur in pipeline order. `completed` is written only after both transcript and analysis rows exist. A failure never deletes the uploaded recording or a successfully saved transcript.

## User Interface

The call review page renders one of four views based on persisted data:

### Active

Show the tracking ID, current stage label, spinner, and concise stage-specific copy. Poll every two seconds while status is `pending`, `transcribing`, or `analyzing`. Polling stops on `completed`, `failed`, component unmount, or a terminal HTTP error.

### Failed

Show the safe error message and a `Retry processing` command. The retry button is disabled while its request is active. Missing OpenAI configuration is explained directly and does not imply that audio must be uploaded again.

### Stale

If an active status is older than 15 minutes, replace the indefinite spinner with an interrupted-processing message and a retry command.

### Completed Report

Render the MVP call report in the existing visual language:

- Header with agent, framework, call date, filename, duration, and overall score.
- Stage score summary.
- Requirement results grouped by stage, including status, evidence, timestamp, and explanation.
- Coaching sections for strengths, improvements, and recommendations.
- Full speaker-separated transcript with timestamps.

No unrelated navigation, dashboard, framework, agent, or settings UI is redesigned.

## Error Handling

Errors are categorized into safe messages:

- Missing OpenAI configuration.
- Recording unavailable from storage.
- Unsupported or unreadable recording.
- OpenAI transcription failure.
- Invalid or incomplete transcription response.
- OpenAI evaluation failure.
- Invalid or incomplete structured evaluation.
- Database persistence failure.

The server logs retain enough stage and call context for diagnosis. Client-facing messages never expose secrets or raw stack traces. Retry is offered for provider, network, stale-job, and transient persistence failures. Validation failures are also retryable after configuration or prompt corrections, without requiring a new upload.

## Testing Strategy

Implementation follows test-driven development.

Unit tests cover:

- Transcription response normalization.
- Framework and evaluation response validation.
- Score calculation, including `NOT_APPLICABLE` behavior.
- Status eligibility and stale-call detection.
- Safe error formatting.

Processor tests use mocked OpenAI and Supabase boundaries to verify:

- Successful status order and persisted records.
- Duplicate requests make only one provider call.
- Completed calls are not processed again.
- Each failure stage writes `failed` and a safe error.
- Retry reuses or upserts existing transcript data correctly.

Route and UI tests verify:

- HTTP outcomes for completed, active, missing, failed, and unconfigured calls.
- Polling stops at terminal status.
- Active, failed, stale, and completed report states render correctly.
- Retry is disabled while active and does not duplicate requests.

Final verification includes:

- Full automated test suite.
- ESLint.
- TypeScript with no emit.
- Next.js production build.
- Docker restart with `OPENAI_API_KEY` configured.
- A real end-to-end run using `recording/edmark test.MP3`.
- Confirmation that statuses progress, transcript and analysis rows exist, and the report renders.
- Cleanup of any test-only call and storage records; the user's existing pending call is retained and processed as requested.

## Acceptance Criteria

The feature is complete when:

1. A valid uploaded recording progresses through persisted processing statuses without manual database changes.
2. Refreshing the review page does not reset progress or create duplicate processing.
3. A successful run stores one transcript and one analysis linked to the call.
4. The completed page shows the framework evaluation, evidence, coaching, and diarized transcript.
5. Failures stop the spinner, persist a safe error, and allow a controlled retry.
6. Missing OpenAI configuration is reported clearly and does not start processing.
7. The existing pending call can be processed after the API key is configured.
8. Automated tests, lint, type checking, production build, and the real Docker end-to-end run pass.

## Future Migration Path

If processing volume, hosting time limits, or restart reliability become demonstrated constraints, a durable queue or managed background worker can call the same server-only processor. The statuses, idempotency rules, storage format, analysis schema, polling contract, and report UI remain unchanged.
