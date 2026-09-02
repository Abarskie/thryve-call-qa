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
    { id: "integrations", label: "Keys & Integrations", icon: Key },
    { id: "audio", label: "Audio & Retention", icon: Volume2 },
  ] as const;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Toast Notification */}
      {saveStatus === "success" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
          <p className="text-sm font-medium text-emerald-800">
            Settings have been saved and applied successfully.
          </p>
        </div>
      )}

      {saveStatus === "error" && errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-rose-700 shrink-0" />
          <p className="text-sm font-medium text-rose-800">{errorMessage}</p>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        {/* 1. General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Workspace Identity
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Set your company information displayed on QA scorecards and reports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Company / Organization Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="managerEmail"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Manager Notification Email
                </label>
                <input
                  id="managerEmail"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                  placeholder="manager@company.com"
                  required
                />
                <p className="text-xs text-slate-500 mt-1.5">
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
              <h3 className="text-base font-semibold text-slate-900">
                AI QA Engine & Scoring
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure which AI model grades your calls and define passing benchmarks.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-medium text-slate-700">
                Default AI Evaluation Model
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GPT-4o-mini Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o-mini")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o-mini"
                      ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        GPT-4o-mini
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Ultra-fast evaluation (~1-2s), extremely cost-effective.
                      Perfect for standard checklist QA.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span>Speed: ⚡⚡⚡ High</span>
                    <span>Cost: ~$0.001 / call</span>
                  </div>
                </div>

                {/* GPT-4o Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o"
                      ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        GPT-4o
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                        High Reasoning
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Deep context understanding and advanced nuanced objection
                      coaching for high-ticket closing calls.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span>Speed: ⚡ Normal</span>
                    <span>Cost: ~$0.015 / call</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passing Score Threshold */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="passingThreshold"
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <Sliders className="h-4 w-4 text-slate-500" />
                  Call Passing Score Threshold
                </label>
                <span className="text-base font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
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
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>50% (Lenient)</span>
                <span>75% (Standard)</span>
                <span>95% (Strict)</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Calls with overall compliance score equal to or greater than{" "}
                <strong className="text-slate-700">{passingThreshold}%</strong>{" "}
                will receive a <span className="text-emerald-700 font-semibold">PASS</span> badge.
              </p>
            </div>

            {/* QA Strictness */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Evaluation Strictness Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    strictness === "standard"
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="strictness"
                    value="standard"
                    checked={strictness === "standard"}
                    onChange={() => setStrictness("standard")}
                    className="mt-0.5 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">
                      Standard (Semantic Understanding)
                    </span>
                    <span className="text-xs text-slate-500">
                      Allows agent rephrasing and natural conversational flow.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    strictness === "strict"
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="strictness"
                    value="strict"
                    checked={strictness === "strict"}
                    onChange={() => setStrictness("strict")}
                    className="mt-0.5 text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-900 block">
                      Strict (Verbatim Adherence)
                    </span>
                    <span className="text-xs text-slate-500">
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
              <h3 className="text-base font-semibold text-slate-900">
                API Keys & Connected Services
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage your AI credentials and inspect connected backend services.
              </p>
            </div>

            {/* OpenAI Key */}
            <div className="pt-2">
              <label
                htmlFor="openaiApiKey"
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded"
                  title={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Used server-side only for audio transcription (Whisper) and QA analysis.
                Never exposed to the client browser.
              </p>
            </div>

            {/* Connected Backend Health Card */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-600" />
                Local Backend Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Supabase PostgreSQL
                      </div>
                      <div className="text-xs text-slate-500">
                        Docker (Port 54322)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                    Connected
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Storage: call-recordings
                      </div>
                      <div className="text-xs text-slate-500">
                        Local Bucket Ready
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                    Active
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
              <h3 className="text-base font-semibold text-slate-900">
                Audio Processing & Retention
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage audio storage lifespan and speech recognition defaults.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label
                  htmlFor="defaultLanguage"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Transcription Primary Language
                </label>
                <select
                  id="defaultLanguage"
                  value={defaultLanguage}
                  onChange={(e) =>
                    setDefaultLanguage(e.target.value as "en" | "auto")
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                >
                  <option value="en">English (Recommended)</option>
                  <option value="auto">Auto-detect Language</option>
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  Explicitly setting English increases transcription accuracy and speed.
                </p>
              </div>

              <div>
                <label
                  htmlFor="retentionDays"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Audio Storage Retention Policy
                </label>
                <select
                  id="retentionDays"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                >
                  <option value={0}>Keep Forever (Default)</option>
                  <option value={30}>Auto-delete after 30 days</option>
                  <option value={60}>Auto-delete after 60 days</option>
                  <option value={90}>Auto-delete after 90 days</option>
                </select>
                <p className="text-xs text-slate-500 mt-1.5">
                  Transcripts and scorecard results are always permanently kept.
                </p>
              </div>
            </div>

            {/* Supported Formats Info */}
            <div className="pt-4 border-t border-slate-200">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-slate-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-900">
                    Supported Audio Formats
                  </p>
                  <p>
                    The platform natively processes <strong>.mp3</strong>,{" "}
                    <strong>.wav</strong>, and <strong>.m4a</strong> files up to{" "}
                    <strong>25 MB</strong> per call recording.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Changes will take effect across all new call uploads and evaluations.
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-50"
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
