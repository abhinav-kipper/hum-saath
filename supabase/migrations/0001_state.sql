-- ============================================================
-- Saath (Jugnu) — initial schema. Household-code RLS.
--
-- One row per household. The web client sends the household code
-- as `x-household`; RLS only exposes rows whose household matches.
-- The code IS the family password — keep it long and unguessable.
--
-- Run once in the Supabase SQL editor.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.state (
  household   text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- household pulled from the request header
create or replace function public.req_household() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.headers', true), '')::json ->> 'x-household',
    ''
  );
$$;

alter table public.state enable row level security;

grant usage on schema public to anon;
grant select, insert, update on public.state to anon;

create policy state_select on public.state for select
  using (household = public.req_household() and public.req_household() <> '');
create policy state_insert on public.state for insert
  with check (household = public.req_household() and public.req_household() <> '');
create policy state_update on public.state for update
  using (household = public.req_household() and public.req_household() <> '')
  with check (household = public.req_household() and public.req_household() <> '');
