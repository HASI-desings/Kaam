import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useWallet } from "../../hooks/useWallet";
import { supabase } from "../../lib/supabaseClient";
import { formatPKR } from "../../lib/pricing";

export default function WithdrawRequest() {
  const { session } = useAuthContext();
  const { wallet } = useWallet(session?.user.id);
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(""); // reference only, never a raw account number
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!session) return;
    const cents = Math.round(parseFloat(amount) * 100);
    if (!wallet || cents > wallet.balance_cents) {
      setError(`Insufficient balance. Available: ${formatPKR(wallet?.balance_cents ?? 0)}`);
      return;
    }
    setSubmitting(true);
    // Funds are NOT deducted here — they stay in the wallet until the payment
    // processor confirms success, per Security.md 2.2.
    await supabase.from("wallet_transactions").insert({
      user_id: session.user.id,
      type: "withdrawal",
      amount_cents: -cents,
      status: "pending",
      proof_url: method, // stores the declared method reference, not an account number
    });
    setSubmitting(false);
    navigate("/wallet");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Withdraw funds</h1>
      <input
        type="number"
        min={1}
        placeholder="Amount (PKR)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal"
      />
      <input
        placeholder="Payment method reference (e.g. JazzCash — 03xx...last4)"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
      />
      {error && <p className="text-danger text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!amount || !method || submitting}
        className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Request withdrawal"}
      </button>
    </div>
  );
}
