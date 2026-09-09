import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../context/AuthContext";
import { Job } from "../../types";
import { formatPKR } from "../../lib/pricing";

export default function MyJobsAsClient() {
  const { session } = useAuthContext();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("jobs")
      .select("*")
      .eq("client_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setJobs((data as Job[]) ?? []));
  }, [session]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Jobs I've posted</h1>
      {jobs.map((j) => (
        <Link
          key={j.id}
          to={`/jobs/${j.id}`}
          className="flex items-center justify-between rounded-xl border border-border-light dark:border-border-dark p-4 bg-white dark:bg-[#1a1c1a]"
        >
          <div>
            <p className="font-medium text-text-light dark:text-text-dark">{j.title}</p>
            <p className="text-xs capitalize text-text-light-secondary dark:text-text-dark-secondary">{j.status.replace("_", " ")}</p>
          </div>
          {j.price_max_cents && <span className="tabular-nums text-sm text-text-light dark:text-text-dark">{formatPKR(j.price_max_cents)}</span>}
        </Link>
      ))}
      {jobs.length === 0 && (
        <p className="text-center text-sm text-text-light-secondary dark:text-text-dark-secondary py-12">You haven't posted any jobs yet.</p>
      )}
    </div>
  );
}
