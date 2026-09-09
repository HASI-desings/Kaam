-- 0002_jobs.sql
-- Jobs, offers, job progress, milestones

create table jobs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references profiles(id) on delete cascade,
  worker_id uuid references profiles(id) on delete set null,
  category_id uuid not null references categories(id),
  title text not null,
  description text not null,
  payment_type text not null check (payment_type in ('cash','service','either')),
  price_min_cents bigint,
  price_max_cents bigint,
  acceptance_criteria jsonb not null default '[]',
  deadline timestamptz not null,
  status text not null default 'open'
    check (status in ('open','offer_pending','assigned','in_progress','submitted','completed','cancelled','disputed')),
  is_boosted boolean not null default false,
  pause_count int not null default 0,
  auto_release_at timestamptz,
  custom_release_hours int,
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now()
);

alter table jobs enable row level security;

create policy "jobs_select_open_or_party"
  on jobs for select
  using (status = 'open' or auth.uid() = client_id or auth.uid() = worker_id);

create policy "jobs_insert_own_as_client"
  on jobs for insert
  with check (auth.uid() = client_id);

create policy "jobs_update_party_only"
  on jobs for update
  using (auth.uid() = client_id or auth.uid() = worker_id);

create table offers (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  worker_id uuid not null references profiles(id) on delete cascade,
  offer_amount_cents bigint,
  offer_service_description text,
  worker_valuation_cents bigint,
  gap_confirmation_required boolean not null default false,
  client_confirmed_gap boolean not null default false,
  worker_confirmed_gap boolean not null default false,
  gap_confirmation_expires_at timestamptz,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','expired')),
  created_at timestamptz not null default now()
);

alter table offers enable row level security;

create policy "offers_select_job_parties"
  on offers for select
  using (
    auth.uid() = worker_id
    or auth.uid() in (select client_id from jobs where jobs.id = offers.job_id)
  );

create policy "offers_insert_own_as_worker"
  on offers for insert
  with check (auth.uid() = worker_id);

create policy "offers_update_job_parties"
  on offers for update
  using (
    auth.uid() = worker_id
    or auth.uid() in (select client_id from jobs where jobs.id = offers.job_id)
  );

create table job_progress (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  author_id uuid not null references profiles(id),
  note text,
  percent_at_update int not null check (percent_at_update between 0 and 100),
  created_at timestamptz not null default now()
);

alter table job_progress enable row level security;

create policy "job_progress_select_job_parties"
  on job_progress for select
  using (
    auth.uid() in (
      select client_id from jobs where jobs.id = job_progress.job_id
      union
      select worker_id from jobs where jobs.id = job_progress.job_id
    )
  );

create policy "job_progress_insert_job_parties"
  on job_progress for insert
  with check (
    auth.uid() in (
      select client_id from jobs where jobs.id = job_progress.job_id
      union
      select worker_id from jobs where jobs.id = job_progress.job_id
    )
  );

create table job_milestones (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  sequence int not null,
  amount_cents bigint not null,
  status text not null default 'pending' check (status in ('pending','escrowed','released')),
  created_at timestamptz not null default now()
);

alter table job_milestones enable row level security;

create policy "job_milestones_select_job_parties"
  on job_milestones for select
  using (
    auth.uid() in (
      select client_id from jobs where jobs.id = job_milestones.job_id
      union
      select worker_id from jobs where jobs.id = job_milestones.job_id
    )
  );
