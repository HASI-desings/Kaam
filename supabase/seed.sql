-- seed.sql
insert into categories (name, is_creative, min_completed_jobs_for_average) values
  ('Graphic Design', true, 10),
  ('Video Editing', true, 10),
  ('Content Writing / Copywriting', true, 10),
  ('Web Design / UI-UX', true, 10),
  ('Web Development / Programming', false, 10),
  ('Tutoring & Academic Help', false, 10),
  ('Assignment / Thesis Formatting', false, 10),
  ('Data Entry', false, 10),
  ('Translation', false, 10),
  ('Virtual Assistance', false, 10),
  ('Photography', false, 10),
  ('Home Tutoring', false, 10),
  ('Errands / Local Task Help', false, 10)
on conflict (name) do nothing;
