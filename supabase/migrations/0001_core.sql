-- 0001_core.sql
-- Core identity, profile, wallet, category tables + RLS

create extension if not exists "uuid-ossp";

-- Profiles (1:1 with auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  address text,
  education text,
  occupation text,
  is_profile_complete boolean not null default false,
  is_verified boolean not null default false,
  subscription_tier text not null default 'free' check (subscription_tier in ('free','basic','elite')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_own_or_public_fields"
  on profiles for select
  using (true); -- public profile view is allowed; sensitive fields are filtered at the query layer, never wallet data

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

-- Wallets (private, one per user)
create table wallets (
  user_id uuid primary key references profiles(id) on delete cascade,
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  currency text not null default 'PKR',
  updated_at timestamptz not null default now()
);

alter table wallets enable row level security;

create policy "wallets_select_own_only"
  on wallets for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies for wallets from client roles at all.
-- All balance mutations happen exclusively via service-role Edge Functions.

-- Categories (fixed, admin-managed list)
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  is_creative boolean not null default false, -- drives redo-rule eligibility
  min_completed_jobs_for_average int not null default 10,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "categories_select_all"
  on categories for select
  using (true);

-- category averages, computed periodically (kept simple: a rolling numeric column
-- updated by a scheduled Edge Function, never written by client code)
create table category_average_rates (
  category_id uuid primary key references categories(id) on delete cascade,
  average_price_cents bigint,
  completed_job_count int not null default 0,
  updated_at timestamptz not null default now()
);

alter table category_average_rates enable row level security;

create policy "category_averages_select_all"
  on category_average_rates for select
  using (true);
