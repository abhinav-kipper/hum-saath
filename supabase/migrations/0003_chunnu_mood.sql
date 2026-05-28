-- ============================================================
-- Saath — add Chunnu profile + mood check-in (run after 0002)
-- ============================================================

-- daily mood score (1–5) for the mood check-in
alter table public.logs add column if not exists mood_score int;

-- allow the new 'chunnu' profile on every table's check constraint
alter table public.logs       drop constraint if exists logs_profile_check;
alter table public.logs       add  constraint logs_profile_check
  check (profile in ('papa', 'mummy', 'chunnu'));

alter table public.med_logs   drop constraint if exists med_logs_profile_check;
alter table public.med_logs   add  constraint med_logs_profile_check
  check (profile in ('papa', 'mummy', 'chunnu'));

alter table public.medicines  drop constraint if exists medicines_profile_check;
alter table public.medicines  add  constraint medicines_profile_check
  check (profile in ('papa', 'mummy', 'chunnu'));
