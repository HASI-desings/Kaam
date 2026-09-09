-- 0004_subscriptions_referrals.sql

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  tier text not null check (tier in ('free','basic','elite')),
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true
);

alter table subscriptions enable row level security;

create policy "subscriptions_select_own"
  on subscriptions for select
  using (auth.uid() = user_id);

create table referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  referred_id uuid not null references profiles(id) on delete cascade,
  reward_granted boolean not null default false,
  created_at timestamptz not null default now(),
  unique (referred_id) -- one referrer credited per new user
);

alter table referrals enable row level security;

create policy "referrals_select_own"
  on referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- Wallet transaction ledger — append-only audit trail, written only by
-- service-role Edge Functions, readable by the owning user.
create table wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('deposit','withdrawal','job_payment','job_payout','penalty','subscription','boost','verification','refund')),
  amount_cents bigint not null,
  status text not null default 'pending' check (status in ('pending','completed','failed')),
  reference_job_id uuid references jobs(id),
  proof_url text,
  created_at timestamptz not null default now()
);

alter table wallet_transactions enable row level security;

create policy "wallet_transactions_select_own"
  on wallet_transactions for select
  using (auth.uid() = user_id);

-- Skill verification quizzes
create table skill_verifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id),
  passed boolean not null default false,
  score int,
  attempted_at timestamptz not null default now(),
  unique (user_id, category_id)
);

alter table skill_verifications enable row level security;

create policy "skill_verifications_select_own_or_public"
  on skill_verifications for select
  using (true); -- a passed badge is a public trust signal; failed attempts still owner-only in app logic

create policy "skill_verifications_insert_own"
  on skill_verifications for insert
  with check (auth.uid() = user_id);
