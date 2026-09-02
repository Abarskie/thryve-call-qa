"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
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
 * Uploads a call audio file to Supabase Storage and creates a record in the database.
 */
export async function uploadCallAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const agentId = formData.get("agentId") as string;
    const frameworkId = formData.get("frameworkId") as string;

    if (!file || !agentId || !frameworkId) {
      return { success: false, error: "Missing required fields." };
    }

    const supabase = createAdminClient();

    // 1. Generate a unique filename and upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("call-recordings")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return { success: false, error: "Failed to upload audio file." };
    }

    // 2. Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("call-recordings")
      .getPublicUrl(filePath);

    // 3. Create the call record in the database
    const { data: callRecord, error: dbError } = await supabase
      .from("calls")
      .insert({
        agent_id: agentId,
        framework_id: frameworkId,
        audio_url: publicUrlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
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
    console.error("Upload call exception:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
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

    const formattedCalls: DashboardCall[] = ((calls || []) as unknown as RawCall[]).map((c) => {
      const analysis = Array.isArray(c.call_analyses) ? c.call_analyses[0] : c.call_analyses;
      const score = analysis?.overall_score ?? null;
      let status = c.status?.toUpperCase() || "PENDING";
      if (score !== null) {
        status = score >= 75 ? "PASS" : score >= 60 ? "PARTIAL" : "FAIL";
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
    console.error("Error fetching dashboard data:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load dashboard data",
      data: {
        totalCalls: 0,
        activeAgents: 0,
        averageScore: null,
        recentCalls: [],
      },
    };
  }
}
