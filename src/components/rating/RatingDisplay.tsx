import { Rating } from "../../types";

export default function RatingDisplay({ rating }: { rating: Rating }) {
  if (rating.is_removed) return null;
  return (
    <div className="rounded-xl border border-border-light dark:border-border-dark p-4">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= rating.stars ? "text-amber" : "text-border-light dark:text-border-dark"}>
            ★
          </span>
        ))}
      </div>
      {rating.comment && <p className="mt-1.5 text-sm text-text-light dark:text-text-dark">{rating.comment}</p>}
    </div>
  );
}
