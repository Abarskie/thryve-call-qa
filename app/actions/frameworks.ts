"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CallFramework, Stage } from "@/types/database";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FrameworkWithStats extends CallFramework {
  stages_count: number;
  requirements_count: number;
  total_weight: number;
}

export async function getFrameworksAction(): Promise<ActionResult<FrameworkWithStats[]>> {
  try {
    const supabase = await createClient();

    const { data: frameworks, error } = await supabase
      .from("call_frameworks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!frameworks) {
      return { success: true, data: [] };
    }

    const frameworksWithStats: FrameworkWithStats[] = frameworks.map((fw) => {
      const stages = (Array.isArray(fw.stages) ? fw.stages : []) as unknown as Stage[];
      let reqCount = 0;
      let totalWeight = 0;

      for (const st of stages) {
        reqCount += st.requirements?.length ?? 0;
        totalWeight += Number(st.weight ?? 0);
      }

      return {
        ...fw,
        stages,
        stages_count: stages.length,
        requirements_count: reqCount,
        total_weight: totalWeight,
      };
    });

    return { success: true, data: frameworksWithStats };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load frameworks",
    };
  }
}

export async function getFrameworkByIdAction(
  id: string
): Promise<ActionResult<CallFramework>> {
  try {
    const supabase = await createClient();

    const { data: framework, error } = await supabase
      .from("call_frameworks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !framework) {
      return { success: false, error: error?.message ?? "Framework not found" };
    }

    const stages = (Array.isArray(framework.stages) ? framework.stages : []) as unknown as Stage[];

    return {
      success: true,
      data: {
        ...framework,
        stages,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load framework",
    };
  }
}

export async function createFrameworkAction(data: {
  name: string;
  description?: string;
  stages: Stage[];
}): Promise<ActionResult<CallFramework>> {
  try {
    const name = data.name?.trim();
    if (!name || name.length < 2) {
      return { success: false, error: "Framework name must be at least 2 characters." };
    }

    if (!data.stages || data.stages.length === 0) {
      return { success: false, error: "A framework must contain at least one stage." };
    }

    for (let i = 0; i < data.stages.length; i++) {
      const stage = data.stages[i];
      if (!stage.name?.trim()) {
        return { success: false, error: `Stage ${i + 1} must have a name.` };
      }
      if (!stage.requirements || stage.requirements.length === 0) {
        return { success: false, error: `Stage "${stage.name}" must have at least one requirement.` };
      }
    }

    const supabase = await createClient();

    // Map stages JSONB safely
    const stagesJson = JSON.parse(JSON.stringify(data.stages));

    const { data: created, error } = await supabase
      .from("call_frameworks")
      .insert({
        name,
        description: data.description?.trim() || null,
        stages: stagesJson,
        active: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/frameworks");
    revalidatePath("/");
    return { success: true, data: created as unknown as CallFramework };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create framework",
    };
  }
}

export async function updateFrameworkAction(
  id: string,
  data: {
    name: string;
    description?: string;
    stages: Stage[];
  }
): Promise<ActionResult<CallFramework>> {
  try {
    const name = data.name?.trim();
    if (!name || name.length < 2) {
      return { success: false, error: "Framework name must be at least 2 characters." };
    }

    if (!data.stages || data.stages.length === 0) {
      return { success: false, error: "A framework must contain at least one stage." };
    }

    for (let i = 0; i < data.stages.length; i++) {
      const stage = data.stages[i];
      if (!stage.name?.trim()) {
        return { success: false, error: `Stage ${i + 1} must have a name.` };
      }
      if (!stage.requirements || stage.requirements.length === 0) {
        return { success: false, error: `Stage "${stage.name}" must have at least one requirement.` };
      }
    }

    const supabase = await createClient();
    const stagesJson = JSON.parse(JSON.stringify(data.stages));

    const { data: updated, error } = await supabase
      .from("call_frameworks")
      .update({
        name,
        description: data.description?.trim() || null,
        stages: stagesJson,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/frameworks");
    revalidatePath(`/frameworks/${id}`);
    revalidatePath("/");
    return { success: true, data: updated as unknown as CallFramework };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update framework",
    };
  }
}

export async function duplicateFrameworkAction(
  id: string
): Promise<ActionResult<CallFramework>> {
  try {
    const supabase = await createClient();

    const { data: original, error: fetchErr } = await supabase
      .from("call_frameworks")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) {
      return { success: false, error: "Original framework not found" };
    }

    const newName = `${original.name} (Copy)`;

    const { data: created, error: insertErr } = await supabase
      .from("call_frameworks")
      .insert({
        name: newName,
        description: original.description,
        stages: original.stages,
        active: true,
      })
      .select()
      .single();

    if (insertErr) {
      return { success: false, error: insertErr.message };
    }

    revalidatePath("/frameworks");
    revalidatePath("/");
    return { success: true, data: created as unknown as CallFramework };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to duplicate framework",
    };
  }
}

export async function toggleFrameworkStatusAction(
  id: string,
  currentActive: boolean
): Promise<ActionResult<CallFramework>> {
  try {
    const supabase = await createClient();

    const { data: updated, error } = await supabase
      .from("call_frameworks")
      .update({ active: !currentActive })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/frameworks");
    revalidatePath("/");
    return { success: true, data: updated as unknown as CallFramework };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle framework status",
    };
  }
}
