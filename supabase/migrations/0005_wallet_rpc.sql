-- 0005_wallet_rpc.sql
-- Atomic, serialized wallet mutation. Only callable by the service role
-- (Edge Functions) — never exposed to the anon/authenticated client role.

create or replace function increment_wallet_balance(p_user_id uuid, p_amount_cents bigint)
returns void
language plpgsql
security definer
as $$
begin
  update wallets
  set balance_cents = balance_cents + p_amount_cents,
      updated_at = now()
  where user_id = p_user_id;

  if not found then
    insert into wallets (user_id, balance_cents) values (p_user_id, greatest(p_amount_cents, 0));
  end if;

  if (select balance_cents from wallets where user_id = p_user_id) < 0 then
    raise exception 'Insufficient wallet balance for user %', p_user_id;
  end if;
end;
$$;

revoke execute on function increment_wallet_balance(uuid, bigint) from anon, authenticated;
