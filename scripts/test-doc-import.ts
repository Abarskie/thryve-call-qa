import { generateFrameworkFromDocAction } from "../app/actions/frameworks";

async function main() {
  console.log("=== Testing generateFrameworkFromDocAction ===");

  // Create a sample text file simulating an outbound sales script
  const sampleScript = `
# Outbound SaaS Cold Calling Playbook

Stage 1: Opening & Pattern Interrupt
- State your name and company clearly
- State the exact reason for the call
- Ask for 30 seconds to explain why we reached out

Stage 2: Discovery & Pain Identification
- Ask what tool they currently use for outbound sales
- Identify their biggest bottleneck with their current process
- Confirm if they are responsible for evaluating new software

Stage 3: Value Proposition & Proof
- Share relevant metric (e.g. how similar clients doubled response rates)
- Explain our 1-click integration workflow

Stage 4: Objection Handling
- Acknowledge their timing or budget objection politely
- Offer to share our benchmark report as zero-pressure value

Stage 5: Call To Action & Scheduling
- Propose Tuesday or Thursday 15-minute walkthrough
- Verify their email address for the calendar link
  `.trim();

  const file = new File([sampleScript], "Cold_Calling_SOP.txt", { type: "text/plain" });
  const formData = new FormData();
  formData.append("file", file);

  const result = await generateFrameworkFromDocAction(formData);

  console.log("Result success:", result.success);
  if (result.success && result.data) {
    console.log("Framework Name:", result.data.name);
    console.log("Description:", result.data.description);
    console.log("Stages Count:", result.data.stages.length);
    const totalWeight = result.data.stages.reduce((sum, s) => sum + s.weight, 0);
    console.log("Total Weight:", totalWeight);
    for (const st of result.data.stages) {
      console.log(` - ${st.name} (Weight: ${st.weight}%, Reqs: ${st.requirements.length})`);
      for (const r of st.requirements) {
        console.log(`    * ${r.text}`);
      }
    }
  } else {
    console.error("Result error:", result.error);
  }
}

main().catch(console.error);

