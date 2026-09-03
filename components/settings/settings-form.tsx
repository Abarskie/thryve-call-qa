"use client";

import React, { useState, useTransition } from "react";
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
  const [defaultModel, setDefaultModel] = useState<
    "gpt-4o-mini" | "gpt-4o" | "gemini-2.0-flash"
  >(initialSettings.defaultModel);
  const [passingThreshold, setPassingThreshold] = useState(
    initialSettings.passingThreshold
  );
  const [openaiApiKey, setOpenaiApiKey] = useState(
    initialSettings.openaiApiKey || ""
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(
    initialSettings.geminiApiKey || ""
  );
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);

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
        geminiApiKey,
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
    <form onSubmit={handleSave} className="space-y-6 text-slate-100">
      {/* Toast Notification */}
      {saveStatus === "success" && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold text-emerald-400">
            Workspace configuration updated and applied successfully.
          </p>
        </div>
      )}

      {saveStatus === "error" && errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <p className="text-xs font-semibold text-rose-400">{errorMessage}</p>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex bg-[#131e32] border border-[#1e2e4a] p-1.5 rounded-2xl gap-1 overflow-x-auto shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-[#182338]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[#131e32] border border-[#1e2e4a] rounded-2xl shadow-sm overflow-hidden p-6">
        {/* 1. General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">
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
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  Company / Team Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="e.g. Acme Sales Team"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="managerEmail"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  Manager Notification Email
                </label>
                <input
                  id="managerEmail"
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  placeholder="manager@company.com"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
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
              <h3 className="text-base font-bold text-white">
                AI Evaluation Model & Passing Score
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure which OpenAI model grades your calls and define the passing benchmark.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Default Evaluation Model
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GPT-4o-mini Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o-mini")}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o-mini"
                      ? "border-blue-500 bg-blue-600/10 ring-1 ring-blue-500"
                      : "border-[#1e2e4a] hover:border-slate-600 bg-[#0e1726]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        GPT-4o-mini
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Fast & Cheap
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Fast evaluation (~1-2s), cost-effective OpenAI model. Perfect for standard sales QA checklists.
                    </p>
                  </div>
                </div>

                {/* Gemini 2.0 Flash Card */}
                <div
                  onClick={() => setDefaultModel("gemini-2.0-flash")}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    defaultModel === "gemini-2.0-flash"
                      ? "border-blue-500 bg-blue-600/10 ring-1 ring-blue-500"
                      : "border-[#1e2e4a] hover:border-slate-600 bg-[#0e1726]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        Gemini 2.0 Flash
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                        Free Tier
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Google&apos;s fastest multimodal model. Free tier available via Google AI Studio with native speed and accuracy.
                    </p>
                  </div>
                </div>

                {/* GPT-4o Card */}
                <div
                  onClick={() => setDefaultModel("gpt-4o")}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    defaultModel === "gpt-4o"
                      ? "border-blue-500 bg-blue-600/10 ring-1 ring-blue-500"
                      : "border-[#1e2e4a] hover:border-slate-600 bg-[#0e1726]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">
                        GPT-4o
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        High Reasoning
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Deep context understanding and nuanced feedback for complex high-ticket objection handling.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passing Score Threshold */}
            <div className="pt-4 border-t border-[#1e2e4a]">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="passingThreshold"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2"
                >
                  <Sliders className="h-4 w-4 text-slate-500" />
                  Call Passing Score Threshold
                </label>
                <span className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20 tabular-nums">
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
                className="w-full h-2 bg-[#0e1726] rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-1">
                <span>50% (Lenient)</span>
                <span>75% (Standard)</span>
                <span>95% (Strict)</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Calls scoring equal to or higher than{" "}
                <strong className="text-white">{passingThreshold}%</strong>{" "}
                will be marked with a <span className="text-emerald-400 font-semibold">PASS</span> badge.
              </p>
            </div>
          </div>
        )}

        {/* 3. API Credentials */}
        {activeTab === "keys" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">
                OpenAI API Credentials
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Used server-side for audio transcription (Whisper) and framework evaluation.
              </p>
            </div>

            <div className="pt-2">
              <label
                htmlFor="openaiApiKey"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
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
                  required={defaultModel !== "gemini-2.0-flash"}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white font-mono placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white rounded"
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
                Stored safely on the server. Never exposed to the browser.
              </p>
            </div>

            {/* Google Gemini API Key */}
            <div className="pt-4 border-t border-[#1e2e4a]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Google Gemini API Credentials
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Free tier API key from Google AI Studio. Used for Gemini 2.0 Flash evaluations.
                </p>
              </div>

              <div className="pt-3">
                <label
                  htmlFor="geminiApiKey"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  Google Gemini API Key
                </label>
                <div className="relative">
                  <input
                    id="geminiApiKey"
                    type={showGeminiApiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    required={defaultModel === "gemini-2.0-flash"}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-xs text-white font-mono placeholder:font-sans placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiApiKey(!showGeminiApiKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white rounded"
                    title={showGeminiApiKey ? "Hide API key" : "Show API key"}
                  >
                    {showGeminiApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Obtain your free key at{" "}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    aistudio.google.com
                  </a>
                  . Stored server-side only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Save Button */}
        <div className="mt-8 pt-5 border-t border-[#1e2e4a] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Changes take effect immediately across all new call audits.
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
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
