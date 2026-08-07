-- ============================================================
-- RoboTech Academy — Supabase provisioning (Phase 3)
-- Already applied to the live project (qlabyqbajxwbcnljjaxs) via the
-- management API. Kept in the repo so the setup is reproducible on a
-- fresh project (paste in the Supabase SQL editor).
-- Storage buckets (public): images, videos, documents, certificates.
-- Auth: mailer_autoconfirm = true (no SMTP for kids' accounts).
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null default '',
  avatar text not null default '🚀',
  role text not null default 'student' check (role in ('admin','teacher','student')),
  join_date text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.labs (
  key text primary key,
  data jsonb not null,
  ord int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.deleted_lab_keys (
  key text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_kv (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_state (
  email text not null,
  key text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (email, key)
);

create table if not exists public.gam_profiles (
  email text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id text primary key,
  name text not null,
  category text not null,
  mime text not null,
  size bigint not null default 0,
  bucket text not null,
  path text not null,
  created_at timestamptz not null default now()
);

-- Postgres grants (tables created outside the dashboard miss the defaults)
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;

-- Helpers
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.jwt_email() returns text
language sql stable as
$$ select coalesce(auth.jwt() ->> 'email', '') $$;

-- RLS
alter table public.profiles enable row level security;
alter table public.labs enable row level security;
alter table public.deleted_lab_keys enable row level security;
alter table public.news enable row level security;
alter table public.site_kv enable row level security;
alter table public.user_state enable row level security;
alter table public.gam_profiles enable row level security;
alter table public.media enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles for delete using (public.is_admin());

do $do$
declare tbl text;
begin
  foreach tbl in array array['labs','deleted_lab_keys','news','site_kv','media'] loop
    execute format('drop policy if exists %I_read on public.%I', tbl, tbl);
    execute format('create policy %I_read on public.%I for select using (true)', tbl, tbl);
    execute format('drop policy if exists %I_write on public.%I', tbl, tbl);
    execute format('create policy %I_write on public.%I for all using (public.is_admin()) with check (public.is_admin())', tbl, tbl);
  end loop;
end
$do$;

drop policy if exists user_state_own on public.user_state;
create policy user_state_own on public.user_state for all
  using (email = lower(public.jwt_email()) or public.is_admin())
  with check (email = lower(public.jwt_email()) or public.is_admin());

drop policy if exists gam_profiles_read on public.gam_profiles;
create policy gam_profiles_read on public.gam_profiles for select using (true);
drop policy if exists gam_profiles_write on public.gam_profiles;
create policy gam_profiles_write on public.gam_profiles for all
  using (email = lower(public.jwt_email()) or public.is_admin())
  with check (email = lower(public.jwt_email()) or public.is_admin());

-- Storage policies (buckets created via the storage API)
drop policy if exists "robotech admin write" on storage.objects;
create policy "robotech admin write" on storage.objects for all
  using (bucket_id in ('images','videos','documents','certificates') and public.is_admin())
  with check (bucket_id in ('images','videos','documents','certificates') and public.is_admin());
drop policy if exists "robotech public read" on storage.objects;
create policy "robotech public read" on storage.objects for select
  using (bucket_id in ('images','videos','documents','certificates'));

-- Admin account: create the auth user (admin@robotech.com) via the dashboard
-- or the auth admin API, then:
--   insert into public.profiles (id, email, name, avatar, role)
--   values ('<auth-user-uuid>', 'admin@robotech.com', 'المدير', '🛡️', 'admin')
--   on conflict (id) do update set role = 'admin';
