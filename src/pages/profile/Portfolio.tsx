import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import LiveStatsCounter from "../../components/ui/LiveStatsCounter";
import ReliabilityRing from "../../components/ui/ReliabilityRing";

interface Stats {
  completed: number;
  categories: string[];
  repeatClientPercent: number;
  reliabilityScore: number;
}

export default function Portfolio({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats>({ completed: 0, categories: [], repeatClientPercent: 0, reliabilityScore: 0 });

  useEffect(() => {
    supabase
      .from("jobs")
      .select("category_id, client_id, status, categories(name)")
      .eq("worker_id", userId)
      .then(({ data }) => {
        if (!data) return;
        const rows = data as unknown as { client_id: string; status: string; categories: { name: string } | null }[];
        const completedRows = rows.filter((r) => r.status === "completed");
        const clientCounts = new Map<string, number>();
        completedRows.forEach((r) => clientCounts.set(r.client_id, (clientCounts.get(r.client_id) ?? 0) + 1));
        const repeatClients = [...clientCounts.values()].filter((c) => c > 1).length;
        const reliability = rows.length ? Math.round((completedRows.length / rows.length) * 100) : 0;
        setStats({
          completed: completedRows.length,
          categories: [...new Set(completedRows.map((r) => r.categories?.name).filter(Boolean) as string[])],
          repeatClientPercent: clientCounts.size ? Math.round((repeatClients / clientCounts.size) * 100) : 0,
          reliabilityScore: reliability,
        });
      });
  }, [userId]);

  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <LiveStatsCounter value={stats.completed} label="Jobs completed" />
      <div className="flex justify-center">
        <ReliabilityRing score={stats.reliabilityScore} size={72} />
      </div>
      <LiveStatsCounter value={stats.repeatClientPercent} suffix="%" label="Repeat clients" />
    </div>
  );
}
