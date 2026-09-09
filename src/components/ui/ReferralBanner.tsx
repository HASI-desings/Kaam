import { useAuthContext } from "../../context/AuthContext";

export default function ReferralBanner() {
  const { session } = useAuthContext();
  if (!session) return null;
  const link = `${window.location.origin}/signup?ref=${session.user.id}`;

  return (
    <div className="rounded-xl border border-amber/40 bg-amber/5 p-4 space-y-2">
      <p className="text-sm font-medium text-text-light dark:text-text-dark">Invite a friend, earn credit</p>
      <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
        You both get a reward once they complete their first job.
      </p>
      <div className="flex gap-2">
        <input readOnly value={link} className="flex-1 rounded-lg border border-border-light dark:border-border-dark bg-transparent px-3 py-2 text-xs" />
        <button
          onClick={() => navigator.clipboard.writeText(link)}
          className="rounded-lg bg-amber text-white px-3 py-2 text-xs font-medium active:scale-[0.97] transition"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
