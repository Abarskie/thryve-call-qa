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

export interface GeneratedFramework {
  name: string;
  description: string;
  stages: Stage[];
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

    if (error) {
      return { success: false, error: error.message };
    }

    const stages = (Array.isArray(framework.stages)
      ? framework.stages
      : []) as unknown as Stage[];

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

export async function createFrameworkAction(
  payload: Pick<CallFramework, "name" | "description" | "stages">
): Promise<ActionResult<CallFramework>> {
  try {
    const supabase = await createClient();

    if (!payload.name?.trim()) {
      return { success: false, error: "Framework name is required." };
    }

    const stages = payload.stages || [];
    if (stages.length === 0) {
      return { success: false, error: "Framework must contain at least one stage." };
    }

    const totalWeight = stages.reduce(
      (acc, s) => acc + (Number(s.weight) || 0),
      0
    );

    if (totalWeight !== 100) {
      return {
        success: false,
        error: `Total stage weight must sum to 100%. Current sum: ${totalWeight}%`,
      };
    }

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      if (!stage.name?.trim()) {
        return { success: false, error: `Stage ${i + 1} requires a name.` };
      }
      if (!stage.requirements || stage.requirements.length === 0) {
        return {
          success: false,
          error: `Stage "${stage.name}" must contain at least one requirement.`,
        };
      }
      for (let j = 0; j < stage.requirements.length; j++) {
        if (!stage.requirements[j].text?.trim()) {
          return {
            success: false,
            error: `Requirement ${j + 1} in Stage "${stage.name}" cannot be empty.`,
          };
        }
      }
    }

    const { data: created, error } = await supabase
      .from("call_frameworks")
      .insert({
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
        stages: stages as unknown as import("@/types/database").Json,
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
  payload: Partial<Pick<CallFramework, "name" | "description" | "stages" | "active">>
): Promise<ActionResult<CallFramework>> {
  try {
    const supabase = await createClient();

    if (payload.name !== undefined && !payload.name.trim()) {
      return { success: false, error: "Framework name is required." };
    }

    if (payload.stages !== undefined) {
      const stages = payload.stages || [];
      if (stages.length === 0) {
        return { success: false, error: "Framework must contain at least one stage." };
      }

      const totalWeight = stages.reduce(
        (acc, s) => acc + (Number(s.weight) || 0),
        0
      );

      if (totalWeight !== 100) {
        return {
          success: false,
          error: `Total stage weight must sum to 100%. Current sum: ${totalWeight}%`,
        };
      }

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        if (!stage.name?.trim()) {
          return { success: false, error: `Stage ${i + 1} requires a name.` };
        }
        if (!stage.requirements || stage.requirements.length === 0) {
          return {
            success: false,
            error: `Stage "${stage.name}" must contain at least one requirement.`,
          };
        }
      }
    }

    const updateData: Partial<{
      name: string;
      description: string | null;
      stages: import("@/types/database").Json;
      active: boolean;
    }> = {};
    if (payload.name !== undefined) updateData.name = payload.name.trim();
    if (payload.description !== undefined) updateData.description = payload.description?.trim() || null;
    if (payload.stages !== undefined) updateData.stages = payload.stages as unknown as import("@/types/database").Json;
    if (payload.active !== undefined) updateData.active = payload.active;

    const { data: updated, error } = await supabase
      .from("call_frameworks")
      .update(updateData)
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

    const duplicateName = `${original.name} (Copy)`;

    const { data: created, error: insertErr } = await supabase
      .from("call_frameworks")
      .insert({
        name: duplicateName,
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

/**
 * Parses an uploaded .docx, .doc, or .txt sales script/playbook with AI to generate a Call Framework.
 */
export async function generateFrameworkFromDocAction(
  formData: FormData
): Promise<ActionResult<GeneratedFramework>> {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No document file provided." };
    }

    const fileName = file.name.toLowerCase();
    const isDocx = fileName.endsWith(".docx");
    const isDoc = fileName.endsWith(".doc");
    const isTxt = fileName.endsWith(".txt") || fileName.endsWith(".md");

    if (!isDocx && !isDoc && !isTxt) {
      return {
        success: false,
        error: "Supported formats are .docx, .doc, and .txt files.",
      };
    }

    // 1. Extract raw text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    if (isDocx) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      extractedText = buffer.toString("utf-8");
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return {
        success: false,
        error: "The uploaded document contains insufficient text to extract a call framework.",
      };
    }

    // 2. Check for OpenAI key
    let apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const { getSettingsAction } = await import("@/app/actions/settings");
      const settingsRes = await getSettingsAction();
      if (settingsRes.data.openaiApiKey && !settingsRes.data.openaiApiKey.startsWith("sk-••••")) {
        apiKey = settingsRes.data.openaiApiKey;
      }
    }

    // Fallback: If no active OpenAI API key is configured yet, use heuristic parser
    if (!apiKey) {
      const heuristicResult = parseDocumentHeuristically(extractedText, file.name);
      return { success: true, data: heuristicResult };
    }

    // 3. Call OpenAI GPT-4o-mini
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are an elite Sales Enablement & Call Quality Assurance Director.
Your task is to analyze sales scripts, cold calling playbooks, or SOP guidelines, and convert them into a structured Call QA Framework.

You must extract:
1. "name": A concise, professional title (e.g. "Outbound B2B Cold Calling Framework").
2. "description": A 1-2 sentence description explaining the call type and objective.
3. "stages": A sequential array of 3 to 6 logical stages (e.g. "Opening", "Discovery", "Pitch", "Objection Handling", "Closing").
   For EACH stage:
   - "name": The stage title
   - "weight": An integer percentage representing the importance of this stage. CRITICAL: The weights across all stages MUST sum to EXACTLY 100.
   - "requirements": An array of 2 to 5 specific, measurable behaviors or questions the agent must perform in this stage.

Return ONLY valid JSON matching this schema:
{
  "name": "string",
  "description": "string",
  "stages": [
    {
      "name": "string",
      "weight": number,
      "requirements": [
        { "text": "string" }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the sales call document/script:\n\n${extractedText.slice(0, 15000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response received from OpenAI.");
    }

    const parsed = JSON.parse(content);
    type RawReq = { text?: string } | string;
    type RawStage = { name?: string; weight?: number; requirements?: RawReq[] };
    const rawStages: RawStage[] = Array.isArray(parsed.stages) ? parsed.stages : [];

    // Normalize weights to sum to 100
    let totalWeight = rawStages.reduce((acc: number, s) => acc + (Number(s.weight) || 0), 0);
    if (totalWeight <= 0) totalWeight = 100;

    let accumulatedWeight = 0;
    const stages: Stage[] = rawStages.map((s, sIdx: number) => {
      let weight = Math.round(((Number(s.weight) || 1) / totalWeight) * 100);
      if (sIdx === rawStages.length - 1) {
        weight = Math.max(5, 100 - accumulatedWeight);
      } else {
        accumulatedWeight += weight;
      }

      const reqs = Array.isArray(s.requirements) ? s.requirements : [];
      return {
        id: `stage-${Date.now()}-${sIdx + 1}`,
        name: s.name || `Stage ${sIdx + 1}`,
        order: sIdx + 1,
        weight,
        requirements: reqs.map((r, rIdx: number) => ({
          id: `req-${Date.now()}-${sIdx + 1}-${rIdx + 1}`,
          text: typeof r === "string" ? r : r.text || "Follow required procedure",
          order: rIdx + 1,
        })),
      };
    });

    return {
      success: true,
      data: {
        name: parsed.name || "Cold Calling Framework",
        description: parsed.description || "Automated QA rubric extracted from playbook document.",
        stages,
      },
    };
  } catch (err: unknown) {
    console.error("AI Document Framework Extraction Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to extract framework from document.",
    };
  }
}

/**
 * Fallback parser when OpenAI API key is not yet configured.
 */
function parseDocumentHeuristically(text: string, filename: string): GeneratedFramework {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const cleanName = filename.replace(/\.(docx|doc|txt|md)$/i, "").replace(/[-_]/g, " ");
  const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1) + " Framework";

  const stageCandidates: { name: string; requirements: string[] }[] = [];
  let currentStage: { name: string; requirements: string[] } | null = null;

  for (const line of lines) {
    const isHeader = /^(stage|\d+[\.\)]|#+|\bopening\b|\bdiscovery\b|\bpitch\b|\bobjection\b|\bclosing\b|\bqualification\b)/i.test(line);

    if (isHeader && line.length < 60) {
      if (currentStage && currentStage.requirements.length > 0) {
        stageCandidates.push(currentStage);
      }
      currentStage = {
        name: line.replace(/^#+\s*|^\d+[\.\)]\s*|^stage\s*\d*:\s*/i, "").trim() || "Stage",
        requirements: [],
      };
    } else if (currentStage) {
      const reqText = line.replace(/^[-*•\d+\.]\s*/, "").trim();
      if (reqText.length > 5) {
        currentStage.requirements.push(reqText);
      }
    }
  }

  if (currentStage && currentStage.requirements.length > 0) {
    stageCandidates.push(currentStage);
  }

  const finalStagesList = stageCandidates.length >= 2 ? stageCandidates : [
    {
      name: "1. Opening & Permission Hook",
      requirements: [
        "State your full name and company clearly",
        "State the exact reason for the cold call",
        "Ask for permission or 30 seconds to explain value",
      ],
    },
    {
      name: "2. Problem Discovery & Qualification",
      requirements: [
        "Ask open-ended question about current vendor or workflow",
        "Identify core pain points or inefficiencies",
        "Confirm prospect has decision authority",
      ],
    },
    {
      name: "3. Solution Pitch & Value Alignment",
      requirements: [
        "Present value proposition tailored to identified pain point",
        "Cite relevant customer metric or outcome",
      ],
    },
    {
      name: "4. Objection Handling",
      requirements: [
        "Acknowledge objection without being defensive",
        "Reframe objection into exploration topic",
      ],
    },
    {
      name: "5. Call to Action & Scheduled Next Step",
      requirements: [
        "Propose concrete date and time for full 15-minute demo",
        "Verify prospect email address for calendar invitation",
      ],
    },
  ];

  const stageCount = finalStagesList.length;
  const baseWeight = Math.floor(100 / stageCount);
  const remainder = 100 - baseWeight * stageCount;

  const stages: Stage[] = finalStagesList.map((s, idx) => ({
    id: `stage-${Date.now()}-${idx + 1}`,
    name: s.name,
    order: idx + 1,
    weight: idx === 0 ? baseWeight + remainder : baseWeight,
    requirements: s.requirements.slice(0, 5).map((r, rIdx) => ({
      id: `req-${Date.now()}-${idx + 1}-${rIdx + 1}`,
      text: r,
      order: rIdx + 1,
    })),
  }));

  return {
    name: formattedName,
    description: "Extracted from sales document: " + filename,
    stages,
  };
}
