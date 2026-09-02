"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadCallAction } from "@/app/actions/calls";
import { Loader2, UploadCloud, FileAudio, AlertCircle } from "lucide-react";
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
      setError("Please fill out all fields and select a file.");
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
        // Redirect to the newly created call's page (the viewer)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="agentId" className="block text-sm font-medium text-slate-700 mb-1">
            Agent
          </label>
          <select
            id="agentId"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            required
            disabled={isUploading}
          >
            <option value="">Select an agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="frameworkId" className="block text-sm font-medium text-slate-700 mb-1">
            Call Framework
          </label>
          <select
            id="frameworkId"
            value={frameworkId}
            onChange={(e) => setFrameworkId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
            required
            disabled={isUploading}
          >
            <option value="">Select a framework</option>
            {frameworks.map((fw) => (
              <option key={fw.id} value={fw.id}>
                {fw.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Audio Recording
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-slate-400 transition-colors bg-slate-50">
            <div className="space-y-1 text-center">
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                    <FileAudio className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-900">{file.name}</div>
                  <div className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={isUploading}
                    className="mt-2 text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-transparent font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
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
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    MP3, WAV, or M4A up to 25MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={!file || !agentId || !frameworkId || isUploading}
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading & Starting QA...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4" />
              Upload Audio
            </>
          )}
        </button>
      </div>
    </form>
  );
}
