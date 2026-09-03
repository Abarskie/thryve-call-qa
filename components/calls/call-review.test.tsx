import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CallReview, shouldPollCall } from "./call-review";
import { CallReport } from "./call-report";
import type { CallReviewData } from "@/lib/call-processing/query";

const NOW = "2026-09-04T01:00:00.000Z";

const baseCall: CallReviewData = {
  id: "call-1",
  status: "pending",
  errorMessage: null,
  createdAt: "2026-09-04T00:50:00.000Z",
  updatedAt: "2026-09-04T00:50:00.000Z",
  fileName: "recording.mp3",
  durationSeconds: 120,
  audioUrl: "/api/calls/call-1/audio",
  agent: { id: "agent-1", name: "Alex Miller" },
  framework: {
    id: "fw-1",
    name: "Outbound Sales",
    stages: [
      {
        id: "stage-1",
        name: "Discovery",
        weight: 100,
        order: 1,
        requirements: [
          { id: "req-1", text: "Ask about timeline", order: 1 },
        ],
      },
    ],
  },
  transcript: null,
  analysis: null,
};

const transcribingCall: CallReviewData = {
  ...baseCall,
  status: "transcribing",
  updatedAt: "2026-09-04T00:55:00.000Z",
};

const failedCall: CallReviewData = {
  ...baseCall,
  status: "failed",
  errorMessage: "Audio transcription failed. Please retry processing.",
};

const staleCall: CallReviewData = {
  ...baseCall,
  status: "transcribing",
  updatedAt: "2026-09-04T00:40:00.000Z", // 20 mins ago (> 15 mins)
};

const completedCall: CallReviewData = {
  ...baseCall,
  status: "completed",
  transcript: {
    rawText: "Speaker A: Hello. Speaker B: Hi there.",
    segments: [
      {
        speaker: "A",
        start_time: 0,
        end_time: 2.5,
        text: "When are you hoping to start?",
      },
    ],
  },
  analysis: {
    overallScore: 82,
    stageScores: [{ stage_id: "stage-1", stage_name: "Discovery", score: 82, weight: 100 }],
    requirementsResults: [
      {
        requirement_id: "req-1",
        stage_id: "stage-1",
        requirement_text: "Ask about timeline",
        status: "PASS",
        score: 100,
        evidence: "When are you hoping to start?",
        timestamp: "00:00",
        explanation: "Asked directly about timeline",
      },
    ],
    strengths: ["Clear tone"],
    improvements: ["Closing technique"],
    recommendations: ["Recommended actions: Follow up quickly"],
    summary: "Good discovery call with clear questions.",
  },
};

test("renders persisted active status", () => {
  assert.match(
    renderToStaticMarkup(<CallReview initialCall={transcribingCall} now={NOW} />),
    /Transcribing recording/i
  );
});

test("renders a failure and retry command", () => {
  const html = renderToStaticMarkup(<CallReview initialCall={failedCall} now={NOW} />);
  assert.match(html, /Audio transcription failed/i);
  assert.match(html, /Retry processing/i);
});

test("replaces a stale spinner with retry", () => {
  const html = renderToStaticMarkup(<CallReview initialCall={staleCall} now={NOW} />);
  assert.match(html, /Processing was interrupted/i);
  assert.match(html, /Retry processing/i);
});

test("renders results, evidence, coaching, and speakers", () => {
  const html = renderToStaticMarkup(<CallReport call={completedCall} />);
  assert.match(html, /82%/);
  assert.match(html, /Ask about timeline/);
  assert.match(html, /When are you hoping to start/);
  assert.match(html, /Recommended actions/i);
  assert.match(html, /Speaker A/i);
});

test("polls only healthy active calls", () => {
  assert.equal(shouldPollCall(transcribingCall, new Date(NOW)), true);
  assert.equal(shouldPollCall(failedCall, new Date(NOW)), false);
  assert.equal(shouldPollCall(staleCall, new Date(NOW)), false);
  assert.equal(shouldPollCall(completedCall, new Date(NOW)), false);
});

test("renders Stop Processing button for active calls", () => {
  const html = renderToStaticMarkup(<CallReview initialCall={transcribingCall} now={NOW} />);
  assert.match(html, /Stop Processing/i);
});

test("does not render Stop Processing button for failed calls", () => {
  const html = renderToStaticMarkup(<CallReview initialCall={failedCall} now={NOW} />);
  assert.doesNotMatch(html, /Stop Processing/i);
});
