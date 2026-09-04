"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateStoredAudioUpload } from "@/lib/audio-upload";
import { formatUnknownError } from "@/lib/errors";
import { getStorageObjectPath } from "@/lib/call-processing/repository";
import { getSettingsAction } from "@/app/actions/settings";
import type { CallStatus } from "@/types/database";

export interface DashboardCall {
  id: string;
  agentName: string;
  frameworkName: string;
  createdAt: string;
  status: string;
  score: number | null;
}

export interface DashboardData {
  totalCalls: number;
  activeAgents: number;
  averageScore: number | null;
  recentCalls: DashboardCall[];
}

/**
 * Creates a call record for an audio file already uploaded to Supabase Storage.
 */
export async function uploadCallAction(formData: FormData) {
  try {
    const storagePath = formData.get("storagePath");
    const fileName = formData.get("fileName");
    const fileSizeValue = formData.get("fileSize");
    const fileType = formData.get("fileType");
    const agentId = formData.get("agentId");
    const frameworkId = formData.get("frameworkId");

    if (
      typeof storagePath !== "string" ||
      typeof fileName !== "string" ||
      typeof fileSizeValue !== "string" ||
      typeof fileType !== "string" ||
      typeof agentId !== "string" ||
      typeof frameworkId !== "string" ||
      !storagePath ||
      !fileName ||
      !agentId ||
      !frameworkId
    ) {
      return { success: false, error: "Missing required fields." };
    }

    const fileSize = Number(fileSizeValue);
    if (!Number.isSafeInteger(fileSize)) {
      return { success: false, error: "Invalid audio file size." };
    }

    const validationError = validateStoredAudioUpload({
      storagePath,
      fileName,
      fileSize,
      fileType,
    });
    if (validationError) {
      return { success: false, error: validationError };
    }

    const supabase = createAdminClient();

    const { data: publicUrlData } = supabase.storage
      .from("call-recordings")
      .getPublicUrl(storagePath);

    const { data: callRecord, error: dbError } = await supabase
      .from("calls")
      .insert({
        agent_id: agentId,
        framework_id: frameworkId,
        audio_url: publicUrlData.publicUrl,
        file_name: fileName,
        file_size: fileSize,
        duration_seconds: 0,
        status: "pending" as CallStatus
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      return { success: false, error: "Failed to create call record." };
    }

    revalidatePath("/calls");
    revalidatePath("/");

    return { success: true, data: callRecord };
  } catch (err: unknown) {
    const message = formatUnknownError(err, "An unexpected error occurred during upload.");
    console.error(`Upload call exception: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Retrieves live dashboard statistics and recent evaluated calls from the database.
 */
export async function getDashboardDataAction(): Promise<{
  success: boolean;
  data: DashboardData;
  error?: string;
}> {
  try {
    const supabase = createAdminClient();

    // 1. Fetch recent calls with joined agent & framework
    const { data: calls, error: callsError } = await supabase
      .from("calls")
      .select(`
        id,
        status,
        created_at,
        agents ( name ),
        call_frameworks ( name ),
        call_analyses ( overall_score )
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    if (callsError) throw callsError;

    // 2. Fetch active agents count
    const { count: activeAgentsCount, error: agentsError } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    if (agentsError) throw agentsError;

    // 3. Fetch total calls count
    const { count: totalCallsCount, error: totalCallsError } = await supabase
      .from("calls")
      .select("*", { count: "exact", head: true });

    if (totalCallsError) throw totalCallsError;

    type RawCall = {
      id: string;
      status: string;
      created_at: string;
      agents: { name: string } | null;
      call_frameworks: { name: string } | null;
      call_analyses: { overall_score: number }[] | { overall_score: number } | null;
    };

    const settingsRes = await getSettingsAction().catch(() => null);
    const threshold = settingsRes?.data?.passingThreshold ?? 75;
    const partialThreshold = Math.round(threshold * 0.8);

    const formattedCalls: DashboardCall[] = ((calls || []) as unknown as RawCall[]).map((c) => {
      const analysis = Array.isArray(c.call_analyses) ? c.call_analyses[0] : c.call_analyses;
      const score = analysis?.overall_score ?? null;
      let status = c.status?.toUpperCase() || "PENDING";
      if (score !== null) {
        status = score >= threshold ? "PASS" : score >= partialThreshold ? "PARTIAL" : "FAIL";
      }

      return {
        id: c.id,
        agentName: c.agents?.name || "Unknown Agent",
        frameworkName: c.call_frameworks?.name || "Standard Framework",
        createdAt: new Date(c.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status,
        score,
      };
    });

    const evaluatedCalls = formattedCalls.filter((c) => c.score !== null);
    const avgScore =
      evaluatedCalls.length > 0
        ? Math.round(
            evaluatedCalls.reduce((acc, c) => acc + (c.score ?? 0), 0) /
              evaluatedCalls.length
          )
        : null;

    return {
      success: true,
      data: {
        totalCalls: totalCallsCount || 0,
        activeAgents: activeAgentsCount || 0,
        averageScore: avgScore,
        recentCalls: formattedCalls,
      },
    };
  } catch (err: unknown) {
    const message = formatUnknownError(err, "Failed to load dashboard data");
    console.error(`Error fetching dashboard data: ${message}`);
    return {
      success: false,
      error: message,
      data: {
        totalCalls: 0,
        activeAgents: 0,
        averageScore: null,
        recentCalls: [],
      },
    };
  }
}

/**
 * Deletes a call, its associated audio from Supabase Storage, and cascades to transcripts and analyses.
 */
export async function deleteCallAction(callId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!callId) {
      return { success: false, error: "Call ID is required." };
    }

    const supabase = createAdminClient();

    // 1. Fetch audio_url to remove file from storage
    const { data: call, error: fetchError } = await supabase
      .from("calls")
      .select("audio_url")
      .eq("id", callId)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // 2. Clean up audio file from Storage bucket if exists
    if (call?.audio_url) {
      try {
        const path = getStorageObjectPath(call.audio_url);
        await supabase.storage.from("call-recordings").remove([path]);
      } catch (storageErr) {
        console.warn(`Failed to delete audio file from storage: ${storageErr}`);
      }
    }

    // 3. Delete call row from database (cascades to transcripts & call_analyses)
    const { error: deleteError } = await supabase
      .from("calls")
      .delete()
      .eq("id", callId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    try {
      revalidatePath("/calls");
      revalidatePath("/");
    } catch {
      // Ignored outside Next.js request context (e.g. tests)
    }

    return { success: true };
  } catch (err: unknown) {
    const message = formatUnknownError(err, "Failed to delete call.");
    return { success: false, error: message };
  }
}
