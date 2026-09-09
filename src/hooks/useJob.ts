import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Job } from "../types";

export function useJob(jobId: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    let active = true;

    async function load() {
      setLoading(true);
      const { data } = await supabase.from("jobs").select("*").eq("id", jobId).single();
      if (active) {
        setJob(data as Job | null);
        setLoading(false);
      }
    }
    load();

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${jobId}` },
        (payload) => setJob(payload.new as Job)
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  return { job, loading };
}
