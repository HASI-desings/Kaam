import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Stats {
  completed: number;
  categories: string[];
  repeatClientPercent: number;
}

export default function Portfolio({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats>({ completed: 0, categories: [], repeatClientPercent: 0 });

  useEffect(() => {
    supabase
      .from("jobs")
      .select("category_id, client_id, categories(name)")
      .eq("worker_id", userId)
      .eq("status", "completed")
      .then(({ data }) => {
        if (!data) return;
        const rows = data as unknown as { client_id: string; categories: { name: string } | null }[];
        const clientCounts = new Map<string, number>();
        rows.forEach((r) => clientCounts.set(r.client_id, (clientCounts.get(r.client_id) ?? 0) + 1));
        const repeatClients = [...clientCounts.values()].filter((c) => c > 1).length;
        setStats({
          completed: rows.length,
          categories: [...new Set(rows.map((r) => r.categories?.name).filter(Boolean) as string[])],
          repeatClientPercent: clientCounts.size ? Math.round((repeatClients / clientCounts.size) * 100) : 0,
        });
      });
  }, [userId]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Completed jobs" value={stats.completed} />
      <StatCard label="Categories" value={stats.categories.length} />
      <StatCard label="Repeat clients" value={`${stats.repeatClientPercent}%`} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border-light dark:border-border-dark p-4 text-center">
      <p className="text-lg font-semibold tabular-nums text-text-light dark:text-text-dark">{value}</p>
      <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">{label}</p>
    </div>
  );
}
