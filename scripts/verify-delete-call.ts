import { createAdminClient } from "../lib/supabase/admin";
import { deleteCallAction } from "../app/actions/calls";
import assert from "node:assert/strict";

async function run() {
  console.log("Testing deleteCallAction...");
  const supabase = createAdminClient();

  // 1. Get an agent and framework
  const { data: agent } = await supabase.from("agents").select("id").limit(1).single();
  const { data: framework } = await supabase.from("call_frameworks").select("id").limit(1).single();

  if (!agent || !framework) {
    throw new Error("Missing agent or framework to test call deletion.");
  }

  // 2. Upload dummy audio to storage
  const testFileName = `test-del-${Date.now()}.mp3`;
  const storagePath = `uploads/${testFileName}`;
  const dummyBuffer = Buffer.from("dummy audio content for delete test");

  const { error: uploadError } = await supabase.storage
    .from("call-recordings")
    .upload(storagePath, dummyBuffer, { contentType: "audio/mpeg" });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("call-recordings")
    .getPublicUrl(storagePath);

  // 3. Insert call record
  const { data: callRecord, error: insertError } = await supabase
    .from("calls")
    .insert({
      agent_id: agent.id,
      framework_id: framework.id,
      audio_url: publicUrlData.publicUrl,
      file_name: testFileName,
      file_size: dummyBuffer.length,
      duration_seconds: 10,
      status: "pending",
    })
    .select()
    .single();

  if (insertError || !callRecord) throw insertError || new Error("Failed to insert call");

  console.log(`Created test call: ${callRecord.id}`);

  // 4. Call deleteCallAction
  const result = await deleteCallAction(callRecord.id);
  console.log("deleteCallAction result:", result);
  assert.equal(result.success, true, result.error);
  console.log("deleteCallAction returned success: true");

  // 5. Verify call no longer exists in DB
  const { data: checkCall } = await supabase
    .from("calls")
    .select("id")
    .eq("id", callRecord.id)
    .maybeSingle();

  assert.equal(checkCall, null, "Call record should be deleted from database");

  // 6. Verify audio file no longer exists in storage
  const { data: checkStorage } = await supabase.storage
    .from("call-recordings")
    .download(storagePath);

  assert.equal(checkStorage, null, "Audio file should be deleted from storage");

  console.log("🎉 deleteCallAction verification passed successfully!");
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
