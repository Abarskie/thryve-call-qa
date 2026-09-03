import test from "node:test";
import assert from "node:assert/strict";
import type { Stage } from "@/types/database";
import { validateEvaluationDraft } from "./evaluation";

const stages: Stage[] = [
  {
    id: "stage-1",
    name: "Opening",
    weight: 100,
    order: 1,
    requirements: [
      { id: "req-1", text: "Greet customer", order: 1 },
      { id: "req-2", text: "State purpose", order: 2 },
    ],
  },
];

const validDraft = {
  requirements_results: [
    {
      requirement_id: "req-1",
      stage_id: "stage-1",
      requirement_text: "Greet customer",
      status: "PASS",
      score: 999, // Should be recalculated
      evidence: "Hello, this is John",
      timestamp: "00:05",
      explanation: "Agent introduced self politely",
    },
    {
      requirement_id: "req-2",
      stage_id: "stage-1",
      requirement_text: "State purpose",
      status: "FAIL",
      score: 999, // Should be recalculated
      evidence: "",
      timestamp: "",
      explanation: "Did not explain why calling",
    },
  ],
  strengths: ["Polite greeting"],
  improvements: ["State call purpose immediately"],
  recommendations: ["Work on opening clarity"],
  summary: "The call started politely but lacked a clear purpose.",
};

const duplicateDraft = {
  ...validDraft,
  requirements_results: [
    validDraft.requirements_results[0],
    validDraft.requirements_results[0],
  ],
};

const malformedDraft = {
  ...validDraft,
  requirements_results: [
    {
      ...validDraft.requirements_results[0],
      status: "INVALID_STATUS",
    },
    validDraft.requirements_results[1],
  ],
};

test("validates all requirements and recalculates scores", () => {
  const result = validateEvaluationDraft(stages, validDraft);
  assert.equal(result.overall_score, 50);
  assert.deepEqual(result.stage_scores.map((stage) => stage.score), [50]);
  assert.deepEqual(result.requirements_results.map((item) => item.score), [100, 0]);
});

test("rejects missing, duplicate, and unknown requirement IDs", () => {
  assert.throws(
    () => validateEvaluationDraft(stages, duplicateDraft),
    /exactly one result for every framework requirement/i
  );
});

test("rejects malformed statuses, evidence, timestamps, and coaching arrays", () => {
  assert.throws(
    () => validateEvaluationDraft(stages, malformedDraft),
    /invalid evaluation response/i
  );
});
