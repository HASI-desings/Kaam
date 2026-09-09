// Admin/reviewer-triggered: confirms or rejects a deposit proof.
// Funds are only credited here — never on upload, per Security.md 2.2.
import { getServiceClient } from "../_shared/serviceClient.ts";

Deno.serve(async (req) => {
  try {
    const { transactionId, approve } = await req.json();
    const supabase = getServiceClient();

    const { data: tx, error } = await supabase
      .from("wallet_transactions")
      .select("id, user_id, amount_cents, status, type")
      .eq("id", transactionId)
      .single();
    if (error || !tx) return new Response(JSON.stringify({ error: "Transaction not found" }), { status: 404 });
    if (tx.type !== "deposit" || tx.status !== "pending") {
      return new Response(JSON.stringify({ error: "Not a pending deposit" }), { status: 409 });
    }

    if (approve) {
      await supabase.rpc("increment_wallet_balance", { p_user_id: tx.user_id, p_amount_cents: tx.amount_cents });
      await supabase.from("wallet_transactions").update({ status: "completed" }).eq("id", transactionId);
    } else {
      await supabase.from("wallet_transactions").update({ status: "failed" }).eq("id", transactionId);
    }

    return new Response(JSON.stringify({ ok: true, approved: !!approve }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
