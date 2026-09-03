"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadCallAction } from "@/app/actions/calls";
import { Loader2, UploadCloud, FileAudio, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Agent, CallFramework } from "@/types/database";

interface CallUploadFormProps {
  agents: Agent[];
  frameworks: CallFramework[];
}

export function CallUploadForm({ agents, frameworks }: CallUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [agentId, setAgentId] = useState("");
  const [frameworkId, setFrameworkId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validTypes = ["audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp4", "audio/mp3"];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|m4a)$/i)) {
        setError("Please select a valid audio file (.mp3, .wav, .m4a)");
        setFile(null);
        return;
      }
      
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !agentId || !frameworkId) {
      setError("Please select an agent, a framework, and an audio file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("agentId", agentId);
    formData.append("frameworkId", frameworkId);

    try {
      const result = await uploadCallAction(formData);
      if (result.success && result.data) {
        router.push(`/calls/${result.data.id}`);
      } else {
        setError(result.error || "Failed to upload.");
        setIsUploading(false);
      }
    } catch {
      setError("An unexpected error occurred during upload.");
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-slate-200">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-rose-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="agentId" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Sales Agent *
          </label>
          <select
            id="agentId"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            required
            disabled={isUploading}
          >
            <option value="">Choose an agent...</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="frameworkId" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Evaluation Framework *
          </label>
          <select
            id="frameworkId"
            value={frameworkId}
            onChange={(e) => setFrameworkId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#0e1726] border border-[#1e2e4a] rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            required
            disabled={isUploading}
          >
            <option value="">Choose a QA playbook...</option>
            {frameworks.map((fw) => (
              <option key={fw.id} value={fw.id}>
                {fw.name} ({fw.stages?.length || 0} stages)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Audio Recording File *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-[#1e2e4a] border-dashed rounded-2xl hover:border-slate-600 transition-colors bg-[#0e1726]/50">
            <div className="space-y-2 text-center w-full">
              {file ? (
                <div className="flex flex-col items-center gap-2 p-4 bg-[#182338] rounded-xl border border-[#1e2e4a] shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-1">
                    <FileAudio className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {file.name}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                    className="mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Remove selected file
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-10 w-10 text-slate-500" />
                  <div className="flex text-xs text-slate-300 justify-center items-center gap-1">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-lg font-semibold text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:underline"
                    >
                      <span>Choose recording</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".mp3,.wav,.m4a,audio/*"
                        className="sr-only"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </label>
                    <span>or drag and drop here</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    MP3, WAV, or M4A up to 25 MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={!file || !agentId || !frameworkId || isUploading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading & Starting QA...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Upload Recording
            </>
          )}
        </button>
      </div>
    </form>
  );
}
