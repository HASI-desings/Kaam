import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useJob } from "../../hooks/useJob";
import { useAuthContext } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import ProgressBar from "../../components/job/ProgressBar";

export default function JobInProgress() {
  const { id } = useParams();
  const { job, loading } = useJob(id);
  const { session } = useAuthContext();
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [note, setNote] = useState("");

  if (loading || !job) return <div className="p-6 text-center text-text-light-secondary dark:text-text-dark-secondary">Loading…</div>;

  const isWorker = session?.user.id === job.worker_id;

  async function postUpdate(percent: number) {
    if (!session || !job) return;
    await supabase.from("job_progress").insert({ job_id: job.id, author_id: session.user.id, note, percent_at_update: percent });
    await supabase.from("jobs").update({ progress_percent: percent, status: percent >= 100 ? "submitted" : "in_progress" }).eq("id", job.id);
    setNote("");
  }

  async function confirmPause() {
    if (!job) return;
    const newCount = job.pause_count + 1;
    const update: Record<string, unknown> = { pause_count: newCount };
    // 2nd pause auto-triggers the 50% charge increase server-side — done here via
    // direct update for MVP; production should route through an Edge Function
    // so the charge-increase math stays authoritative and auditable.
    if (newCount === 2 && job.price_max_cents) {
      update.price_max_cents = Math.round(job.price_max_cents * 1.5);
    }
    await supabase.from("jobs").update(update).eq("id", job.id);
    setShowPauseConfirm(false);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">{job.title}</h1>
        <Link to={`/jobs/${job.id}/chat`} className="text-sm text-teal">
          Open chat →
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-text-light-secondary dark:text-text-dark-secondary">
          <span>Progress</span>
          <span className="tabular-nums">{job.progress_percent}%</span>
        </div>
        <ProgressBar percent={job.progress_percent} />
      </div>

      {isWorker && (
        <div className="space-y-3">
          <input
            placeholder="Status update note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={job.progress_percent}
            onMouseUp={(e) => postUpdate(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => postUpdate(Number((e.target as HTMLInputElement).value))}
            className="w-full accent-teal"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowPauseConfirm(true)}
              className="flex-1 rounded-xl border border-warning text-warning py-3 font-medium active:scale-[0.97] transition"
            >
              Pause job
            </button>
            <button
              onClick={() => postUpdate(100)}
              className="flex-1 rounded-xl bg-teal text-white py-3 font-medium active:scale-[0.97] transition"
            >
              Mark complete
            </button>
          </div>
        </div>
      )}

      {job.status === "submitted" && !isWorker && (
        <button
          onClick={() =>
            supabase.functions.invoke("release-escrow", { body: { jobId: job.id, triggeredBy: "client_confirm" } })
          }
          className="w-full rounded-xl bg-success text-white py-3 font-medium active:scale-[0.97] transition"
        >
          Confirm & release payment
        </button>
      )}

      {showPauseConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1a1c1a] rounded-2xl p-6 space-y-4 animate-[scaleFade_0.2s_ease-out]">
            <h3 className="font-semibold text-text-light dark:text-text-dark">Pause this job?</h3>
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
              {job.pause_count === 0
                ? "Your first pause is free — noted on the job, no charge."
                : "This is your second pause. The job charge will increase by 50%."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowPauseConfirm(false)} className="flex-1 rounded-xl border border-border-light dark:border-border-dark py-3">
                Cancel
              </button>
              <button onClick={confirmPause} className="flex-1 rounded-xl bg-warning text-white py-3 font-medium">
                Confirm pause
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
