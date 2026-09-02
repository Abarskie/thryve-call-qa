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
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Sliders,
} from "lucide-react";

interface SettingsFormProps {
  initialSettings: WorkspaceSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<"general" | "ai" | "keys">("general");

  const [companyName, setCompanyName] = useState(initialSettings.companyName);
  const [managerEmail, setManagerEmail] = useState(initialSettings.managerEmail);
  const [defaultModel, setDefaultModel] = useState<"gpt-4o-mini" | "gpt-4o">(
    initialSettings.defaultModel
  );
  const [passingThreshold, setPassingThreshold] = useState(
    initialSettings.passingThreshold
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(
    initialSettings.openaiApiKey || ""
  );
  const [showApiKey, setShowApiKey] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
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
        openaiApiKey,
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
    { id: "ai", label: "AI Model & Scoring", icon: Sparkles },
    { id: "keys", label: "API Credentials", icon: Key },
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
                  Receives notifications regarding call QA scoring and compliance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. AI Model & Scoring */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                AI Evaluation Model & Passing Score
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Configure which OpenAI model grades your calls and define the passing benchmark.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Default Evaluation Model
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
                      Fast evaluation (~1-2s), cost-effective. Perfect for high-volume sales QA checklists.
                    </p>
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
                      Deep context understanding and nuanced feedback for complex high-ticket objection handling.
                    </p>
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
                Calls scoring equal to or higher than{" "}
                <strong className="text-neutral-800">{passingThreshold}%</strong>{" "}
                will be marked with a <span className="text-emerald-700 font-semibold">PASS</span> badge.
              </p>
            </div>
          </div>
        )}

        {/* 3. API Credentials */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                OpenAI API Credentials
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Used server-side for audio transcription (Whisper) and framework evaluation.
              </p>
            </div>

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
                Stored safely on the server. Never exposed to the browser.
              </p>
            </div>
          </div>
        )}

        {/* Footer Save Button */}
        <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Changes take effect immediately across all new call audits.
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
