-- ============================================================
-- Saath — family cheers (run after 0003)
--
-- A warm two-way nudge between family members. Like every other
-- table, each row carries a `household` code and RLS scopes reads
-- + writes to the family that shares that code. No accounts.
-- ============================================================

create table if not exists public.cheers (
  id          uuid primary key default gen_random_uuid(),
  household   text not null,
  to_profile  text not null check (to_profile in ('papa', 'mummy', 'chunnu')),
  from_name   text not null,
  emoji       text not null,
  date        date not null,
  created_at  timestamptz not null default now()
);

create index if not exists cheers_lookup
  on public.cheers (household, to_profile, date);

alter table public.cheers enable row level security;

grant select, insert, delete on public.cheers to anon;

create policy cheers_select on public.cheers for select
  using (household = public.req_household() and public.req_household() <> '');
create policy cheers_insert on public.cheers for insert
  with check (household = public.req_household() and public.req_household() <> '');
create policy cheers_delete on public.cheers for delete
  using (household = public.req_household() and public.req_household() <> '');
