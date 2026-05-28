-- ============================================================
-- Saath — editable medicines (run after 0001_init.sql)
-- Medicine definitions are per profile and shared via household,
-- same RLS model as logs/med_logs.
-- ============================================================

create table if not exists public.medicines (
  id         uuid primary key default gen_random_uuid(),
  household  text not null,
  profile    text not null check (profile in ('papa', 'mummy')),
  name       text not null,
  hindi_name text,
  time       text,
  note       text,
  note_hindi text,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.medicines enable row level security;

grant select, insert, update, delete on public.medicines to anon;

create policy med_def_select on public.medicines for select
  using (household = public.req_household() and public.req_household() <> '');
create policy med_def_insert on public.medicines for insert
  with check (household = public.req_household() and public.req_household() <> '');
create policy med_def_update on public.medicines for update
  using (household = public.req_household() and public.req_household() <> '')
  with check (household = public.req_household() and public.req_household() <> '');
create policy med_def_delete on public.medicines for delete
  using (household = public.req_household() and public.req_household() <> '');
