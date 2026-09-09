import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuthContext } from "../../context/AuthContext";

interface FlaggedRow {
  id: string;
  message_id: string;
  reason: string;
  status: string;
  messages: { content: string; sender_id: string } | null;
}

export default function ReviewQueue() {
  const { session } = useAuthContext();
  const [rows, setRows] = useState<FlaggedRow[]>([]);

  async function load() {
    const { data } = await supabase
      .from("flagged_messages")
      .select("id, message_id, reason, status, messages(content, sender_id)")
      .eq("status", "pending");
    setRows((data as unknown as FlaggedRow[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(row: FlaggedRow, decision: "safe" | "violation") {
    await supabase
      .from("flagged_messages")
      .update({ status: decision, reviewed_by: session?.user.id, reviewed_at: new Date().toISOString() })
      .eq("id", row.id);
    await supabase.from("messages").update({ status: decision }).eq("id", row.message_id);
    load();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
      <h1 className="text-xl font-semibold text-text-light dark:text-text-dark">Flagged messages</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-text-light-secondary dark:text-text-dark-secondary border-b border-border-light dark:border-border-dark">
            <th className="py-2">Message</th>
            <th className="py-2">Reason</th>
            <th className="py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border-light dark:border-border-dark">
              <td className="py-2 pr-4 text-text-light dark:text-text-dark">{r.messages?.content}</td>
              <td className="py-2 pr-4 text-text-light-secondary dark:text-text-dark-secondary">{r.reason}</td>
              <td className="py-2 flex gap-2">
                <button onClick={() => decide(r, "safe")} className="text-success font-medium">Safe</button>
                <button onClick={() => decide(r, "violation")} className="text-danger font-medium">Violation</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary py-8 text-center">Queue is empty.</p>}
    </div>
  );
}
