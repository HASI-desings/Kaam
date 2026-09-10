import { Link } from "react-router-dom";
import { Job } from "../../types";
import { formatPKR } from "../../lib/pricing";
import VerificationBadge from "../ui/VerificationBadge";

function daysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function JobCard({
  job,
  categoryName,
  workerVerified = false,
  workerRating,
}: {
  job: Job;
  categoryName: string;
  workerVerified?: boolean;
  workerRating?: number;
}) {
  const days = daysLeft(job.deadline);
  const deadlineColor =
    days < 0 ? "text-danger" : days <= 1 ? "text-warning" : "text-text-light-secondary dark:text-text-dark-secondary";

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block rounded-2xl p-4 bg-surface-light dark:bg-surface-dark shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 ease-out"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-trust/10 text-trust">{categoryName}</span>
        {job.is_boosted && (
          <span className="gold-shimmer text-xs font-medium px-2.5 py-1 rounded-full text-white">Featured</span>
        )}
      </div>

      <h3 className="mt-2.5 font-semibold text-text-light dark:text-text-dark leading-snug group-hover:text-trust transition-colors">
        {job.title}
      </h3>

      <p className="mt-1 text-sm tabular-nums text-text-light-secondary dark:text-text-dark-secondary">
        {job.payment_type === "service"
          ? "Service swap"
          : job.price_min_cents && job.price_max_cents
          ? `${formatPKR(job.price_min_cents)} – ${formatPKR(job.price_max_cents)}`
          : "Price on offer"}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {workerVerified && <VerificationBadge size="sm" />}
          {typeof workerRating === "number" && (
            <span className="flex items-center gap-1 text-xs font-medium text-warmth">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />
              </svg>
              {workerRating.toFixed(1)}
            </span>
          )}
        </div>
        <p className={`text-xs ${deadlineColor}`}>
          {days < 0 ? "Deadline passed" : days === 0 ? "Due today" : `${days}d left`}
        </p>
      </div>
    </Link>
  );
}
