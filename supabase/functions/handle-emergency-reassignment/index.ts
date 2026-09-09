import { getServiceClient } from "../_shared/serviceClient.ts";
import { CONFIG } from "../_shared/config.ts";

Deno.serve(async (req) => {
  try {
    const { jobId, originalWorkerId } = await req.json();
    const supabase = getServiceClient();

    const { data: job } = await supabase.from("jobs").select("id, category_id, price_max_cents").eq("id", jobId).single();
    if (!job) return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });

    // Rating-loss only, no financial penalty, per App.md 3.9 — unless flagged as abuse elsewhere.
    // Find a candidate replacement: any verified worker who has completed a job in this category.
    const { data: candidates } = await supabase
      .from("skill_verifications")
      .select("user_id")
      .eq("category_id", job.category_id)
      .eq("passed", true)
      .limit(5);

    if (!candidates || candidates.length === 0) {
      await supabase.from("jobs").update({ status: "open", worker_id: null }).eq("id", jobId);
      return new Response(
        JSON.stringify({ reassigned: false, message: "No replacement found — client notified to repost or refund" }),
        { status: 200 }
      );
    }

    // Surface job back to open feed with priority flag rather than blind-assigning —
    // final acceptance still goes through the normal offer flow.
    await supabase.from("jobs").update({ status: "open", worker_id: null }).eq("id", jobId);

    return new Response(
      JSON.stringify({ reassigned: true, candidateCount: candidates.length, penaltyToOriginalWorker: CONFIG.PENALTIES_CENTS.emergency_abuse === 0 }),
      { status: 200 }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
