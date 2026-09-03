import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CallReport, parseTimestampToSeconds } from "./call-report";
import type { CallReviewData } from "@/lib/call-processing/query";

const mockCall: CallReviewData = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  status: "completed",
  errorMessage: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fileName: "test-call.mp3",
  durationSeconds: 120,
  audioUrl: "/api/calls/123e4567-e89b-12d3-a456-426614174000/audio",
  agent: { id: "agent-1", name: "Sarah Connor" },
  framework: {
    id: "fw-1",
    name: "Cold Calling",
    stages: [
      {
        id: "stage-1",
        name: "Opening",
        weight: 100,
        order: 1,
        requirements: [{ id: "req-1", text: "Introduce yourself", order: 1 }],
      },
    ],
  },
  transcript: {
    rawText: "Hi, this is Sarah.",
    segments: [
      {
        speaker: "Agent",
        start_time: 0,
        end_time: 2.5,
        text: "Hi, this is Sarah.",
      },
    ],
  },
  analysis: {
    overallScore: 85,
    stageScores: [{ stage_id: "stage-1", stage_name: "Opening", score: 85, weight: 100 }],
    requirementsResults: [
      {
        requirement_id: "req-1",
        stage_id: "stage-1",
        requirement_text: "Introduce yourself",
        status: "PASS",
        score: 100,
        evidence: "Hi, this is Sarah",
        timestamp: "00:01",
        explanation: "Stated name clearly",
      },
    ],
    strengths: ["Clear tone"],
    improvements: ["Pace"],
    recommendations: ["Keep it up"],
    summary: "Great call overall.",
  },
};

test("parseTimestampToSeconds converts MM:SS accurately", () => {
  assert.equal(parseTimestampToSeconds("00:00"), 0);
  assert.equal(parseTimestampToSeconds("01:30"), 90);
  assert.equal(parseTimestampToSeconds("10:15"), 615);
  assert.equal(parseTimestampToSeconds("invalid"), null);
});

test("CallReport renders audio player with streaming URL", () => {
  const html = renderToStaticMarkup(<CallReport call={mockCall} passingThreshold={80} />);
  assert.match(html, /<audio[^>]*src="\/api\/calls\/123e4567-e89b-12d3-a456-426614174000\/audio"/);
  assert.match(html, /Target:\s*80%/);
});

