import { formatPKR } from "../../lib/pricing";

export default function PriceRangeInput({
  minCents,
  maxCents,
  floorCents,
  onChange,
}: {
  minCents: number;
  maxCents: number;
  floorCents: number | null;
  onChange: (min: number, max: number) => void;
}) {
  const belowFloor = floorCents !== null && minCents < floorCents;

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Min (PKR)"
          value={minCents ? minCents / 100 : ""}
          onChange={(e) => onChange(Math.round(parseFloat(e.target.value || "0") * 100), maxCents)}
          className={`w-full rounded-xl border bg-transparent px-4 py-3 tabular-nums focus:outline-none focus:ring-2 transition-colors ${
            belowFloor ? "border-warning focus:ring-warning" : "border-border-light dark:border-border-dark focus:ring-teal"
          }`}
        />
        <input
          type="number"
          placeholder="Max (PKR)"
          value={maxCents ? maxCents / 100 : ""}
          onChange={(e) => onChange(minCents, Math.round(parseFloat(e.target.value || "0") * 100))}
          className="w-full rounded-xl border border-border-light dark:border-border-dark bg-transparent px-4 py-3 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal"
        />
      </div>
      {floorCents !== null && (
        <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
          Platform average for this category: {formatPKR(floorCents)}
        </p>
      )}
      {belowFloor && <p className="text-xs text-warning">Minimum can't go below the category average.</p>}
    </div>
  );
}
