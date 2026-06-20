-- 001_schema.sql — TickEasy gap-closing schema (events, inquiries, groups, community, transactions)
create extension if not exists "pgcrypto";

-- EVENTS ---------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  venue text not null,
  city text not null,
  event_date date not null,
  event_time text not null,
  price numeric not null,
  original_price numeric not null,
  image text,
  genre text not null check (genre in ('music','sports','theater')),
  description text,
  total_tickets int not null default 0,
  available_tickets int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_manager_idx on public.events(manager_id);

-- INQUIRIES ------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  event_id uuid not null references public.events(id) on delete cascade,
  subject text not null,
  message text not null,
  type text not null default 'question' check (type in ('refund','question','complaint')),
  status text not null default 'pending' check (status in ('pending','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists inquiries_event_idx on public.inquiries(event_id);

-- GROUP PURCHASES ------------------------------------------------------
create table if not exists public.group_purchases (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  price_per_ticket numeric not null,
  total_tickets int not null,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists public.group_participants (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.group_purchases(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  ticket_count int not null default 1,
  has_paid boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists group_participants_group_idx on public.group_participants(group_id);

-- COMMUNITY ------------------------------------------------------------
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_name text not null,
  type text not null default 'other' check (type in ('partner','ride','other')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists community_event_idx on public.community_posts(event_id);

-- TRANSACTIONS (analytics/audit) --------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid,
  event_id uuid,
  seller_id uuid,
  buyer_id uuid not null,
  amount numeric not null,
  type text not null check (type in ('primary','resale')),
  created_at timestamptz not null default now()
);

-- RLS ------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.inquiries enable row level security;
alter table public.group_purchases enable row level security;
alter table public.group_participants enable row level security;
alter table public.community_posts enable row level security;
alter table public.transactions enable row level security;

drop policy if exists events_read on public.events;
create policy events_read on public.events for select using (true);
drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert with check (auth.uid() = manager_id);
drop policy if exists events_update on public.events;
create policy events_update on public.events for update using (auth.uid() = manager_id);
drop policy if exists events_delete on public.events;
create policy events_delete on public.events for delete using (auth.uid() = manager_id);

drop policy if exists inq_insert on public.inquiries;
create policy inq_insert on public.inquiries for insert with check (auth.uid() = user_id);
drop policy if exists inq_read on public.inquiries;
create policy inq_read on public.inquiries for select using (
  auth.uid() = user_id
  or exists (select 1 from public.events e where e.id = event_id and e.manager_id = auth.uid())
);
drop policy if exists inq_update on public.inquiries;
create policy inq_update on public.inquiries for update using (
  exists (select 1 from public.events e where e.id = event_id and e.manager_id = auth.uid())
);

drop policy if exists gp_read on public.group_purchases;
create policy gp_read on public.group_purchases for select using (true);
drop policy if exists gp_insert on public.group_purchases;
create policy gp_insert on public.group_purchases for insert with check (auth.uid() = organizer_id);
drop policy if exists gp_update on public.group_purchases;
create policy gp_update on public.group_purchases for update
  using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);
-- group_participants: list is readable within the demo (only low-sensitivity
-- name/paid/ticket_count is shown; the app does not store participant emails),
-- but each user may only add or modify THEIR OWN row.
drop policy if exists gpart_read on public.group_participants;
create policy gpart_read on public.group_participants for select using (true);
drop policy if exists gpart_write on public.group_participants;
create policy gpart_write on public.group_participants for insert with check (auth.uid() = user_id);
drop policy if exists gpart_update on public.group_participants;
create policy gpart_update on public.group_participants for update using (auth.uid() = user_id);

drop policy if exists cp_read on public.community_posts;
create policy cp_read on public.community_posts for select using (true);
drop policy if exists cp_insert on public.community_posts;
create policy cp_insert on public.community_posts for insert with check (auth.uid() = user_id);
drop policy if exists cp_delete on public.community_posts;
create policy cp_delete on public.community_posts for delete using (auth.uid() = user_id);

drop policy if exists tx_read on public.transactions;
create policy tx_read on public.transactions for select using (
  auth.uid() = buyer_id or auth.uid() = seller_id
  or exists (select 1 from public.events e where e.id = event_id and e.manager_id = auth.uid())
);
