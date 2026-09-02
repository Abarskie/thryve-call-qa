"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CallStatus } from "@/types/database";

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
        duration_seconds: 0, // Placeholder until transcribed/analyzed
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
