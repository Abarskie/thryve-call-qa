import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

async function testCrud() {
  loadEnv();
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("1. Testing Create Agent...");
  const testEmail = `test_bot_${Date.now()}@example.com`;
  const { data: created, error: createErr } = await supabase
    .from("agents")
    .insert({ name: "Autopilot Test Bot", email: testEmail, active: true })
    .select()
    .single();

  if (createErr || !created) {
    console.error("Failed to create agent:", createErr);
    process.exit(1);
  }
  console.log("✅ Agent created:", created.name, created.id);

  console.log("2. Testing Update Agent...");
  const { data: updated, error: updateErr } = await supabase
    .from("agents")
    .update({ name: "Autopilot Verified Bot" })
    .eq("id", created.id)
    .select()
    .single();

  if (updateErr || updated.name !== "Autopilot Verified Bot") {
    console.error("Failed to update agent:", updateErr);
    process.exit(1);
  }
  console.log("✅ Agent updated:", updated.name);

  console.log("3. Testing Toggle Active Status...");
  const { data: toggled, error: toggleErr } = await supabase
    .from("agents")
    .update({ active: false })
    .eq("id", created.id)
    .select()
    .single();

  if (toggleErr || toggled.active !== false) {
    console.error("Failed to toggle status:", toggleErr);
    process.exit(1);
  }
  console.log("✅ Agent status toggled to inactive:", toggled.active);

  console.log("4. Cleaning up test record...");
  await supabase.from("agents").delete().eq("id", created.id);
  console.log("✅ Test record cleaned up.");

  console.log("\n🎉 ALL AGENT CRUD TESTS PASSED!");
}

testCrud().catch((e) => {
  console.error(e);
  process.exit(1);
});

