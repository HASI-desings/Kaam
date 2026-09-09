import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import ProofUpload from "../../components/wallet/ProofUpload";

export default function DepositRequest() {
  const { session } = useAuthContext();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [proofPath, setProofPath] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!session || !proofPath || !amount) return;
    setSubmitting(true);
    // Funds stay 'pending' until an admin/reviewer calls verify-deposit-proof —
    // never credited on upload alone, per Security.md 2.2.
    await supabase.from("wallet_transactions").insert({
      user_id: session.user.id,
      type: "deposit",
      amount_cents: Math.round(parseFloat(amount) * 100),
      status: "pending",
      proof_url: proofPath,
    });
    setSubmitting(false);
    navigate("/wallet");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Deposit funds</h1>
      <input
        type="number"
        min={1}
        placeholder="Amount (PKR)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal"
      />
      <ProofUpload bucket="deposit-proofs" pathPrefix={session?.user.id ?? "anon"} onUploaded={setProofPath} />
      <button
        onClick={handleSubmit}
        disabled={!amount || !proofPath || submitting}
        className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit for review"}
      </button>
      <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
        Funds appear in your balance once your proof is reviewed and confirmed.
      </p>
    </div>
  );
}
