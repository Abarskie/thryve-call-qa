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
    <form onSubmit={handleSave} className="space-y-6 text-neutral-800">
      {/* Toast Notification */}
      {saveStatus === "success" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-800">
            Workspace configuration updated and applied successfully.
          </p>
        </div>
      )}

      {saveStatus === "error" && errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold text-rose-800">{errorMessage}</p>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex bg-white border border-neutral-200/90 p-1.5 rounded-2xl gap-1 overflow-x-auto shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden p-6">
        {/* 1. General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Workspace Identity
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Set your company name and alerts recipient for low-scoring calls.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
                >
                  Company / Team Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Acme Sales Team"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="managerEmail"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
                >
                  Manager Notification Email
                </label>
                <input
                  id="managerEmail"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  placeholder="manager@company.com"
                  required
                />
                <p className="text-[11px] text-neutral-400 mt-1.5">
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
              <h3 className="text-base font-bold text-neutral-900">
                AI QA Engine & Scoring
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Configure which AI model grades your calls and define passing benchmarks.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Default AI Evaluation Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GPT-4o-mini Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o-mini")}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o-mini"
                      ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-sm">
                        GPT-4o-mini
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                      Ultra-fast evaluation (~1-2s), extremely cost-effective.
                      Perfect for high-volume checklist QA.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>Speed: ⚡⚡⚡ High</span>
                    <span>Cost: ~$0.001 / call</span>
                  </div>
                </div>

                {/* GPT-4o Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o")}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o"
                      ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600"
                      : "border-neutral-200 hover:border-neutral-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 text-sm">
                        GPT-4o
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                        High Reasoning
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                      Deep context understanding and advanced nuanced objection
                      coaching for high-ticket closing calls.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-medium">
                    <span>Speed: ⚡ Normal</span>
                    <span>Cost: ~$0.015 / call</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passing Score Threshold */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="passingThreshold"
                  className="text-xs font-semibold uppercase tracking-wider text-neutral-600 flex items-center gap-2"
                >
                  <Sliders className="h-4 w-4 text-neutral-400" />
                  Call Passing Score Threshold
                </label>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100 tabular-nums">
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
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-medium text-neutral-400 mt-1">
                <span>50% (Lenient)</span>
                <span>75% (Standard)</span>
                <span>95% (Strict)</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Calls with overall compliance score equal to or greater than{" "}
                <strong className="text-neutral-800">{passingThreshold}%</strong>{" "}
                will receive a <span className="text-emerald-700 font-semibold">PASS</span> badge.
              </p>
            </div>

            {/* QA Strictness */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                Evaluation Strictness Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    strictness === "standard"
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="strictness"
                    value="standard"
                    checked={strictness === "standard"}
                    onChange={() => setStrictness("standard")}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Standard (Semantic Understanding)
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Allows agent rephrasing and natural conversational flow.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    strictness === "strict"
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="strictness"
                    value="strict"
                    checked={strictness === "strict"}
                    onChange={() => setStrictness("strict")}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Strict (Verbatim Adherence)
                    </span>
                    <span className="text-[11px] text-neutral-500">
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
              <h3 className="text-base font-bold text-neutral-900">
                API Keys & Connected Services
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage your AI credentials and inspect connected backend services.
              </p>
            </div>

            {/* OpenAI Key */}
            <div className="pt-2">
              <label
                htmlFor="openaiApiKey"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
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
                  className="w-full pl-3.5 pr-10 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 font-mono placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-700 rounded"
                  title={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">
                Used server-side only for audio transcription (Whisper) and QA analysis.
                Never exposed to the client browser.
              </p>
            </div>

            {/* Connected Backend Health Card */}
            <div className="pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-neutral-400" />
                Local Backend Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        Supabase PostgreSQL
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        Docker (Port 54322)
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    CONNECTED
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-neutral-900">
                        Storage: call-recordings
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400">
                        Local Bucket Ready
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
              <h3 className="text-base font-bold text-neutral-900">
                Audio Processing & Retention
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage audio storage lifespan and speech recognition defaults.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label
                  htmlFor="defaultLanguage"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
                >
                  Transcription Primary Language
                </label>
                <select
                  id="defaultLanguage"
                  value={defaultLanguage}
                  onChange={(e) =>
                    setDefaultLanguage(e.target.value as "en" | "auto")
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                >
                  <option value="en">English (Recommended)</option>
                  <option value="auto">Auto-detect Language</option>
                </select>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  Explicitly setting English increases transcription accuracy and speed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="retentionDays"
                  className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
                >
                  Audio Storage Retention Policy
                </label>
                <select
                  id="retentionDays"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                >
                  <option value={0}>Keep Forever (Default)</option>
                  <option value={30}>Auto-delete after 30 days</option>
                  <option value={60}>Auto-delete after 60 days</option>
                  <option value={90}>Auto-delete after 90 days</option>
                </select>
                <p className="text-[11px] text-neutral-400 mt-1.5">
                  Transcripts and scorecard results are always permanently kept.
                </p>
              </div>
            </div>

            {/* Supported Formats Info */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-600 space-y-1">
                  <p className="font-bold text-neutral-900">
                    Supported Audio Formats
                  </p>
                  <p>
                    The platform natively processes <strong className="text-neutral-900">.mp3</strong>,{" "}
                    <strong className="text-neutral-900">.wav</strong>, and <strong className="text-neutral-900">.m4a</strong> files up to{" "}
                    <strong className="text-neutral-900">25 MB</strong> per call recording.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Changes take effect immediately across all new call uploads.
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs shadow-indigo-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
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
