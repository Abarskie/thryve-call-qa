"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface WorkspaceSettings {
  companyName: string;
  managerEmail: string;
  defaultModel: "gpt-4o-mini" | "gpt-4o" | "gemini-2.0-flash";
  passingThreshold: number;
  openaiApiKey: string;
  geminiApiKey: string;
}

export interface RawWorkspaceSettings extends WorkspaceSettings {
  rawOpenaiApiKey: string;
  rawGeminiApiKey: string;
}

const SETTINGS_ROW_ID = "00000000-0000-0000-0000-000000000001";

function maskKey(key: string | null | undefined): string {
  if (!key || key.trim().length === 0) return "";
  if (key.length <= 8) return `${key.substring(0, 3)}••••••••`;
  return `${key.substring(0, 7)}••••••••••••••••••••••••`;
}

/**
 * Server-only helper to fetch settings with unmasked API keys for background workers.
 */
export async function getRawWorkspaceSettings(): Promise<RawWorkspaceSettings> {
  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("workspace_settings")
    .select("*")
    .eq("id", SETTINGS_ROW_ID)
    .maybeSingle();

  const envOpenai = process.env.OPENAI_API_KEY || "";
  const envGemini = process.env.GEMINI_API_KEY || "";

  const rawOpenaiApiKey =
    row?.openai_api_key && row.openai_api_key.trim().length > 0
      ? row.openai_api_key.trim()
      : envOpenai;

  const rawGeminiApiKey =
    row?.gemini_api_key && row.gemini_api_key.trim().length > 0
      ? row.gemini_api_key.trim()
      : envGemini;

  return {
    companyName: row?.company_name || "Thryve Call QA",
    managerEmail: row?.manager_email || "manager@thryve.qa",
    defaultModel:
      (row?.default_model as "gpt-4o-mini" | "gpt-4o" | "gemini-2.0-flash") ||
      "gpt-4o-mini",
    passingThreshold: Number(row?.passing_threshold) || 75,
    openaiApiKey: maskKey(rawOpenaiApiKey),
    geminiApiKey: maskKey(rawGeminiApiKey),
    rawOpenaiApiKey,
    rawGeminiApiKey,
  };
}

/**
 * Retrieves the current workspace settings with masked API credentials for UI display.
 */
export async function getSettingsAction(): Promise<{
  success: boolean;
  data: WorkspaceSettings;
}> {
  try {
    const raw = await getRawWorkspaceSettings();
    return {
      success: true,
      data: {
        companyName: raw.companyName,
        managerEmail: raw.managerEmail,
        defaultModel: raw.defaultModel,
        passingThreshold: raw.passingThreshold,
        openaiApiKey: raw.openaiApiKey,
        geminiApiKey: raw.geminiApiKey,
      },
    };
  } catch {
    return {
      success: true,
      data: {
        companyName: "Thryve Call QA",
        managerEmail: "manager@thryve.qa",
        defaultModel: "gpt-4o-mini",
        passingThreshold: 75,
        openaiApiKey: maskKey(process.env.OPENAI_API_KEY),
        geminiApiKey: maskKey(process.env.GEMINI_API_KEY),
      },
    };
  }
}

/**
 * Updates workspace settings in the database.
 */
export async function updateSettingsAction(
  newSettings: Partial<WorkspaceSettings>
): Promise<{
  success: boolean;
  data?: WorkspaceSettings;
  error?: string;
}> {
  try {
    if (newSettings.passingThreshold !== undefined) {
      if (
        newSettings.passingThreshold < 1 ||
        newSettings.passingThreshold > 100
      ) {
        return {
          success: false,
          error: "Passing threshold must be between 1% and 100%.",
        };
      }
    }

    const supabase = createAdminClient();

    const updatePayload: {
      company_name?: string;
      manager_email?: string;
      default_model?: string;
      passing_threshold?: number;
      openai_api_key?: string | null;
      gemini_api_key?: string | null;
    } = {};

    if (newSettings.companyName !== undefined) {
      updatePayload.company_name = newSettings.companyName.trim();
    }
    if (newSettings.managerEmail !== undefined) {
      updatePayload.manager_email = newSettings.managerEmail.trim();
    }
    if (newSettings.defaultModel !== undefined) {
      updatePayload.default_model = newSettings.defaultModel;
    }
    if (newSettings.passingThreshold !== undefined) {
      updatePayload.passing_threshold = Number(newSettings.passingThreshold);
    }

    // Only update API keys if provided AND not the masked placeholder
    if (newSettings.openaiApiKey !== undefined) {
      const trimmed = newSettings.openaiApiKey.trim();
      if (!trimmed.includes("••••")) {
        updatePayload.openai_api_key = trimmed.length > 0 ? trimmed : null;
      }
    }

    if (newSettings.geminiApiKey !== undefined) {
      const trimmed = newSettings.geminiApiKey.trim();
      if (!trimmed.includes("••••")) {
        updatePayload.gemini_api_key = trimmed.length > 0 ? trimmed : null;
      }
    }

    const { error: upsertError } = await supabase
      .from("workspace_settings")
      .upsert({
        id: SETTINGS_ROW_ID,
        ...updatePayload,
      });

    if (upsertError) {
      throw upsertError;
    }

    revalidatePath("/settings");
    revalidatePath("/calls");
    revalidatePath("/");

    const updated = await getSettingsAction();
    return {
      success: true,
      data: updated.data,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to update settings.";
    return {
      success: false,
      error: errorMsg,
    };
  }
}
