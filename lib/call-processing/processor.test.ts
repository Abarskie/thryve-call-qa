import test from "node:test";
import assert from "node:assert/strict";
import type {
  CallProcessingRepository,
  ClaimResult,
} from "./repository";
import type {
  ProcessingCall,
  TranscriptionResult,
  ValidatedEvaluation,
} from "./types";
import { processCall, type ProcessorDependencies } from "./processor";
import type { EvaluationInput } from "./evaluation";

test("processor unit tests", async (t) => {
  const sampleCall: ProcessingCall = {
    id: "call-1",
    status: "transcribing",
    updatedAt: "2026-09-04T00:00:00.000Z",
    audioUrl: "http://localhost/call-recordings/test.mp3",
    fileName: "test.mp3",
    agentName: "Agent Smith",
    frameworkName: "Sales Framework",
    stages: [],
  };

  const sampleTranscript: TranscriptionResult = {
    text: "Hello",
    durationSeconds: 10,
    segments: [
      { speaker: "A", start_time: 0, end_time: 10, text: "Hello" },
    ],
  };

  const sampleAnalysis: ValidatedEvaluation = {
    overall_score: 85,
    stage_scores: [],
    requirements_results: [],
    strengths: ["Great intro"],
    improvements: [],
    recommendations: [],
    summary: "Solid call",
  };

  function createMockDeps() {
    const events: string[] = [];
    const failedWrites: { message: string }[] = [];
    const evaluationInputs: EvaluationInput[] = [];
    let providerCalls = 0;
    let claimCalls = 0;
    let transcriberError: Error | null = null;
    let evaluatorError: Error | null = null;
    let saveAnalysisError: Error | null = null;

    let claimResult: ClaimResult = {
      outcome: "claimed",
      call: sampleCall,
    };

    const repository: CallProcessingRepository = {
      async claim() {
        claimCalls++;
        events.push("claim");
        return claimResult;
      },
      async downloadAudio() {
        events.push("download");
        return {
          blob: new Blob(["fake-audio"]),
          fileName: "test.mp3",
          contentType: "audio/mpeg",
        };
      },
      async saveTranscript() {
        events.push("saveTranscript");
      },
      async markAnalyzing() {
        events.push("markAnalyzing");
      },
      async saveAnalysis() {
        if (saveAnalysisError) {
          throw saveAnalysisError;
        }
        events.push("saveAnalysis");
      },
      async markCompleted() {
        events.push("markCompleted");
      },
      async markFailed(_callId, message) {
        failedWrites.push({ message });
      },
    };

    const transcriber = async () => {
      providerCalls++;
      events.push("transcribe");
      if (transcriberError) throw transcriberError;
      return sampleTranscript;
    };

    const evaluator = async (input: EvaluationInput) => {
      providerCalls++;
      evaluationInputs.push(input);
      events.push("evaluate");
      if (evaluatorError) throw evaluatorError;
      return sampleAnalysis;
    };

    const deps: ProcessorDependencies = {
      apiKey: "sk-test-key",
      evaluationModel: "gpt-4o-mini",
      repository,
      transcriber,
      evaluator,
      now: () => new Date("2026-09-04T01:00:00.000Z"),
    };

    return {
      deps,
      events,
      failedWrites,
      evaluationInputs,
      getProviderCalls: () => providerCalls,
      getClaimCalls: () => claimCalls,
      setClaimResult: (res: ClaimResult) => {
        claimResult = res;
      },
      setTranscriberError: (err: Error | null) => {
        transcriberError = err;
      },
      setEvaluatorError: (err: Error | null) => {
        evaluatorError = err;
      },
      setSaveAnalysisError: (err: Error | null) => {
        saveAnalysisError = err;
      },
    };
  }

  await t.test("runs the complete pipeline in order", async () => {
    const mock = createMockDeps();
    const result = await processCall({ callId: "call-1", retry: false }, mock.deps);
    assert.deepEqual(result, { outcome: "completed" });
    assert.deepEqual(mock.events, [
      "claim",
      "download",
      "transcribe",
      "saveTranscript",
      "markAnalyzing",
      "evaluate",
      "saveAnalysis",
      "markCompleted",
    ]);
  });

  await t.test("does not call providers for active or completed calls", async () => {
    const mock = createMockDeps();
    mock.setClaimResult({ outcome: "already_processing" });
    const result = await processCall({ callId: "call-1", retry: false }, mock.deps);
    assert.equal(result.outcome, "already_processing");
    assert.equal(mock.getProviderCalls(), 0);
  });

  await t.test("stores only a safe stage error", async () => {
    const mock = createMockDeps();
    mock.setTranscriberError(new Error("provider failed with sk-secret-value"));
    const result = await processCall({ callId: "call-1", retry: false }, mock.deps);
    assert.deepEqual(result, {
      outcome: "failed",
      message: "Audio transcription failed. Please retry processing.",
    });
    assert.equal(mock.failedWrites[0].message, "Audio transcription failed. Please retry processing.");
  });

  await t.test("checks configuration before claiming", async () => {
    const mock = createMockDeps();
    const result = await processCall(
      { callId: "call-1", retry: false },
      { ...mock.deps, apiKey: "" }
    );
    assert.equal(result.outcome, "not_configured");
    assert.equal(mock.getClaimCalls(), 0);
  });

  await t.test("passes the configured evaluation model to the evaluator", async () => {
    const mock = createMockDeps();
    await processCall(
      { callId: "call-1", retry: false },
      { ...mock.deps, evaluationModel: "gpt-4o" }
    );
    assert.equal(mock.evaluationInputs[0].model, "gpt-4o");
  });

  await t.test("passes gemini-2.0-flash to the evaluator with geminiApiKey", async () => {
    const mock = createMockDeps();
    await processCall(
      { callId: "call-1", retry: false },
      { ...mock.deps, apiKey: "", geminiApiKey: "AIza-test", evaluationModel: "gemini-2.0-flash" }
    );
    assert.equal(mock.evaluationInputs[0].model, "gemini-2.0-flash");
  });

  await t.test("handles evaluation failure safely", async () => {
    const mock = createMockDeps();
    mock.setEvaluatorError(new Error("Evaluation error with sensitive token"));
    const result = await processCall({ callId: "call-1", retry: false }, mock.deps);
    assert.deepEqual(result, {
      outcome: "failed",
      message: "Call evaluation failed. Please retry processing.",
    });
    assert.equal(mock.failedWrites[0].message, "Call evaluation failed. Please retry processing.");
  });

  await t.test("handles persistence failure safely", async () => {
    const mock = createMockDeps();
    mock.setSaveAnalysisError(new Error("DB timeout"));
    const result = await processCall({ callId: "call-1", retry: false }, mock.deps);
    assert.deepEqual(result, {
      outcome: "failed",
      message: "The processing result could not be saved. Please retry processing.",
    });
    assert.equal(mock.failedWrites[0].message, "The processing result could not be saved. Please retry processing.");
  });
});
