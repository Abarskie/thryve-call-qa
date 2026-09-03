import type {
  Stage,
  RequirementResult,
  StageScore,
  CallStatus,
} from "@/types/database";

export const STALE_AFTER_MS = 15 * 60 * 1000;

export function isStaleCall(
  status: CallStatus,
  updatedAt: string,
  now: Date
): boolean {
  if (status !== "transcribing" && status !== "analyzing") {
    return false;
  }
  const updatedTime = new Date(updatedAt).getTime();
  const diff = now.getTime() - updatedTime;
  return diff > STALE_AFTER_MS;
}

export function scoreEvaluation(
  stages: Stage[],
  requirements: RequirementResult[]
): {
  requirements: RequirementResult[];
  stageScores: StageScore[];
  overallScore: number;
} {
  // 1. Map requirements to deterministic scores
  const updatedRequirements: RequirementResult[] = requirements.map((item) => {
    let score = 0;
    if (item.status === "PASS") {
      score = 100;
    } else if (item.status === "PARTIAL") {
      score = 50;
    } else if (item.status === "FAIL" || item.status === "NOT_APPLICABLE") {
      score = 0;
    }
    return {
      ...item,
      score,
    };
  });

  // 2. Calculate stage scores
  const stageScores: StageScore[] = [];
  let applicableWeightTotal = 0;

  for (const stage of stages) {
    const stageReqs = updatedRequirements.filter(
      (r) => r.stage_id === stage.id
    );
    const applicableReqs = stageReqs.filter(
      (r) => r.status !== "NOT_APPLICABLE"
    );

    let stageScoreValue = 0;
    if (applicableReqs.length > 0) {
      const sum = applicableReqs.reduce((acc, r) => acc + r.score, 0);
      stageScoreValue = Math.round((sum / applicableReqs.length) * 100) / 100;
      applicableWeightTotal += stage.weight;
    }

    stageScores.push({
      stage_id: stage.id,
      stage_name: stage.name,
      score: stageScoreValue,
      weight: stage.weight,
    });
  }

  // 3. Calculate overall score with normalized weights
  let overallScore = 0;
  if (applicableWeightTotal > 0) {
    for (const stage of stages) {
      const stageReqs = updatedRequirements.filter(
        (r) => r.stage_id === stage.id
      );
      const applicableReqs = stageReqs.filter(
        (r) => r.status !== "NOT_APPLICABLE"
      );
      if (applicableReqs.length > 0) {
        const stageScoreObj = stageScores.find((s) => s.stage_id === stage.id);
        const stageScore = stageScoreObj ? stageScoreObj.score : 0;
        const normalizedWeight = stage.weight / applicableWeightTotal;
        overallScore += stageScore * normalizedWeight;
      }
    }
  }

  overallScore = Math.round(overallScore * 100) / 100;

  return {
    requirements: updatedRequirements,
    stageScores,
    overallScore,
  };
}
