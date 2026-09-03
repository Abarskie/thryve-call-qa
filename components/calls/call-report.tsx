"use client";

import React, { useRef, useState } from "react";
import type { CallReviewData } from "@/lib/call-processing/query";
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  User,
  GitFork,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  FileAudio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
} from "lucide-react";

interface CallReportProps {
  call: CallReviewData;
  passingThreshold?: number;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function parseTimestampToSeconds(timestamp: string): number | null {
  if (!timestamp || typeof timestamp !== "string") return null;
  const match = timestamp.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return minutes * 60 + seconds;
}

export function CallReport({ call, passingThreshold = 75 }: CallReportProps) {
  const analysis = call.analysis;
  const transcript = call.transcript;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(call.durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1);

  if (!analysis) {
    return null;
  }

  const overallScore = Math.round(analysis.overallScore);
  const isPassing = overallScore >= passingThreshold;
  const audioSrc = call.audioUrl || `/api/calls/${call.id}/audio`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const seekTo = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    if (!isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    seekTo(val);
  };

  const cyclePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Summary Card */}
      <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                  isPassing
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {isPassing ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {isPassing ? "COMPLIANT / PASS" : "NON-COMPLIANT / FAIL"}
              </span>

              <span className="text-xs text-slate-400 font-mono">
                {call.fileName}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold">{call.agent.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork className="h-3.5 w-3.5 text-slate-400" />
                <span>{call.framework.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{formatDuration(duration || call.durationSeconds)}</span>
              </div>
            </div>

            {analysis.summary && (
              <p className="text-xs text-slate-300 leading-relaxed bg-[#0e1726] p-3.5 rounded-xl border border-[#1e2e4a]">
                {analysis.summary}
              </p>
            )}
          </div>

          {/* Overall Score Circle/Badge */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0e1726] border border-[#1e2e4a] min-w-[140px] text-center shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              QA Score
            </span>
            <span
              className={`text-4xl font-extrabold tracking-tight ${
                isPassing ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {overallScore}%
            </span>
            <span className="text-[11px] text-slate-500 mt-1 font-medium">
              Target: {passingThreshold}%
            </span>
          </div>
        </div>

        {/* Audio Recording Player Bar */}
        <div className="mt-5 pt-4 border-t border-[#1e2e4a]">
          <audio
            ref={audioRef}
            src={audioSrc}
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current && audioRef.current.duration) {
                setDuration(audioRef.current.duration);
              }
            }}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#0e1726] border border-[#1e2e4a] p-3 rounded-xl">
            {/* Play/Pause & Reset buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow-sm"
                title={isPlaying ? "Pause" : "Play recording"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => seekTo(0)}
                className="h-8 w-8 rounded-lg bg-[#182338] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Restart from beginning"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Time Indicator */}
            <div className="text-[11px] font-mono text-slate-400 shrink-0 min-w-[85px]">
              <span className="text-white font-semibold">
                {formatDuration(currentTime)}
              </span>{" "}
              / {formatDuration(duration || call.durationSeconds)}
            </div>

            {/* Progress Bar Scrubber */}
            <div className="flex-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || call.durationSeconds || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1.5 bg-[#1e2e4a] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Playback Speed button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={cyclePlaybackRate}
                className="px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-300 bg-[#182338] hover:bg-[#202f4a] rounded-lg border border-[#1e2e4a] transition-colors"
                title="Adjust playback speed"
              >
                {playbackRate}x
              </button>

              <div className="text-slate-500 hidden sm:flex items-center">
                <Volume2 className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Breakdown & Requirements */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Award className="h-4 w-4 text-blue-400" />
          Framework Criteria Breakdown
        </h2>

        {call.framework.stages.map((stage) => {
          const stageScore = analysis.stageScores.find(
            (s) => s.stage_id === stage.id
          );
          const stageReqs = analysis.requirementsResults.filter(
            (r) => r.stage_id === stage.id
          );

          return (
            <div
              key={stage.id}
              className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#1e2e4a] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{stage.name}</h3>
                  <span className="text-[11px] text-slate-400">
                    Weight: {stage.weight}%
                  </span>
                </div>
                {stageScore && (
                  <span
                    className={`text-sm font-bold ${
                      stageScore.score >= passingThreshold
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {Math.round(stageScore.score)}%
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {stageReqs.map((req) => {
                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <XCircle className="h-3 w-3" /> FAIL
                    </span>
                  );
                  if (req.status === "PASS") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> PASS
                      </span>
                    );
                  } else if (req.status === "PARTIAL") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="h-3 w-3" /> PARTIAL
                      </span>
                    );
                  } else if (req.status === "NOT_APPLICABLE") {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        <MinusCircle className="h-3 w-3" /> N/A
                      </span>
                    );
                  }

                  const parsedTimestampSecs = req.timestamp
                    ? parseTimestampToSeconds(req.timestamp)
                    : null;

                  return (
                    <div
                      key={req.requirement_id}
                      className="p-3.5 rounded-xl bg-[#0e1726] border border-[#1e2e4a] space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {req.requirement_text}
                        </span>
                        <div>{statusBadge}</div>
                      </div>

                      {req.explanation && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {req.explanation}
                        </p>
                      )}

                      {req.evidence && (
                        <div className="text-xs bg-[#131e32] border border-[#1e2e4a] rounded-lg p-2.5 text-slate-300 flex items-start gap-2">
                          {req.timestamp && (
                            <button
                              type="button"
                              onClick={() => {
                                if (parsedTimestampSecs !== null) {
                                  seekTo(parsedTimestampSecs);
                                }
                              }}
                              className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0 inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Click to jump audio to this moment"
                            >
                              <Play className="h-2.5 w-2.5" />
                              {req.timestamp}
                            </button>
                          )}
                          <span className="italic break-words">
                            &ldquo;{req.evidence}&rdquo;
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Coaching & Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Strengths */}
        <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Strengths
            </h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((item, i) => (
              <li
                key={i}
                className="text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <TrendingUp className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Areas for Improvement
            </h3>
          </div>
          <ul className="space-y-2">
            {analysis.improvements.map((item, i) => (
              <li
                key={i}
                className="text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <AlertCircle className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Recommended actions
            </h3>
          </div>
          <ul className="space-y-2">
            {analysis.recommendations.map((item, i) => (
              <li
                key={i}
                className="text-xs text-slate-300 flex items-start gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transcript Viewer */}
      {transcript && transcript.segments.length > 0 && (
        <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2e4a] pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-blue-400" />
              Diarized Call Transcript
            </h2>
            <span className="text-xs text-slate-400">
              {transcript.segments.length} turns
            </span>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {transcript.segments.map((seg, i) => {
              const isTurnActive =
                currentTime >= seg.start_time && currentTime <= seg.end_time;

              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                    isTurnActive
                      ? "bg-blue-600/10 border-blue-500/40"
                      : "bg-[#0e1726] border-[#1e2e4a]"
                  }`}
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-bold text-slate-200">
                      Speaker {seg.speaker}
                    </span>
                    <button
                      type="button"
                      onClick={() => seekTo(seg.start_time)}
                      className="font-mono text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                      title="Jump audio to this turn"
                    >
                      <Play className="h-2.5 w-2.5" />
                      {formatDuration(seg.start_time)} - {formatDuration(seg.end_time)}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{seg.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
