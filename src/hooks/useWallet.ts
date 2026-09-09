import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Wallet } from "../types";

export function useWallet(userId: string | undefined) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
    setWallet(data as Wallet | null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [userId]);

  // Wallet balance is NEVER mutated from here. All changes go through
  // Edge Functions (deposit approval, escrow release, penalties, etc.)
  // then the caller should invoke refresh() to re-fetch the true value.
  return { wallet, loading, refresh };
}
