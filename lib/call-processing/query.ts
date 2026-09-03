import { createAdminClient } from "@/lib/supabase/admin";
import { formatUnknownError } from "@/lib/errors";
import type {
  CallStatus,
  Stage,
  TranscriptSegment,
  StageScore,
  RequirementResult,
} from "@/types/database";

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

export async function getCallReviewData(
  callId: string
): Promise<CallReviewData | null> {
  const supabase = createAdminClient();

  const { data: call, error } = await supabase
    .from("calls")
    .select(`
      *,
      agents(id, name),
      call_frameworks(id, name, stages),
      transcripts(raw_text, segments),
      call_analyses(overall_score, stage_scores, requirements_results, strengths, improvements, recommendations, summary)
    `)
    .eq("id", callId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch call review data: ${formatUnknownError(error, "Unknown query error")}`
    );
  }

  if (!call) {
    return null;
  }

  // Normalize agent
  const agentObj = Array.isArray(call.agents) ? call.agents[0] : call.agents;
  const agent = {
    id: agentObj?.id ?? "",
    name: agentObj?.name ?? "Unknown Agent",
  };

  // Normalize framework
  const fwObj = Array.isArray(call.call_frameworks)
    ? call.call_frameworks[0]
    : call.call_frameworks;
  const framework = {
    id: fwObj?.id ?? "",
    name: fwObj?.name ?? "Unknown Framework",
    stages: (fwObj?.stages as unknown as Stage[]) ?? [],
  };

  // Normalize transcript
  const trObj = Array.isArray(call.transcripts)
    ? call.transcripts[0]
    : call.transcripts;
  const transcript = trObj
    ? {
        rawText: trObj.raw_text,
        segments: (trObj.segments as unknown as TranscriptSegment[]) ?? [],
      }
    : null;

  // Normalize analysis
  const anObj = Array.isArray(call.call_analyses)
    ? call.call_analyses[0]
    : call.call_analyses;
  const analysis = anObj
    ? {
        overallScore: anObj.overall_score,
        stageScores: (anObj.stage_scores as unknown as StageScore[]) ?? [],
        requirementsResults:
          (anObj.requirements_results as unknown as RequirementResult[]) ?? [],
        strengths: (anObj.strengths as unknown as string[]) ?? [],
        improvements: (anObj.improvements as unknown as string[]) ?? [],
        recommendations: (anObj.recommendations as unknown as string[]) ?? [],
        summary: anObj.summary ?? null,
      }
    : null;

  return {
    id: call.id,
    status: call.status,
    errorMessage: call.error_message,
    createdAt: call.created_at,
    updatedAt: call.updated_at,
    fileName: call.file_name,
    durationSeconds: call.duration_seconds,
    agent,
    framework,
    transcript,
    analysis,
  };
}

