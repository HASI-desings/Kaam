import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import ProofUpload from "../wallet/ProofUpload";

export default function RatingForm({
  jobId,
  raterId,
  rateeId,
  onSubmitted,
}: {
  jobId: string;
  raterId: string;
  rateeId: string;
  onSubmitted: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState("");
  const [showProof, setShowProof] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await supabase.from("ratings").insert({
      job_id: jobId,
      rater_id: raterId,
      ratee_id: rateeId,
      stars,
      comment: comment || null,
      proof_url: proofUrl,
    });
    setSubmitting(false);
    onSubmitted();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseDown={() => setStars(n)}
            onMouseEnter={() => setHoverStars(n)}
            onMouseLeave={() => setHoverStars(0)}
            className="text-3xl leading-none transition-transform active:scale-90"
          >
            <span className={(hoverStars || stars) >= n ? "text-amber" : "text-border-light dark:text-border-dark"}>★</span>
          </button>
        ))}
      </div>
      <textarea
        placeholder="Leave a comment (optional)"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
      />
      {!showProof ? (
        <button onClick={() => setShowProof(true)} className="text-sm text-teal">
          + Add proof (optional)
        </button>
      ) : (
        <ProofUpload bucket="rating-proofs" pathPrefix={jobId} onUploaded={setProofUrl} />
      )}
      <button
        onClick={handleSubmit}
        disabled={stars === 0 || submitting}
        className="w-full rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit rating"}
      </button>
    </div>
  );
}
