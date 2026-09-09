import { Link } from "react-router-dom";
import { Job } from "../../types";
import { formatPKR } from "../../lib/pricing";

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

export default function JobCard({ job, categoryName }: { job: Job; categoryName: string }) {
  const days = daysLeft(job.deadline);
  const deadlineColor = days < 0 ? "text-danger" : days <= 1 ? "text-warning" : "text-text-light-secondary dark:text-text-dark-secondary";

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block rounded-xl border border-border-light dark:border-border-dark p-4 bg-white dark:bg-[#1a1c1a] active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal/10 text-teal">{categoryName}</span>
        {job.is_boosted && (
          <span className="text-xs font-medium px-2 py-1 rounded-full text-white bg-gradient-to-r from-amber to-amber-light">
            Boosted
          </span>
        )}
      </div>
      <h3 className="mt-2 font-semibold text-text-light dark:text-text-dark leading-snug">{job.title}</h3>
      <p className="mt-1 text-sm tabular-nums text-text-light-secondary dark:text-text-dark-secondary">
        {job.payment_type === "service"
          ? "Service swap"
          : job.price_min_cents && job.price_max_cents
          ? `${formatPKR(job.price_min_cents)} – ${formatPKR(job.price_max_cents)}`
          : "Price on offer"}
      </p>
      <p className={`mt-1 text-xs ${deadlineColor}`}>
        {days < 0 ? "Deadline passed" : days === 0 ? "Due today" : `${days}d left`}
      </p>
    </Link>
  );
}
