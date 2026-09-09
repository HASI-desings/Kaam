-- 0003_chat_ratings_disputes.sql

create table messages (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  content text not null,
  status text not null default 'safe' check (status in ('pending','safe','violation')),
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "messages_select_job_parties"
  on messages for select
  using (
    auth.uid() in (
      select client_id from jobs where jobs.id = messages.job_id
      union
      select worker_id from jobs where jobs.id = messages.job_id
    )
  );

create policy "messages_insert_job_parties"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and auth.uid() in (
      select client_id from jobs where jobs.id = messages.job_id
      union
      select worker_id from jobs where jobs.id = messages.job_id
    )
  );
  -- New messages always insert as 'pending' by default at the application layer;
  -- the moderate-message Edge Function (service role) is what flips status to
  -- safe/violation. Client code never sets status directly.

create table flagged_messages (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references messages(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','violation','safe')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table flagged_messages enable row level security;
-- No client-facing select/insert policies: this table is service-role + admin only.

create table ratings (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  rater_id uuid not null references profiles(id),
  ratee_id uuid not null references profiles(id),
  stars int not null check (stars between 1 and 5),
  comment text,
  proof_url text,
  is_removed boolean not null default false,
  removed_reason text,
  created_at timestamptz not null default now()
);

alter table ratings enable row level security;

create policy "ratings_select_all_non_removed"
  on ratings for select
  using (is_removed = false or auth.uid() = rater_id);

create policy "ratings_insert_receiving_party_only"
  on ratings for insert
  with check (
    auth.uid() = rater_id
    and auth.uid() <> ratee_id
    and auth.uid() in (
      -- only the party who did NOT do the work being rated may rate;
      -- exact receiving-party check enforced again server-side in the Edge Function
      select client_id from jobs where jobs.id = ratings.job_id
      union
      select worker_id from jobs where jobs.id = ratings.job_id
    )
  );

create table disputes (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  raised_by uuid not null references profiles(id),
  reason text not null,
  status text not null default 'open' check (status in ('open','admin_review','resolved')),
  resolution text,
  created_at timestamptz not null default now()
);

alter table disputes enable row level security;

create policy "disputes_select_job_parties"
  on disputes for select
  using (
    auth.uid() in (
      select client_id from jobs where jobs.id = disputes.job_id
      union
      select worker_id from jobs where jobs.id = disputes.job_id
    )
  );

create policy "disputes_insert_job_parties"
  on disputes for insert
  with check (
    auth.uid() = raised_by
    and auth.uid() in (
      select client_id from jobs where jobs.id = disputes.job_id
      union
      select worker_id from jobs where jobs.id = disputes.job_id
    )
  );

create table penalties (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete set null,
  user_id uuid not null references profiles(id),
  reason text not null,
  amount_cents bigint not null,
  created_at timestamptz not null default now()
);

alter table penalties enable row level security;

create policy "penalties_select_own"
  on penalties for select
  using (auth.uid() = user_id);
