import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { formatPKR } from "../../lib/pricing";

interface Row {
  category_id: string;
  average_price_cents: number | null;
  completed_job_count: number;
  categories: { name: string; min_completed_jobs_for_average: number } | null;
}

export default function AverageRateManager() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    supabase
      .from("category_average_rates")
      .select("category_id, average_price_cents, completed_job_count, categories(name, min_completed_jobs_for_average)")
      .then(({ data }) => setRows((data as unknown as Row[]) ?? []));
  }, []);

  async function updateMinJobs(categoryId: string, value: number) {
    await supabase.from("categories").update({ min_completed_jobs_for_average: value }).eq("id", categoryId);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Average rate manager</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-text-light-secondary dark:text-text-dark-secondary border-b border-border-light dark:border-border-dark">
            <th className="py-2">Category</th>
            <th className="py-2">Average</th>
            <th className="py-2">Jobs counted</th>
            <th className="py-2">Min jobs to activate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.category_id} className="border-b border-border-light dark:border-border-dark">
              <td className="py-2 text-text-light dark:text-text-dark">{r.categories?.name}</td>
              <td className="py-2 tabular-nums text-text-light dark:text-text-dark">
                {r.average_price_cents ? formatPKR(r.average_price_cents) : "—"}
              </td>
              <td className="py-2 tabular-nums text-text-light dark:text-text-dark">{r.completed_job_count}</td>
              <td className="py-2">
                <input
                  type="number"
                  defaultValue={r.categories?.min_completed_jobs_for_average}
                  onBlur={(e) => updateMinJobs(r.category_id, Number(e.target.value))}
                  className="w-20 rounded-lg border border-border-light dark:border-border-dark bg-transparent px-2 py-1 tabular-nums"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
