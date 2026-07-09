-- 005_security_hardening.sql — security tightening for TickEasy.
-- Idempotent / re-runnable. All SECURITY DEFINER functions set search_path = public.
-- This migration only TIGHTENS behavior; it does not change the RPC/table surface
-- the currently-deployed frontend depends on (same function names & signatures).
--
-- Covers:
--   1. Oversell race in purchase_ticket + CHECK (available_tickets >= 0) on events.
--   2. Per-user / per-event primary-purchase cap (constant = 6).
--   3. RLS PII fix on group_participants and community_posts (no anon leakage).
--   4. Manager role as a real boundary on events + hardened signup + grant_manager RPC.

-- ---------------------------------------------------------------------------
-- 1 + 2.  Oversell race + purchase cap in purchase_ticket
-- ---------------------------------------------------------------------------

-- Non-negative inventory backstop (guarded so re-runs don't error).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'events_available_nonneg'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
      add constraint events_available_nonneg check (available_tickets >= 0);
  end if;
end $$;

-- Primary purchase. The event row is locked FOR UPDATE to serialize concurrent
-- buyers (kills the oversell race); the guarded decrement + CHECK constraint are
-- the final backstops. A per-user/per-event cap prevents primary-market hoarding.
create or replace function public.purchase_ticket(p_event_id uuid, p_seat_info text)
returns public.tickets
language plpgsql security definer set search_path = public as $$
declare
  e public.events;
  t public.tickets;
  v_buyer uuid := auth.uid();
  v_owned int;
  -- Documented cap: at most this many tickets per user, per event, on the
  -- primary market. Change here to adjust the policy.
  c_cap  constant int := 6;
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;

  -- Lock the event row: concurrent purchase_ticket calls now serialize here.
  select * into e from public.events where id = p_event_id for update;
  if not found then raise exception 'event not found'; end if;
  if e.available_tickets <= 0 then raise exception 'sold out'; end if;

  -- Per-user / per-event cap (counts every ticket the buyer holds for this event).
  select count(*) into v_owned
  from public.tickets
  where user_id = v_buyer and event_id = e.id::text;
  if v_owned >= c_cap then
    raise exception 'purchase limit reached: max % tickets per event', c_cap;
  end if;

  insert into public.tickets(user_id, event_id, event_title, event_venue, event_city,
    event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale)
  values (v_buyer, e.id::text, e.title, e.venue, e.city, e.event_date::text, e.event_time,
    e.image, 'standard', p_seat_info, e.price,
    'TKT-' || replace(gen_random_uuid()::text, '-', ''), false)
  returning * into t;

  -- Guarded decrement: only succeeds while inventory remains; belt-and-suspenders
  -- with the row lock above and the CHECK(available_tickets >= 0) constraint.
  update public.events set available_tickets = available_tickets - 1
    where id = e.id and available_tickets > 0;
  if not found then raise exception 'sold out'; end if;

  insert into public.transactions(ticket_id, event_id, buyer_id, amount, type)
    values (t.id, e.id, v_buyer, e.price, 'primary');
  return t;
end $$;
grant execute on function public.purchase_ticket(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3.  RLS PII fixes
-- ---------------------------------------------------------------------------

-- Helper: is the caller a participant of this group? SECURITY DEFINER so it
-- bypasses RLS on group_participants and does NOT cause policy recursion.
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_participants
    where group_id = p_group_id and user_id = auth.uid()
  );
$$;
grant execute on function public.is_group_member(uuid) to authenticated;

-- group_participants: previously SELECT USING (true) to role public — that leaked
-- names / user_id / email / has_paid to anyone (incl. anon). Now restricted to
-- authenticated users who are either the row owner, a fellow participant of the
-- same group, or the group's organizer.
drop policy if exists gpart_read on public.group_participants;
create policy gpart_read on public.group_participants
  for select to authenticated using (
    user_id = auth.uid()
    or public.is_group_member(group_id)
    or exists (
      select 1 from public.group_purchases g
      where g.id = group_participants.group_id and g.organizer_id = auth.uid()
    )
  );

-- community_posts: previously SELECT USING (true) to role public, exposing the
-- raw user_id to anonymous readers. Restrict the raw table to authenticated, and
-- provide an anon-safe read path (below) that exposes display name only.
drop policy if exists cp_read on public.community_posts;
create policy cp_read on public.community_posts
  for select to authenticated using (true);

-- Anon-safe read path for the community board: returns the display name but never
-- the raw user_id. is_mine lets the client highlight the caller's own posts.
create or replace function public.get_community_posts(p_event_id uuid default null)
returns table (
  id uuid, event_id uuid, user_name text, type text, content text,
  created_at timestamptz, is_mine boolean
)
language sql stable security definer set search_path = public as $$
  select c.id, c.event_id, c.user_name, c.type, c.content, c.created_at,
         (c.user_id = auth.uid()) as is_mine
  from public.community_posts c
  where p_event_id is null or c.event_id = p_event_id
  order by c.created_at desc;
$$;
grant execute on function public.get_community_posts(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4.  Manager role as a real boundary
-- ---------------------------------------------------------------------------

-- events INSERT/UPDATE now require the caller to actually hold the 'manager' role
-- (in addition to owning the row via manager_id). has_role() reads auth.uid()
-- internally, so it checks the caller. Existing managers (manager@tickeasy.test,
-- etc.) keep their role and are unaffected.
drop policy if exists events_insert on public.events;
create policy events_insert on public.events
  for insert with check (
    auth.uid() = manager_id and public.has_role('manager'::public.app_role)
  );

drop policy if exists events_update on public.events;
create policy events_update on public.events
  for update
  using (auth.uid() = manager_id and public.has_role('manager'::public.app_role))
  with check (auth.uid() = manager_id and public.has_role('manager'::public.app_role));

-- Signup trigger: NEW users always get exactly role 'user', regardless of any
-- client-supplied metadata. (Previously 'manager' could be self-selected.) This
-- only affects rows inserted into auth.users AFTER this migration; existing
-- role assignments — including manager@tickeasy.test — are untouched.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name')
    on conflict (user_id) do nothing;
  -- Roles are never self-selected at signup. 'manager'/'admin' are granted
  -- out-of-band (see grant_manager below); everyone starts as 'user'.
  insert into public.user_roles (user_id, role)
    values (new.id, 'user'::public.app_role)
    on conflict (user_id, role) do nothing;
  return new;
end $$;

-- Admin-only RPC to promote a user to 'manager' (for future out-of-band use).
create or replace function public.grant_manager(target uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('admin'::public.app_role) then
    raise exception 'admin only';
  end if;
  insert into public.user_roles(user_id, role)
    values (target, 'manager'::public.app_role)
    on conflict (user_id, role) do nothing;
end $$;
revoke all on function public.grant_manager(uuid) from public;
grant execute on function public.grant_manager(uuid) to authenticated;
