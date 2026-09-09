import { useAuthContext } from "../../context/AuthContext";
import { formatPKR } from "../../lib/pricing";

const TIERS = [
  { id: "free", name: "Free", priceCents: 0, features: ["2 free mid-job requests", "No custom release timer", "Rs. 1,000 boosted listing"] },
  { id: "basic", name: "Basic", priceCents: 250000, features: ["4 free mid-job requests", "Custom auto-release timer", "Rs. 1,000 boosted listing"] },
  { id: "elite", name: "Elite", priceCents: 750000, features: ["10 free mid-job requests", "Custom auto-release timer", "Rs. 700 boosted listing (discounted)"] },
] as const;

export default function Plans() {
  const { profile } = useAuthContext();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark text-center mb-8">Choose your plan</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const isElite = tier.id === "elite";
          const isCurrent = profile?.subscription_tier === tier.id;
          return (
            <div
              key={tier.id}
              className={`rounded-2xl p-6 border ${
                isElite ? "border-amber shadow-lg" : "border-border-light dark:border-border-dark"
              } bg-white dark:bg-[#1a1c1a]`}
            >
              <h2 className="font-semibold text-lg text-text-light dark:text-text-dark">{tier.name}</h2>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-text-light dark:text-text-dark">
                {tier.priceCents === 0 ? "Free" : formatPKR(tier.priceCents)}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-text-light-secondary dark:text-text-dark-secondary">
                {tier.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button
                disabled={isCurrent}
                className={`mt-6 w-full rounded-xl py-2.5 font-medium transition active:scale-[0.97] ${
                  isCurrent ? "bg-border-light dark:bg-border-dark text-text-light-secondary dark:text-text-dark-secondary" : "bg-teal text-white"
                }`}
              >
                {isCurrent ? "Current plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-center text-text-light-secondary dark:text-text-dark-secondary">
        Tier upgrades are only applied once payment is confirmed server-side — no benefits before that.
      </p>
    </div>
  );
}
