import { getRawWorkspaceSettings } from "@/app/actions/settings";
import {
  type CallProcessingRepository,
  createCallProcessingRepository,
} from "./repository";
import {
  type Transcriber,
  createOpenAITranscriber,
  createGeminiTranscriber,
} from "./transcription";
import { type Evaluator, createOpenAIEvaluator } from "./evaluation";
import type { ProcessCallResult } from "./types";

export interface ProcessCallInput {
  callId: string;
  retry: boolean;
}

export interface ProcessorDependencies {
  apiKey?: string;
  geminiApiKey?: string;
  evaluationModel?: "gpt-4o-mini" | "gpt-4o" | "gemini-2.0-flash";
  repository: CallProcessingRepository;
  transcriber: Transcriber;
  evaluator: Evaluator;
  now: () => Date;
}

export async function processCall(
  input: ProcessCallInput,
  dependencies?: ProcessorDependencies
): Promise<ProcessCallResult> {
  const rawSettings = await getRawWorkspaceSettings().catch(() => null);

  const evaluationModel =
    dependencies?.evaluationModel ??
    rawSettings?.defaultModel ??
    "gpt-4o-mini";

  const apiKey =
    dependencies?.apiKey ??
    (rawSettings?.rawOpenaiApiKey || (process.env.OPENAI_API_KEY || ""));

  const geminiApiKey =
    dependencies?.geminiApiKey ??
    (rawSettings?.rawGeminiApiKey || (process.env.GEMINI_API_KEY || ""));

  const isGemini = evaluationModel === "gemini-2.0-flash";

  if (isGemini && !geminiApiKey && !apiKey) {
    return {
      outcome: "not_configured",
      message: "Gemini API key is not configured.",
    };
  }

  if (!isGemini && !apiKey) {
    return {
      outcome: "not_configured",
      message: "OpenAI is not configured.",
    };
  }

  const repository =
    dependencies?.repository ?? createCallProcessingRepository();
  const transcriber =
    dependencies?.transcriber ??
    (apiKey
      ? createOpenAITranscriber(apiKey)
      : createGeminiTranscriber(geminiApiKey));
  const evaluator =
    dependencies?.evaluator ??
    createOpenAIEvaluator(apiKey, geminiApiKey);
  const now = dependencies?.now ?? (() => new Date());

  const claimResult = await repository.claim(input.callId, input.retry, now());
  if (claimResult.outcome !== "claimed") {
    return { outcome: claimResult.outcome };
  }

  const call = claimResult.call;
  let currentStage: "download" | "transcribe" | "evaluation" | "persistence" =
    "download";

  try {
    currentStage = "download";
    const audio = await repository.downloadAudio(call);

    currentStage = "transcribe";
    const transcript = await transcriber(audio);

    currentStage = "persistence";
    await repository.saveTranscript(input.callId, transcript);
    await repository.markAnalyzing(input.callId);

    currentStage = "evaluation";
    const analysis = await evaluator({
      agentName: call.agentName,
      frameworkName: call.frameworkName,
      stages: call.stages,
      transcript,
      model: evaluationModel,
    });

    currentStage = "persistence";
    await repository.saveAnalysis(input.callId, analysis);
    await repository.markCompleted(input.callId, transcript.durationSeconds);

    return { outcome: "completed" };
  } catch (err: unknown) {
    let safeMessage = "Processing failed. Please retry processing.";
    if (currentStage === "download") {
      safeMessage = "The uploaded recording could not be read. Please retry processing.";
    } else if (currentStage === "transcribe") {
      safeMessage = "Audio transcription failed. Please retry processing.";
    } else if (currentStage === "evaluation") {
      safeMessage = "Call evaluation failed. Please retry processing.";
    } else if (currentStage === "persistence") {
      safeMessage = "The processing result could not be saved. Please retry processing.";
    }

    console.error(`Call processing failed [callId=${input.callId}, stage=${currentStage}]:`, err);

    try {
      await repository.markFailed(input.callId, safeMessage);
    } catch (persistErr) {
      console.error(`Failed to mark call failed [callId=${input.callId}]:`, persistErr);
    }

    return {
      outcome: "failed",
      message: safeMessage,
    };
  }
}

