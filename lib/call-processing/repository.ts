import { createAdminClient } from "@/lib/supabase/admin";
import { formatUnknownError } from "@/lib/errors";
import type { CallStatus, Stage, Json } from "@/types/database";
import type {
  ProcessingCall,
  TranscriptionResult,
  ValidatedEvaluation,
} from "./types";
import { isStaleCall } from "./scoring";

export type ClaimResult =
  | { outcome: "claimed"; call: ProcessingCall }
  | {
      outcome:
        | "already_completed"
        | "already_processing"
        | "retry_required"
        | "not_found";
    };

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

export function getStorageObjectPath(audioUrl: string): string {
  const marker = "call-recordings/";
  const index = audioUrl.indexOf(marker);
  if (index === -1) {
    throw new Error(
      `Invalid recording storage URL: "${audioUrl}" does not contain "${marker}".`
    );
  }
  const rawPath = audioUrl.substring(index + marker.length);
  return decodeURIComponent(rawPath);
}

export function getClaimEligibility(
  status: CallStatus,
  isStale: boolean,
  isRetry: boolean
): "claim" | "already_completed" | "already_processing" | "retry_required" {
  if (status === "completed") {
    return "already_completed";
  }
  if (status === "pending") {
    return "claim";
  }
  if (status === "failed") {
    return isRetry ? "claim" : "retry_required";
  }
  if (status === "transcribing" || status === "analyzing") {
    if (isStale) {
      return isRetry ? "claim" : "retry_required";
    }
    return "already_processing";
  }
  return "retry_required";
}

export function createCallProcessingRepository(): CallProcessingRepository {
  const supabase = createAdminClient();

  return {
    async claim(callId: string, retry: boolean, now: Date): Promise<ClaimResult> {
      try {
        const { data: call, error } = await supabase
          .from("calls")
          .select("*, agents(name), call_frameworks(name, stages)")
          .eq("id", callId)
          .maybeSingle();

        if (error) {
          throw new Error(
            `Supabase claim query failed: ${formatUnknownError(error, "Unknown database error")}`
          );
        }

        if (!call) {
          return { outcome: "not_found" };
        }

        const isStale = isStaleCall(call.status, call.updated_at, now);
        const eligibility = getClaimEligibility(call.status, isStale, retry);

        if (eligibility !== "claim") {
          return { outcome: eligibility };
        }

        const { data: claimed, error: updateError } = await supabase
          .from("calls")
          .update({
            status: "transcribing",
            error_message: null,
            updated_at: now.toISOString(),
          })
          .eq("id", callId)
          .eq("status", call.status)
          .eq("updated_at", call.updated_at)
          .select()
          .maybeSingle();

        if (updateError) {
          throw new Error(
            `Supabase claim update failed: ${formatUnknownError(updateError, "Unknown database error")}`
          );
        }

        if (!claimed) {
          return { outcome: "already_processing" };
        }

        const agentName =
          (call.agents as unknown as { name?: string })?.name ?? "Unknown Agent";
        const frameworkObj = call.call_frameworks as unknown as {
          name?: string;
          stages?: Stage[];
        };
        const frameworkName = frameworkObj?.name ?? "Default Framework";
        const stages = (frameworkObj?.stages as Stage[]) ?? [];

        return {
          outcome: "claimed",
          call: {
            id: call.id,
            status: "transcribing",
            updatedAt: claimed.updated_at,
            audioUrl: call.audio_url,
            fileName: call.file_name,
            agentName,
            frameworkName,
            stages,
          },
        };
      } catch (err) {
        throw new Error(
          `Claim operation failed: ${formatUnknownError(err, "Unexpected error")}`
        );
      }
    },

    async downloadAudio(call: ProcessingCall): Promise<StoredAudio> {
      try {
        const path = getStorageObjectPath(call.audioUrl);
        const { data, error } = await supabase.storage
          .from("call-recordings")
          .download(path);

        if (error || !data) {
          throw new Error(
            `Storage download failed: ${formatUnknownError(error, "File could not be downloaded")}`
          );
        }

        return {
          blob: data,
          fileName: call.fileName,
          contentType: data.type || "audio/mpeg",
        };
      } catch (err) {
        throw new Error(
          `DownloadAudio operation failed: ${formatUnknownError(err, "Unexpected error")}`
        );
      }
    },

    async saveTranscript(
      callId: string,
      transcript: TranscriptionResult
    ): Promise<void> {
      try {
        const { error } = await supabase.from("transcripts").upsert(
          {
            call_id: callId,
            raw_text: transcript.text,
            segments: transcript.segments as unknown as Json,
          },
          { onConflict: "call_id" }
        );

        if (error) {
          throw new Error(
            `SaveTranscript failed: ${formatUnknownError(error, "Failed to save transcript")}`
          );
        }
      } catch (err) {
        throw new Error(
          `SaveTranscript operation failed: ${formatUnknownError(err, "Unexpected error")}`
        );
      }
    },

    async markAnalyzing(callId: string): Promise<void> {
      try {
        const { error } = await supabase
          .from("calls")
          .update({
            status: "analyzing",
            updated_at: new Date().toISOString(),
          })
          .eq("id", callId);

        if (error) {
          throw new Error(
            `MarkAnalyzing failed: ${formatUnknownError(error, "Failed to update call status")}`
          );
        }
      } catch (err) {
        throw new Error(
          `MarkAnalyzing operation failed: ${formatUnknownError(err, "Unexpected error")}`
        );
      }
    },

    async saveAnalysis(
      callId: string,
      analysis: ValidatedEvaluation
    ): Promise<void> {
      try {
        const { error } = await supabase.from("call_analyses").upsert(
          {
            call_id: callId,
            overall_score: analysis.overall_score,
            stage_scores: analysis.stage_scores as unknown as Json,
            requirements_results: analysis.requirements_results as unknown as Json,
            strengths: analysis.strengths as unknown as Json,
            improvements: analysis.improvements as unknown as Json,
            recommendations: analysis.recommendations as unknown as Json,
            summary: analysis.summary,
          },
          { onConflict: "call_id" }
        );

        if (error) {
          throw new Error(
            `SaveAnalysis failed: ${formatUnknownError(error, "Failed to save analysis")}`
          );
        }
      } catch (err) {
        throw new Error(
          `SaveAnalysis operation failed: ${formatUnknownError(err, "Unexpected error")}`
        );
      }
    },

    async markCompleted(
      callId: string,
      durationSeconds: number
    ): Promise<void> {
      try {
        const { error } = await supabase
          .from("calls")
          .update({
            status: "completed",
            duration_seconds: durationSeconds,
            updated_at: new Date().toISOString(),
          })
          .eq("id", callId);

        if (error) {
          throw new Error(
            `MarkCompleted failed: ${formatUnknownError(error, "Failed to complete call")}`
          );
        }
      } catch (err) {
        throw new Error(
          `MarkCompleted operation failed: ${formatUnknownError(err, "Unexpected error")}`
        );
      }
    },

    async markFailed(callId: string, message: string): Promise<void> {
      try {
        const { error } = await supabase
          .from("calls")
          .update({
            status: "failed",
            error_message: message,
            updated_at: new Date().toISOString(),
          })
          .eq("id", callId);

        if (error) {
          throw new Error(
            `MarkFailed failed: ${formatUnknownError(error, "Failed to mark call as failed")}`
          );
        }
      } catch (err) {
        throw new Error(
          `MarkFailed operation failed: ${formatUnknownError(err, "Unexpected error")}`
        );
      }
    },
  };
}
