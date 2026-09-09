import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { priceGapExceeds30Percent } from "../../lib/validators";
import { Job } from "../../types";

export default function OfferForm({
  job,
  workerId,
  onSubmitted,
}: {
  job: Job;
  workerId: string;
  onSubmitted: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [valuation, setValuation] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const amountCents = amount ? Math.round(parseFloat(amount) * 100) : null;
    const valuationCents = valuation ? Math.round(parseFloat(valuation) * 100) : amountCents;
    const gapRequired =
      amountCents !== null && valuationCents !== null && priceGapExceeds30Percent(job.price_max_cents ?? 0, valuationCents);

    const { error } = await supabase.from("offers").insert({
      job_id: job.id,
      worker_id: workerId,
      offer_amount_cents: amountCents,
      offer_service_description: job.payment_type === "cash" ? null : serviceDesc || null,
      worker_valuation_cents: valuationCents,
      gap_confirmation_required: gapRequired,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSubmitted();
  }

  return (
    <div className="space-y-4">
      {job.payment_type !== "service" && (
        <>
          <input
            type="number"
            placeholder="Your offer amount (PKR)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <input
            type="number"
            placeholder="Your own valuation of this work (optional)"
            value={valuation}
            onChange={(e) => setValuation(e.target.value)}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal"
          />
        </>
      )}
      {job.payment_type !== "cash" && (
        <textarea
          placeholder="Describe the service you're offering in trade"
          rows={3}
          value={serviceDesc}
          onChange={(e) => setServiceDesc(e.target.value)}
          className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
        />
      )}
      {error && <p className="text-danger text-sm">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit offer"}
      </button>
    </div>
  );
}
