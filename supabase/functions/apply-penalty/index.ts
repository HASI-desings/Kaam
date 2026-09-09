import { getServiceClient } from "../_shared/serviceClient.ts";
import { CONFIG } from "../_shared/config.ts";

type PenaltyReason = keyof typeof CONFIG.PENALTIES_CENTS;

Deno.serve(async (req) => {
  try {
    const { userId, jobId, reason } = (await req.json()) as {
      userId: string;
      jobId?: string;
      reason: PenaltyReason;
    };
    const amountCents = CONFIG.PENALTIES_CENTS[reason];
    if (!amountCents) return new Response(JSON.stringify({ error: "Unknown penalty reason" }), { status: 400 });

    const supabase = getServiceClient();

    await supabase.from("penalties").insert({ user_id: userId, job_id: jobId ?? null, reason, amount_cents: amountCents });

    const { error } = await supabase.rpc("increment_wallet_balance", {
      p_user_id: userId,
      p_amount_cents: -amountCents,
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 409 });

    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      type: "penalty",
      amount_cents: -amountCents,
      status: "completed",
      reference_job_id: jobId ?? null,
    });

    return new Response(JSON.stringify({ ok: true, amountCents }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
