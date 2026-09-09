import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../context/AuthContext";

export default function RaiseDispute() {
  const { id } = useParams(); // job id
  const { session } = useAuthContext();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!session || !id) return;
    setSubmitting(true);
    await supabase.from("disputes").insert({ job_id: id, raised_by: session.user.id, reason });
    await supabase.from("jobs").update({ status: "disputed" }).eq("id", id);
    setSubmitting(false);
    navigate(`/jobs/${id}/dispute`);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Raise a dispute</h1>
      <textarea
        rows={5}
        placeholder="Explain what happened"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-danger"
      />
      <button
        onClick={handleSubmit}
        disabled={!reason || submitting}
        className="w-full rounded-xl bg-danger text-white py-3 font-medium active:scale-[0.97] transition disabled:opacity-40"
      >
        {submitting ? "Submitting…" : "Submit dispute"}
      </button>
    </div>
  );
}
