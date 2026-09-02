"use client";

import { useState, useTransition } from "react";
import {
  type WorkspaceSettings,
  updateSettingsAction,
} from "@/app/actions/settings";
import {
  Sparkles,
  Building2,
  Key,
  Database,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Volume2,
  Sliders,
  ShieldCheck,
} from "lucide-react";

interface SettingsFormProps {
  initialSettings: WorkspaceSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "ai" | "integrations" | "audio"
  >("general");

  const [companyName, setCompanyName] = useState(initialSettings.companyName);
  const [managerEmail, setManagerEmail] = useState(initialSettings.managerEmail);
  const [defaultModel, setDefaultModel] = useState<"gpt-4o-mini" | "gpt-4o">(
    initialSettings.defaultModel
  );
  const [passingThreshold, setPassingThreshold] = useState(
    initialSettings.passingThreshold
  );
  const [strictness, setStrictness] = useState<"standard" | "strict">(
    initialSettings.strictness
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(
    initialSettings.openaiApiKey || ""
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState<"en" | "auto">(
    initialSettings.defaultLanguage
  );
  const [retentionDays, setRetentionDays] = useState(
    initialSettings.retentionDays
  );

  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("idle");
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateSettingsAction({
        companyName,
        managerEmail,
        defaultModel,
        passingThreshold: Number(passingThreshold),
        strictness,
        openaiApiKey,
        defaultLanguage,
        retentionDays: Number(retentionDays),
      });

      if (result.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 4000);
      } else {
        setSaveStatus("error");
        setErrorMessage(result.error || "Failed to save settings.");
      }
    });
  };

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "ai", label: "AI & QA Engine", icon: Sparkles },
    { id: "integrations", label: "Keys & Connected", icon: Key },
    { id: "audio", label: "Audio & Retention", icon: Volume2 },
  ] as const;

  return (
    <form onSubmit={handleSave} className="space-y-6 text-slate-200">
      {/* Toast Notification */}
      {saveStatus === "success" && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800/60 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-medium text-emerald-300">
            Workspace configuration updated and applied successfully.
          </p>
        </div>
      )}

      {saveStatus === "error" && errorMessage && (
        <div className="p-4 bg-rose-950/80 border border-rose-800/60 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <p className="text-xs font-medium text-rose-300">{errorMessage}</p>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isActive
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl shadow-sm overflow-hidden p-6 backdrop-blur-sm">
        {/* 1. General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white">
                Workspace Identity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set your company name and alerts recipient for low-scoring calls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  Company / Team Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g. Acme Sales Team"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="managerEmail"
                  className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  Manager Notification Email
                </label>
                <input
                  id="managerEmail"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="manager@company.com"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Receives automated alerts when a call fails the QA threshold.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. AI & QA Engine */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white">
                AI QA Engine & Scoring
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure which AI model grades your calls and define passing benchmarks.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Default AI Evaluation Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GPT-4o-mini Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o-mini")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o-mini"
                      ? "border-emerald-500/80 bg-slate-900/90 ring-1 ring-emerald-500/40"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">
                        GPT-4o-mini
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono font-medium">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Ultra-fast evaluation (~1-2s), extremely cost-effective.
                      Perfect for high-volume checklist QA.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Speed: ⚡⚡⚡ High</span>
                    <span>Cost: ~$0.001 / call</span>
                  </div>
                </div>

                {/* GPT-4o Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o"
                      ? "border-indigo-500/80 bg-slate-900/90 ring-1 ring-indigo-500/40"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">
                        GPT-4o
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono font-medium">
                        High Reasoning
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Deep context understanding and advanced nuanced objection
                      coaching for high-ticket closing calls.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Speed: ⚡ Normal</span>
                    <span>Cost: ~$0.015 / call</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passing Score Threshold */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="passingThreshold"
                  className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2"
                >
                  <Sliders className="h-4 w-4 text-slate-500" />
                  Call Passing Score Threshold
                </label>
                <span className="text-sm font-bold font-mono text-white bg-slate-950 px-3 py-1 rounded-md border border-slate-800 tabular-nums">
                  {passingThreshold}%
                </span>
              </div>
              <input
                id="passingThreshold"
                type="range"
                min="50"
                max="95"
                step="5"
                value={passingThreshold}
                onChange={(e) => setPassingThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>50% (Lenient)</span>
                <span>75% (Standard)</span>
                <span>95% (Strict)</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Calls with overall compliance score equal to or greater than{" "}
                <strong className="text-white font-mono">{passingThreshold}%</strong>{" "}
                will receive a <span className="text-emerald-400 font-semibold font-mono">PASS</span> badge.
              </p>
            </div>

            {/* QA Strictness */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Evaluation Strictness Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    strictness === "standard"
                      ? "border-emerald-500/80 bg-slate-900/90"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="strictness"
                    value="standard"
                    checked={strictness === "standard"}
                    onChange={() => setStrictness("standard")}
                    className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Standard (Semantic Understanding)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Allows agent rephrasing and natural conversational flow.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    strictness === "strict"
                      ? "border-emerald-500/80 bg-slate-900/90"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="strictness"
                    value="strict"
                    checked={strictness === "strict"}
                    onChange={() => setStrictness("strict")}
                    className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      Strict (Verbatim Adherence)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Requires exact framework keywords and mandatory stage orders.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 3. Keys & Integrations */}
        {activeTab === "integrations" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white">
                API Keys & Connected Services
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your AI credentials and inspect connected backend services.
              </p>
            </div>

            {/* OpenAI Key */}
            <div className="pt-2">
              <label
                htmlFor="openaiApiKey"
                className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
              >
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  id="openaiApiKey"
                  type={showApiKey ? "text" : "password"}
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-slate-300 rounded"
                  title={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Used server-side only for audio transcription (Whisper) and QA analysis.
                Never exposed to the client browser.
              </p>
            </div>

            {/* Connected Backend Health Card */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-500" />
                Local Backend Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Supabase PostgreSQL
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Docker (Port 54322)
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
                    CONNECTED
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Storage: call-recordings
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Local Bucket Ready
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Audio & Retention */}
        {activeTab === "audio" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white">
                Audio Processing & Retention
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage audio storage lifespan and speech recognition defaults.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label
                  htmlFor="defaultLanguage"
                  className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  Transcription Primary Language
                </label>
                <select
                  id="defaultLanguage"
                  value={defaultLanguage}
                  onChange={(e) =>
                    setDefaultLanguage(e.target.value as "en" | "auto")
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="en">English (Recommended)</option>
                  <option value="auto">Auto-detect Language</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Explicitly setting English increases transcription accuracy and speed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="retentionDays"
                  className="block text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                >
                  Audio Storage Retention Policy
                </label>
                <select
                  id="retentionDays"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value={0}>Keep Forever (Default)</option>
                  <option value={30}>Auto-delete after 30 days</option>
                  <option value={60}>Auto-delete after 60 days</option>
                  <option value={90}>Auto-delete after 90 days</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Transcripts and scorecard results are always permanently kept.
                </p>
              </div>
            </div>

            {/* Supported Formats Info */}
            <div className="pt-4 border-t border-slate-800">
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-white">
                    Supported Audio Formats
                  </p>
                  <p>
                    The platform natively processes <strong className="text-slate-200">.mp3</strong>,{" "}
                    <strong className="text-slate-200">.wav</strong>, and <strong className="text-slate-200">.m4a</strong> files up to{" "}
                    <strong className="text-slate-200">25 MB</strong> per call recording.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Changes take effect immediately across all new call uploads.
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
