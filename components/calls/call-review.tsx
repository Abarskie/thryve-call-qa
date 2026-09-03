"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { CallReviewData } from "@/lib/call-processing/query";
import { isStaleCall } from "@/lib/call-processing/scoring";
import { CallReport } from "./call-report";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";

interface CallReviewProps {
  initialCall: CallReviewData;
  now?: string;
}

export function shouldPollCall(call: CallReviewData, now: Date): boolean {
  if (call.status !== "transcribing" && call.status !== "analyzing") {
    return false;
  }
  if (isStaleCall(call.status, call.updatedAt, now)) {
    return false;
  }
  return true;
}

export function CallReview({ initialCall, now: initialNow }: CallReviewProps) {
  const [call, setCall] = useState<CallReviewData>(initialCall);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const isPollingRef = useRef(false);
  const triggeredInitialProcess = useRef(false);

  const currentDate = initialNow ? new Date(initialNow) : new Date();
  const isStale = isStaleCall(call.status, call.updatedAt, currentDate);

  // Poll status endpoint
  const pollStatus = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const res = await fetch(`/api/calls/${call.id}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.call) {
          setCall(json.call);
        }
      } else if (res.status === 404) {
        setRequestError("Call record not found.");
      }
    } catch {
      // Non-fatal network glitch during polling
    } finally {
      isPollingRef.current = false;
    }
  }, [call.id]);

  // Handle stop click
  const handleStop = async () => {
    setIsStopping(true);
    setRequestError(null);

    const prevCall = call;
    setCall((prev) => ({
      ...prev,
      status: "failed",
      errorMessage: "Processing cancelled by user.",
    }));

    try {
      const res = await fetch(`/api/calls/${call.id}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();

      if (!res.ok) {
        setCall(prevCall);
        setRequestError(json.message || json.error || "Failed to stop processing.");
      } else {
        await pollStatus();
      }
    } catch {
      setCall(prevCall);
      setRequestError("Network error while stopping processing.");
    } finally {
      setIsStopping(false);
    }
  };

  // Handle retry click
  const handleRetry = async () => {
    setIsRetrying(true);
    setRequestError(null);

    try {
      const res = await fetch(`/api/calls/${call.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retry: true }),
      });

      const json = await res.json();

      if (!res.ok) {
        setRequestError(json.message || json.error || "Retry failed to start.");
      } else {
        // Poll immediately to update local state
        await pollStatus();
      }
    } catch {
      setRequestError("Network error while triggering retry.");
    } finally {
      setIsRetrying(false);
    }
  };

  // Initial trigger for pending calls
  useEffect(() => {
    if (call.status === "pending" && !triggeredInitialProcess.current) {
      triggeredInitialProcess.current = true;
      fetch(`/api/calls/${call.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retry: false }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const json = await res.json().catch(() => null);
            setRequestError(
              json?.message || json?.error || "Processing could not be started."
            );
          }
        })
        .catch(() => {
          setRequestError("Network connection error when starting processing.");
        });
    }
  }, [call.id, call.status]);

  // Polling timer
  useEffect(() => {
    const nowCheck = new Date();
    if (!shouldPollCall(call, nowCheck)) {
      return;
    }

    const interval = setInterval(() => {
      pollStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [call, pollStatus]);

  // If completed and has analysis, render full report
  if (call.status === "completed" && call.analysis) {
    return <CallReport call={call} />;
  }

  // Active / Processing / Failed / Stale State Card
  let statusTitle = "Processing Audio Recording...";
  let statusDescription = "Analyzing recording with AI QA framework...";
  let statusBadge = "Evaluating";

  if (call.status === "pending") {
    statusTitle = "Queued for processing";
    statusDescription = "Recording has been uploaded and is queued for transcription.";
    statusBadge = "Queued";
  } else if (call.status === "transcribing") {
    statusTitle = "Transcribing recording";
    statusDescription = "OpenAI Whisper is transcribing speech and identifying speakers.";
    statusBadge = "Transcribing";
  } else if (call.status === "analyzing") {
    statusTitle = "Evaluating framework";
    statusDescription = "Comparing call transcript against QA rubric criteria.";
    statusBadge = "Analyzing";
  }

  const showStaleRecovery = isStale && (call.status === "transcribing" || call.status === "analyzing");
  const showFailure = call.status === "failed";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-8 sm:p-10 text-center shadow-sm">
        {showStaleRecovery || showFailure ? (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="h-8 w-8" />
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">
              {showStaleRecovery
                ? "Processing was interrupted"
                : "Call Evaluation Failed"}
            </h2>

            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              {showStaleRecovery
                ? "Processing has been inactive for more than 15 minutes and appears to have stalled."
                : call.errorMessage || "Audio transcription failed. Please retry processing."}
            </p>

            {requestError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl max-w-md mx-auto">
                {requestError}
              </p>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {isRetrying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Retry processing
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-16 w-16 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">
              {statusTitle}
            </h2>

            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {statusDescription}
            </p>

            {requestError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl max-w-md mx-auto">
                {requestError}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-[11px] font-mono text-blue-400 bg-[#0e1726] px-3 py-1.5 rounded-xl border border-[#1e2e4a]">
                Status: {statusBadge}
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-[#0e1726] px-3 py-1.5 rounded-xl border border-[#1e2e4a]">
                File: {call.fileName}
              </span>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleStop}
                disabled={isStopping}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50"
              >
                {isStopping ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                Stop Processing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
