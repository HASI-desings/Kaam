import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface DisputeRow {
  id: string;
  job_id: string;
  reason: string;
  status: string;
}

export default function DisputeReview() {
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [resolutionDrafts, setResolutionDrafts] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await supabase.from("disputes").select("id, job_id, reason, status").in("status", ["open", "admin_review"]);
    setDisputes((data as DisputeRow[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(d: DisputeRow) {
    const resolution = resolutionDrafts[d.id];
    if (!resolution) return;
    await supabase.from("disputes").update({ status: "resolved", resolution }).eq("id", d.id);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Dispute review</h1>
      {disputes.map((d) => (
        <div key={d.id} className="rounded-xl border border-border-light dark:border-border-dark p-4 space-y-2">
          <p className="text-sm text-text-light dark:text-text-dark">{d.reason}</p>
          <input
            placeholder="Resolution note"
            value={resolutionDrafts[d.id] ?? ""}
            onChange={(e) => setResolutionDrafts({ ...resolutionDrafts, [d.id]: e.target.value })}
            className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
          />
          <button onClick={() => resolve(d)} className="text-sm font-medium text-teal">
            Mark resolved
          </button>
        </div>
      ))}
      {disputes.length === 0 && <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary py-8 text-center">No open disputes.</p>}
    </div>
  );
}
