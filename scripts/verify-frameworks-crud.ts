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

async function testFrameworksCrud() {
  loadEnv();
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("1. Testing Create Framework with stages JSONB...");
  const testStages = [
    {
      id: "test-stage-1",
      name: "Greeting",
      order: 1,
      weight: 40,
      requirements: [
        { id: "r1", text: "Say hello", order: 1 },
        { id: "r2", text: "State company name", order: 2 },
      ],
    },
    {
      id: "test-stage-2",
      name: "Pitch",
      order: 2,
      weight: 60,
      requirements: [{ id: "r3", text: "Present solution", order: 1 }],
    },
  ];

  const { data: created, error: createErr } = await supabase
    .from("call_frameworks")
    .insert({
      name: `Test Framework ${Date.now()}`,
      description: "Automated test framework",
      stages: testStages as any,
      active: true,
    })
    .select()
    .single();

  if (createErr || !created) {
    console.error("Failed to create framework:", createErr);
    process.exit(1);
  }
  console.log("✅ Framework created:", created.name, created.id);

  console.log("2. Testing Update Framework...");
  const { data: updated, error: updateErr } = await supabase
    .from("call_frameworks")
    .update({ name: `${created.name} (Updated)` })
    .eq("id", created.id)
    .select()
    .single();

  if (updateErr || !updated.name.includes("(Updated)")) {
    console.error("Failed to update framework:", updateErr);
    process.exit(1);
  }
  console.log("✅ Framework updated:", updated.name);

  console.log("3. Testing Toggle Active Status...");
  const { data: toggled, error: toggleErr } = await supabase
    .from("call_frameworks")
    .update({ active: false })
    .eq("id", created.id)
    .select()
    .single();

  if (toggleErr || toggled.active !== false) {
    console.error("Failed to toggle status:", toggleErr);
    process.exit(1);
  }
  console.log("✅ Framework active toggled to:", toggled.active);

  console.log("4. Cleaning up test framework record...");
  await supabase.from("call_frameworks").delete().eq("id", created.id);
  console.log("✅ Cleaned up test record.");

  console.log("\n🎉 ALL FRAMEWORKS CRUD TESTS PASSED!");
}

testFrameworksCrud().catch((e) => {
  console.error(e);
  process.exit(1);
});

