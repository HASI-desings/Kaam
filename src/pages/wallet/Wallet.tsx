import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { useWallet } from "../../hooks/useWallet";
import { supabase } from "../../lib/supabaseClient";
import { formatPKR } from "../../lib/pricing";
import BalanceDisplay from "../../components/wallet/BalanceDisplay";

interface Tx {
  id: string;
  type: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

export default function Wallet() {
  const { session } = useAuthContext();
  const { wallet } = useWallet(session?.user.id);
  const [transactions, setTransactions] = useState<Tx[]>([]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("wallet_transactions")
      .select("id, type, amount_cents, status, created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setTransactions((data as Tx[]) ?? []));
  }, [session]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <BalanceDisplay balanceCents={wallet?.balance_cents ?? 0} />
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/wallet/deposit"
          className="rounded-xl bg-teal text-white text-center py-3 font-medium active:scale-[0.97] transition"
        >
          Deposit
        </Link>
        <Link
          to="/wallet/withdraw"
          className="rounded-xl border border-teal text-teal text-center py-3 font-medium active:scale-[0.97] transition"
        >
          Withdraw
        </Link>
      </div>
      <div>
        <h2 className="text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-2">
          Transaction history
        </h2>
        <div className="divide-y divide-border-light dark:divide-border-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-text-light dark:text-text-dark capitalize">{tx.type.replace("_", " ")}</p>
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                  {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`tabular-nums font-medium ${tx.amount_cents >= 0 ? "text-success" : "text-danger"}`}>
                  {tx.amount_cents >= 0 ? "+" : ""}
                  {formatPKR(tx.amount_cents)}
                </p>
                <span className="text-xs capitalize text-text-light-secondary dark:text-text-dark-secondary">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="px-4 py-6 text-sm text-center text-text-light-secondary dark:text-text-dark-secondary">
              No transactions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
