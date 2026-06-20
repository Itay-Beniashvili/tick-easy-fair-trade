-- 000_base.sql — recreate the base TickEasy schema (profiles, tickets, user_roles)
-- plus signup trigger, on a fresh Supabase project.
create extension if not exists "pgcrypto";

-- ROLE ENUM ------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin','user','manager');
exception when duplicate_object then null; end $$;

-- updated_at helper ----------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- PROFILES -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  preferred_genres text[] default '{}',
  preferred_artists text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists profiles_updated on public.profiles;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- TICKETS --------------------------------------------------------------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  event_title text not null,
  event_venue text not null,
  event_city text not null,
  event_date text not null,
  event_time text not null,
  event_image text,
  ticket_type text not null default 'standard',
  seat_info text,
  price numeric not null,
  qr_code text,
  is_for_sale boolean default false,
  sale_price numeric,
  purchase_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists tickets_updated on public.tickets;
create trigger tickets_updated before update on public.tickets
  for each row execute function public.set_updated_at();

-- USER ROLES -----------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  unique (user_id, role)
);

-- has_role(): SECURITY DEFINER so RLS policies can call it safely -------
create or replace function public.has_role(_role public.app_role) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = _role);
$$;

-- get_tickets_for_sale(): public resale listings -----------------------
create or replace function public.get_tickets_for_sale()
returns table (
  id uuid, event_id text, event_title text, event_venue text, event_city text,
  event_date text, event_time text, event_image text, ticket_type text,
  seat_info text, sale_price numeric, created_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select id, event_id, event_title, event_venue, event_city, event_date,
         event_time, event_image, ticket_type, seat_info, sale_price, created_at
  from public.tickets where is_for_sale = true;
$$;

-- signup trigger: create profile + role from auth metadata -------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name')
    on conflict (user_id) do nothing;
  -- Only 'user' or 'manager' may be self-selected at signup; never 'admin'.
  insert into public.user_roles (user_id, role)
    values (new.id, case
      when (new.raw_user_meta_data->>'role') in ('user','manager')
        then (new.raw_user_meta_data->>'role')::public.app_role
      else 'user' end)
    on conflict (user_id, role) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS ------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles for select using (auth.uid() = user_id);
drop policy if exists profiles_ins on public.profiles;
create policy profiles_ins on public.profiles for insert with check (auth.uid() = user_id);
drop policy if exists profiles_upd on public.profiles;
create policy profiles_upd on public.profiles for update using (auth.uid() = user_id);

drop policy if exists tickets_own on public.tickets;
create policy tickets_own on public.tickets for select using (auth.uid() = user_id);
drop policy if exists tickets_ins on public.tickets;
create policy tickets_ins on public.tickets for insert with check (auth.uid() = user_id);
drop policy if exists tickets_upd on public.tickets;
create policy tickets_upd on public.tickets for update using (auth.uid() = user_id);

drop policy if exists roles_own on public.user_roles;
create policy roles_own on public.user_roles for select using (auth.uid() = user_id);
