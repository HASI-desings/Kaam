-- 0006_storage.sql
-- Access-controlled buckets for proof uploads. Public=false; access is
-- governed entirely by the policies below, per Security.md 1.7.

insert into storage.buckets (id, name, public) values
  ('deposit-proofs', 'deposit-proofs', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('rating-proofs', 'rating-proofs', false)
  on conflict (id) do nothing;

-- Uploading user can read/write their own folder (path prefix = their user id)
create policy "deposit_proofs_owner_rw"
  on storage.objects for all
  using (bucket_id = 'deposit-proofs' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'deposit-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "rating_proofs_owner_rw"
  on storage.objects for all
  using (bucket_id = 'rating-proofs' and (storage.foldername(name))[1] in (
    select job_id::text from ratings where ratings.rater_id = auth.uid()
    union
    select job_id::text from jobs where jobs.client_id = auth.uid() or jobs.worker_id = auth.uid()
  ))
  with check (bucket_id = 'rating-proofs');

-- Admin access is handled via the service-role key in Edge Functions, which
-- bypasses RLS entirely — no separate admin policy needed here.
