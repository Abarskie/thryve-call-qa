import type {
  Stage,
  RequirementResult,
  StageScore,
  TranscriptSegment,
  CallStatus,
} from "@/types/database";

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

