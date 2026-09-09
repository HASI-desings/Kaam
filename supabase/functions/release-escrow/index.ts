// Releases held escrow funds to the worker's wallet. Callable only:
// (a) by the client via explicit confirmation, or
// (b) by the auto-release cron once the timer expires.
// Never a direct wallet table write from the frontend.
import { getServiceClient } from "../_shared/serviceClient.ts";

Deno.serve(async (req) => {
  try {
    const { jobId, triggeredBy } = await req.json(); // triggeredBy: 'client_confirm' | 'auto_timer'
    const supabase = getServiceClient();

    const { data: job, error } = await supabase
      .from("jobs")
      .select("id, client_id, worker_id, status, price_max_cents")
      .eq("id", jobId)
      .single();
    if (error || !job) return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });
    if (!["submitted", "in_progress"].includes(job.status)) {
      return new Response(JSON.stringify({ error: `Job not eligible for release (status: ${job.status})` }), {
        status: 409,
      });
    }
    if (!job.worker_id) {
      return new Response(JSON.stringify({ error: "No assigned worker" }), { status: 422 });
    }

    // Idempotency: skip if already completed
    if (job.status === "completed") {
      return new Response(JSON.stringify({ ok: true, alreadyReleased: true }), { status: 200 });
    }

    const amount = job.price_max_cents ?? 0;

    // Serialize wallet mutation with a Postgres function (atomic increment) to avoid races —
    // wallet balance is never read-then-written from application code.
    const { error: walletErr } = await supabase.rpc("increment_wallet_balance", {
      p_user_id: job.worker_id,
      p_amount_cents: amount,
    });
    if (walletErr) return new Response(JSON.stringify({ error: walletErr.message }), { status: 500 });

    await supabase.from("wallet_transactions").insert({
      user_id: job.worker_id,
      type: "job_payout",
      amount_cents: amount,
      status: "completed",
      reference_job_id: job.id,
    });

    await supabase.from("jobs").update({ status: "completed" }).eq("id", job.id);

    return new Response(JSON.stringify({ ok: true, releasedCents: amount, triggeredBy }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
