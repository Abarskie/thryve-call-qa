import test from "node:test";
import assert from "node:assert/strict";
import type { Stage, RequirementResult } from "@/types/database";
import { scoreEvaluation, isStaleCall } from "./scoring";

const stages: Stage[] = [
  {
    id: "stage-1",
    name: "Opening",
    weight: 25,
    order: 1,
    requirements: [
      { id: "req-1", text: "Greet customer", order: 1 },
      { id: "req-2", text: "State purpose", order: 2 },
    ],
  },
  {
    id: "stage-2",
    name: "Discovery",
    weight: 75,
    order: 2,
    requirements: [
      { id: "req-3", text: "Ask open questions", order: 1 },
    ],
  },
];

const passResult: RequirementResult = {
  requirement_id: "req-1",
  stage_id: "stage-1",
  requirement_text: "Greet customer",
  status: "PASS",
  score: 100,
  evidence: "Good morning",
  timestamp: "00:05",
  explanation: "Clear greeting",
};

const partialResult: RequirementResult = {
  requirement_id: "req-2",
  stage_id: "stage-1",
  requirement_text: "State purpose",
  status: "PARTIAL",
  score: 50,
  evidence: "Calling about your account",
  timestamp: "00:15",
  explanation: "Stated purpose quickly",
};

const failResult: RequirementResult = {
  requirement_id: "req-3",
  stage_id: "stage-2",
  requirement_text: "Ask open questions",
  status: "FAIL",
  score: 0,
  evidence: "",
  timestamp: "",
  explanation: "No open questions asked",
};

const secondPassResult: RequirementResult = {
  requirement_id: "req-2",
  stage_id: "stage-1",
  requirement_text: "State purpose",
  status: "PASS",
  score: 100,
  evidence: "Calling specifically to help you save",
  timestamp: "00:12",
  explanation: "Clear value proposition stated",
};

const notApplicableResult: RequirementResult = {
  requirement_id: "req-3",
  stage_id: "stage-2",
  requirement_text: "Ask open questions",
  status: "NOT_APPLICABLE",
  score: 0,
  evidence: "",
  timestamp: "",
  explanation: "Caller hung up immediately",
};

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

