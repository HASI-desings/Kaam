// Authoritative price calculation. Frontend may show an estimate but must
// call this before any confirmation/charge — never trust a client-supplied total.
import { getServiceClient } from "../_shared/serviceClient.ts";
import { CONFIG } from "../_shared/config.ts";

Deno.serve(async (req) => {
  try {
    const { jobId, offerAmountCents } = await req.json();
    if (!jobId || typeof offerAmountCents !== "number") {
      return new Response(JSON.stringify({ error: "jobId and offerAmountCents required" }), { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("id, category_id")
      .eq("id", jobId)
      .single();
    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });
    }

    const { data: avg } = await supabase
      .from("category_average_rates")
      .select("average_price_cents, completed_job_count")
      .eq("category_id", job.category_id)
      .maybeSingle();

    const { data: category } = await supabase
      .from("categories")
      .select("min_completed_jobs_for_average")
      .eq("id", job.category_id)
      .single();

    const floorEnforced =
      avg && category && avg.completed_job_count >= category.min_completed_jobs_for_average;

    if (floorEnforced && offerAmountCents < avg!.average_price_cents!) {
      return new Response(
        JSON.stringify({
          error: "Price below category floor",
          floorCents: avg!.average_price_cents,
        }),
        { status: 422 }
      );
    }

    const commissionCents = Math.round(offerAmountCents * CONFIG.COMMISSION_RATE);
    const finalTotalCents = offerAmountCents + commissionCents;

    return new Response(
      JSON.stringify({
        baseCents: offerAmountCents,
        commissionCents,
        finalTotalCents,
        currency: CONFIG.CURRENCY,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
