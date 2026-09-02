"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Agent } from "@/types/database";

export interface AgentWithStats extends Agent {
  calls_count: number;
  average_score: number | null;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getAgentsAction(): Promise<ActionResult<AgentWithStats[]>> {
  try {
    const supabase = await createClient();

    // 1. Fetch agents
    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (agentsError) {
      return { success: false, error: agentsError.message };
    }

    if (!agents || agents.length === 0) {
      return { success: true, data: [] };
    }

    // 2. Fetch calls and analyses to compute real stats per agent
    const { data: calls } = await supabase
      .from("calls")
      .select("id, agent_id, call_analyses(overall_score)");

    const statsMap = new Map<string, { count: number; totalScore: number; scoredCount: number }>();

    for (const agent of agents) {
      statsMap.set(agent.id, { count: 0, totalScore: 0, scoredCount: 0 });
    }

    if (calls) {
      for (const call of calls) {
        const stats = statsMap.get(call.agent_id);
        if (stats) {
          stats.count += 1;
          const analysis = Array.isArray(call.call_analyses)
            ? call.call_analyses[0]
            : call.call_analyses;
          if (analysis?.overall_score != null) {
            stats.totalScore += Number(analysis.overall_score);
            stats.scoredCount += 1;
          }
        }
      }
    }

    const agentsWithStats: AgentWithStats[] = agents.map((agent) => {
      const stats = statsMap.get(agent.id);
      const avg = stats && stats.scoredCount > 0
        ? Math.round((stats.totalScore / stats.scoredCount) * 10) / 10
        : null;

      return {
        ...agent,
        calls_count: stats?.count ?? 0,
        average_score: avg,
      };
    });

    return { success: true, data: agentsWithStats };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load agents",
    };
  }
}

export async function createAgentAction(data: {
  name: string;
  email: string;
}): Promise<ActionResult<Agent>> {
  try {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();

    if (!name || name.length < 2) {
      return { success: false, error: "Agent name must be at least 2 characters." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const supabase = await createClient();

    const { data: created, error } = await supabase
      .from("agents")
      .insert({ name, email, active: true })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/agents");
    revalidatePath("/");
    return { success: true, data: created };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create agent",
    };
  }
}

export async function updateAgentAction(
  id: string,
  data: { name: string; email: string }
): Promise<ActionResult<Agent>> {
  try {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();

    if (!name || name.length < 2) {
      return { success: false, error: "Agent name must be at least 2 characters." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("agents")
      .update({ name, email })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/agents");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update agent",
    };
  }
}

export async function toggleAgentStatusAction(
  id: string,
  currentActive: boolean
): Promise<ActionResult<Agent>> {
  try {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("agents")
      .update({ active: !currentActive })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/agents");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle agent status",
    };
  }
}

