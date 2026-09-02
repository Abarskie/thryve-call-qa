"use server";

import { revalidatePath } from "next/cache";

export interface WorkspaceSettings {
  companyName: string;
  managerEmail: string;
  defaultModel: "gpt-4o-mini" | "gpt-4o";
  passingThreshold: number;
  openaiApiKey: string;
}

// In-memory / server-cached default state for settings
let cachedSettings: WorkspaceSettings = {
  companyName: "Thryve Call QA",
  managerEmail: "manager@thryve.qa",
  defaultModel: "gpt-4o-mini",
  passingThreshold: 75,
  openaiApiKey: process.env.OPENAI_API_KEY ? "sk-••••••••••••••••••••••••" : "",
};

/**
 * Retrieves the current workspace settings.
 */
export async function getSettingsAction(): Promise<{
  success: boolean;
  data: WorkspaceSettings;
}> {
  return {
    success: true,
    data: { ...cachedSettings },
  };
}

/**
 * Updates workspace settings.
 */
export async function updateSettingsAction(
  newSettings: Partial<WorkspaceSettings>
): Promise<{
  success: boolean;
  data?: WorkspaceSettings;
  error?: string;
}> {
  try {
    // Validate threshold
    if (newSettings.passingThreshold !== undefined) {
      if (newSettings.passingThreshold < 1 || newSettings.passingThreshold > 100) {
        return {
          success: false,
          error: "Passing threshold must be between 1% and 100%.",
        };
      }
    }

    // Merge updates
    cachedSettings = {
      ...cachedSettings,
      ...newSettings,
    };

    revalidatePath("/settings");
    revalidatePath("/");

    return {
      success: true,
      data: { ...cachedSettings },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to update settings.";
    return {
      success: false,
      error: errorMsg,
    };
  }
}
