// Service-role client — used ONLY inside Edge Functions, never shipped to frontend.
// SUPABASE_SERVICE_ROLE_KEY is set as a Supabase Edge Function secret, not in .env.local.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, serviceKey);
}
