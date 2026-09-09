import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSubscription(userId: string | undefined) {
  const [tier, setTier] = useState<"free" | "basic" | "elite">("free");

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data) setTier(data.subscription_tier);
      });
  }, [userId]);

  // Tier is read from the server-maintained profiles.subscription_tier column
  // only — never trust a locally cached or client-set flag for feature gating.
  return { tier };
}
