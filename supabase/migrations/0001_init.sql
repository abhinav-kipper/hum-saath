-- ============================================================
-- Saath — initial schema (household-code sharing model)
--
-- Every row carries a `household` code. The web client sends the
-- code as an `x-household` request header; the RLS policies below
-- only expose rows whose household matches that header, so the
-- code behaves like a shared family password. No user accounts.
--
-- Run this once in your Supabase project (SQL editor).
-- Pick a LONG, unguessable household code (it is the only secret).
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.logs (
  id            uuid primary key default gen_random_uuid(),
  household     text not null,
  profile       text not null check (profile in ('papa', 'mummy')),
  date          date not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  pain_score    int,
  systolic      int,
  diastolic     int,
  walked        boolean,
  exercise_done boolean,
  unique (household, profile, date)
);

create table if not exists public.med_logs (
  id        uuid primary key default gen_random_uuid(),
  household text not null,
  profile   text not null check (profile in ('papa', 'mummy')),
  med_id    text not null,
  date      date not null,
  taken_at  timestamptz not null default now(),
  unique (household, profile, med_id, date)
);

-- household code extracted from the request header
create or replace function public.req_household() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.headers', true), '')::json ->> 'x-household',
    ''
  );
$$;

alter table public.logs enable row level security;
alter table public.med_logs enable row level security;

-- anon needs table privileges; RLS still restricts which rows
grant usage on schema public to anon;
grant select, insert, update, delete on public.logs to anon;
grant select, insert, update, delete on public.med_logs to anon;

-- policies: only rows matching a non-empty household header
create policy logs_select on public.logs for select
  using (household = public.req_household() and public.req_household() <> '');
create policy logs_insert on public.logs for insert
  with check (household = public.req_household() and public.req_household() <> '');
create policy logs_update on public.logs for update
  using (household = public.req_household() and public.req_household() <> '')
  with check (household = public.req_household() and public.req_household() <> '');
create policy logs_delete on public.logs for delete
  using (household = public.req_household() and public.req_household() <> '');

create policy med_select on public.med_logs for select
  using (household = public.req_household() and public.req_household() <> '');
create policy med_insert on public.med_logs for insert
  with check (household = public.req_household() and public.req_household() <> '');
create policy med_update on public.med_logs for update
  using (household = public.req_household() and public.req_household() <> '')
  with check (household = public.req_household() and public.req_household() <> '');
create policy med_delete on public.med_logs for delete
  using (household = public.req_household() and public.req_household() <> '');
