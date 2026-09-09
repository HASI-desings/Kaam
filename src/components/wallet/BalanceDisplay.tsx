import { formatPKR } from "../../lib/pricing";

export default function BalanceDisplay({ balanceCents }: { balanceCents: number }) {
  return (
    <div className="rounded-2xl p-6 text-white bg-gradient-to-br from-teal to-teal-light">
      <p className="text-sm opacity-80">Wallet balance</p>
      <p className="text-4xl font-semibold tracking-tight tabular-nums mt-1">{formatPKR(balanceCents)}</p>
    </div>
  );
}
