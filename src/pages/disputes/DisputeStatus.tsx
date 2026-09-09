import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

interface Dispute {
  id: string;
  reason: string;
  status: string;
  resolution: string | null;
  created_at: string;
}

export default function DisputeStatus() {
  const { id } = useParams(); // job id
  const [dispute, setDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("disputes")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setDispute(data));
  }, [id]);

  if (!dispute) return <div className="p-6 text-center text-text-light-secondary dark:text-text-dark-secondary">No dispute found.</div>;

  const statusColor = dispute.status === "resolved" ? "text-success" : dispute.status === "admin_review" ? "text-warning" : "text-text-light-secondary dark:text-text-dark-secondary";

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Dispute status</h1>
      <p className={`text-sm font-medium capitalize ${statusColor}`}>{dispute.status.replace("_", " ")}</p>
      <div className="rounded-xl border border-border-light dark:border-border-dark p-4 text-sm text-text-light dark:text-text-dark">
        {dispute.reason}
      </div>
      {dispute.resolution && (
        <div className="rounded-xl bg-success/10 p-4 text-sm text-success">{dispute.resolution}</div>
      )}
    </div>
  );
}
