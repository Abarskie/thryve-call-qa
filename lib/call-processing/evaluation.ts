import OpenAI from "openai";
import type { Stage, RequirementResult, RequirementStatus } from "@/types/database";
import type {
  EvaluationDraft,
  ValidatedEvaluation,
  TranscriptionResult,
} from "./types";
import { scoreEvaluation } from "./scoring";

export interface EvaluationInput {
  agentName: string;
  frameworkName: string;
  stages: Stage[];
  transcript: TranscriptionResult;
  model?: "gpt-4o-mini" | "gpt-4o";
}

export type Evaluator = (input: EvaluationInput) => Promise<ValidatedEvaluation>;

const ALLOWED_STATUSES: RequirementStatus[] = [
  "PASS",
  "PARTIAL",
  "FAIL",
  "NOT_APPLICABLE",
];

const TIMESTAMP_REGEX = /^$|^\d{2}:\d{2}$/;

interface RawRequirementResult {
  requirement_id?: unknown;
  stage_id?: unknown;
  requirement_text?: unknown;
  status?: unknown;
  score?: unknown;
  evidence?: unknown;
  timestamp?: unknown;
  explanation?: unknown;
}

interface RawDraft {
  requirements_results?: unknown;
  strengths?: unknown;
  improvements?: unknown;
  recommendations?: unknown;
  summary?: unknown;
}

export function validateEvaluationDraft(
  stages: Stage[],
  value: unknown
): ValidatedEvaluation {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid evaluation response: response must be an object.");
  }

  const raw = value as RawDraft;

  // Flatten expected requirements from framework
  const expectedReqs = new Map<string, { stage_id: string; text: string }>();
  for (const stage of stages) {
    for (const req of stage.requirements) {
      expectedReqs.set(req.id, { stage_id: stage.id, text: req.text });
    }
  }

  if (!Array.isArray(raw.requirements_results)) {
    throw new Error("Invalid evaluation response: requirements_results must be an array.");
  }

  if (raw.requirements_results.length !== expectedReqs.size) {
    throw new Error(
      "Invalid evaluation response: exactly one result for every framework requirement is required."
    );
  }

  const seenIds = new Set<string>();
  const validatedRequirements: RequirementResult[] = [];

  for (const item of raw.requirements_results) {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid evaluation response: requirement result is not an object.");
    }
    const r = item as RawRequirementResult;

    if (typeof r.requirement_id !== "string" || !expectedReqs.has(r.requirement_id)) {
      throw new Error(
        "Invalid evaluation response: exactly one result for every framework requirement is required."
      );
    }

    if (seenIds.has(r.requirement_id)) {
      throw new Error(
        "Invalid evaluation response: exactly one result for every framework requirement is required."
      );
    }
    seenIds.add(r.requirement_id);

    const expected = expectedReqs.get(r.requirement_id)!;

    if (r.stage_id !== expected.stage_id) {
      throw new Error("Invalid evaluation response: stage_id does not match framework requirement.");
    }

    if (typeof r.status !== "string" || !ALLOWED_STATUSES.includes(r.status as RequirementStatus)) {
      throw new Error(`Invalid evaluation response: invalid status "${r.status}".`);
    }
    const status = r.status as RequirementStatus;

    if (typeof r.evidence !== "string" || r.evidence.length > 500) {
      throw new Error("Invalid evaluation response: evidence exceeds character limit or is not a string.");
    }

    if (status !== "FAIL" && status !== "NOT_APPLICABLE" && r.evidence.trim().length === 0) {
      throw new Error(`Invalid evaluation response: evidence is required for status "${status}".`);
    }

    if (typeof r.timestamp !== "string" || !TIMESTAMP_REGEX.test(r.timestamp)) {
      throw new Error("Invalid evaluation response: timestamp must be empty or in MM:SS format.");
    }

    if (typeof r.explanation !== "string" || r.explanation.trim().length === 0 || r.explanation.length > 500) {
      throw new Error("Invalid evaluation response: explanation must be non-empty and under 500 characters.");
    }

    const reqText =
      typeof r.requirement_text === "string" && r.requirement_text.trim().length > 0
        ? r.requirement_text.trim()
        : expected.text;

    validatedRequirements.push({
      requirement_id: r.requirement_id,
      stage_id: r.stage_id,
      requirement_text: reqText,
      status,
      score: 0, // Recalculated by scoreEvaluation
      evidence: r.evidence.trim(),
      timestamp: r.timestamp.trim(),
      explanation: r.explanation.trim(),
    });
  }

  // Check strings / arrays
  function validateStringArray(arr: unknown, name: string): string[] {
    if (!Array.isArray(arr) || arr.length > 10) {
      throw new Error(`Invalid evaluation response: ${name} must be an array with at most 10 items.`);
    }
    return arr.map((item, idx) => {
      if (typeof item !== "string" || item.trim().length === 0 || item.length > 300) {
        throw new Error(`Invalid evaluation response: ${name}[${idx}] must be non-empty and under 300 characters.`);
      }
      return item.trim();
    });
  }

  const strengths = validateStringArray(raw.strengths, "strengths");
  const improvements = validateStringArray(raw.improvements, "improvements");
  const recommendations = validateStringArray(raw.recommendations, "recommendations");

  if (
    typeof raw.summary !== "string" ||
    raw.summary.trim().length === 0 ||
    raw.summary.length > 1000
  ) {
    throw new Error("Invalid evaluation response: summary must be non-empty and under 1000 characters.");
  }

  // Recalculate deterministic scores
  const scored = scoreEvaluation(stages, validatedRequirements);

  return {
    requirements_results: scored.requirements,
    stage_scores: scored.stageScores,
    overall_score: scored.overallScore,
    strengths,
    improvements,
    recommendations,
    summary: raw.summary.trim(),
  };
}

export function createOpenAIEvaluator(apiKey: string): Evaluator {
  const openai = new OpenAI({ apiKey });

  return async (input: EvaluationInput): Promise<ValidatedEvaluation> => {
    const prompt = `You are an expert sales call quality assurance auditor.
Evaluate the call transcript against the provided QA Framework.

Agent Name: ${input.agentName}
Framework: ${input.frameworkName}

Stages & Requirements:
${JSON.stringify(
  input.stages.map((s) => ({
    stage_id: s.id,
    stage_name: s.name,
    weight: s.weight,
    requirements: s.requirements.map((r) => ({
      requirement_id: r.id,
      requirement_text: r.text,
    })),
  })),
  null,
  2
)}

Transcript:
${input.transcript.segments
  .map(
    (s) =>
      `[${formatSeconds(s.start_time)}] Speaker ${s.speaker}: ${s.text}`
  )
  .join("\n")}

Strict instructions:
1. Provide exactly one result for every framework requirement. Keep requirement_id and stage_id identical.
2. Status must be PASS, PARTIAL, FAIL, or NOT_APPLICABLE.
3. For PASS or PARTIAL, provide direct quotation evidence from the transcript and the MM:SS timestamp.
4. If a requirement was not met, status must be FAIL. Evidence may be empty.
5. Provide clear, constructive explanations.
6. Provide concise strengths (max 10), improvements (max 10), recommendations (max 10), and an overall summary (max 1000 chars).
7. Do not infer roles without evidence.
`;

    const response = await openai.chat.completions.create({
      model: input.model ?? "gpt-4o-mini",
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "call_evaluation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              requirements_results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    requirement_id: { type: "string" },
                    stage_id: { type: "string" },
                    requirement_text: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["PASS", "PARTIAL", "FAIL", "NOT_APPLICABLE"],
                    },
                    evidence: { type: "string" },
                    timestamp: { type: "string" },
                    explanation: { type: "string" },
                  },
                  required: [
                    "requirement_id",
                    "stage_id",
                    "requirement_text",
                    "status",
                    "evidence",
                    "timestamp",
                    "explanation",
                  ],
                  additionalProperties: false,
                },
              },
              strengths: {
                type: "array",
                items: { type: "string" },
              },
              improvements: {
                type: "array",
                items: { type: "string" },
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
              },
              summary: { type: "string" },
            },
            required: [
              "requirements_results",
              "strengths",
              "improvements",
              "recommendations",
              "summary",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty evaluation response from OpenAI.");
    }

    const draft = JSON.parse(content);
    return validateEvaluationDraft(input.stages, draft);
  };
}

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
