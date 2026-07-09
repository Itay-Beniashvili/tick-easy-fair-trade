-- 006_group_buy_overhaul.sql — full group-buy fix. WRITE-ONLY: do NOT apply until
-- the client is wired to the new RPCs. Idempotent / re-runnable. All SECURITY
-- DEFINER functions set search_path = public.
--
-- Contract summary (for the frontend agent):
--   join_group(p_group_id uuid, p_ticket_count int)  -> group_participants row
--   pay_participant(p_group_id uuid)                 -> text (group status after)
--   complete_group_if_paid(p_group_id uuid)          -> text (group status)
--   get_tickets_for_sale()                           -> now includes is_mine boolean
-- Direct client INSERT/UPDATE on group_participants is REVOKED — the RPCs are the
-- only write path (they are SECURITY DEFINER and bypass RLS).

-- ---------------------------------------------------------------------------
-- 1.  Lock down group_participants writes (has_paid can no longer be set directly)
-- ---------------------------------------------------------------------------
-- Remove the policies that let a client INSERT a participant or UPDATE has_paid.
-- All writes now go exclusively through join_group / pay_participant below.
drop policy if exists gpart_write  on public.group_participants;
drop policy if exists gpart_update on public.group_participants;
-- (gpart_read from 005 stays: authenticated owner / fellow member / organizer.)

-- ---------------------------------------------------------------------------
-- 2.  join_group — server-authoritative join, respects stored total_tickets
-- ---------------------------------------------------------------------------
create or replace function public.join_group(p_group_id uuid, p_ticket_count int)
returns public.group_participants
language plpgsql security definer set search_path = public as $$
declare
  g        public.group_purchases;
  v_user   uuid := auth.uid();
  v_sum    int;
  v_name   text;
  v_email  text;
  part     public.group_participants;
begin
  if v_user is null then raise exception 'not authenticated'; end if;
  if p_ticket_count is null or p_ticket_count < 1 then
    raise exception 'ticket_count must be >= 1';
  end if;

  -- Lock the group row so concurrent joins can't collectively oversell.
  select * into g from public.group_purchases where id = p_group_id for update;
  if not found then raise exception 'group not found'; end if;
  if g.status <> 'active' then raise exception 'group is not active'; end if;
  if g.expires_at <= now() then raise exception 'group has expired'; end if;

  -- Capacity: sum of ALL current participant ticket_counts + this request
  -- must not exceed the group's stored total_tickets (never a hardcoded 4).
  select coalesce(sum(ticket_count), 0) into v_sum
  from public.group_participants where group_id = p_group_id;
  if v_sum + p_ticket_count > g.total_tickets then
    raise exception 'not enough seats left: % of % taken', v_sum, g.total_tickets;
  end if;

  -- Display name / email for the participant row (name is NOT NULL).
  select full_name, email into v_name, v_email
  from public.profiles where user_id = v_user;
  v_name := coalesce(nullif(v_name, ''), v_email, 'Member');

  -- One row per user per group: top up an existing row, else insert a new one.
  select * into part from public.group_participants
    where group_id = p_group_id and user_id = v_user
    for update;
  if found then
    update public.group_participants
      set ticket_count = ticket_count + p_ticket_count
      where id = part.id
      returning * into part;
  else
    insert into public.group_participants(group_id, user_id, name, email, ticket_count, has_paid)
      values (p_group_id, v_user, v_name, v_email, p_ticket_count, false)
      returning * into part;
  end if;

  return part;
end $$;
grant execute on function public.join_group(uuid, int) to authenticated;

-- ---------------------------------------------------------------------------
-- 3.  pay_participant — mark the caller paid, complete the group if fully paid
-- ---------------------------------------------------------------------------
create or replace function public.pay_participant(p_group_id uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  g       public.group_purchases;
  v_user  uuid := auth.uid();
  v_is    boolean;
  v_paid  int;
begin
  if v_user is null then raise exception 'not authenticated'; end if;

  select * into g from public.group_purchases where id = p_group_id for update;
  if not found then raise exception 'group not found'; end if;
  if g.status <> 'active' then raise exception 'group is not active'; end if;
  if g.expires_at <= now() then raise exception 'group has expired'; end if;

  -- Caller must be a participant of this group.
  select exists (
    select 1 from public.group_participants
    where group_id = p_group_id and user_id = v_user
  ) into v_is;
  if not v_is then raise exception 'not a participant of this group'; end if;

  update public.group_participants
    set has_paid = true
    where group_id = p_group_id and user_id = v_user;

  -- Complete the group only when the PAID ticket_count reaches total_tickets.
  select coalesce(sum(ticket_count) filter (where has_paid), 0) into v_paid
  from public.group_participants where group_id = p_group_id;
  if v_paid >= g.total_tickets then
    update public.group_purchases set status = 'completed'
      where id = p_group_id and status = 'active';
  end if;

  return (select status from public.group_purchases where id = p_group_id);
end $$;
grant execute on function public.pay_participant(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4.  complete_group_if_paid — same paid-ticket_count >= total_tickets rule
-- ---------------------------------------------------------------------------
create or replace function public.complete_group_if_paid(p_group_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare v_paid int; v_total int; v_status text;
begin
  select total_tickets into v_total from public.group_purchases where id = p_group_id;
  select coalesce(sum(ticket_count) filter (where has_paid), 0) into v_paid
    from public.group_participants where group_id = p_group_id;
  if v_total is not null and v_paid >= v_total then
    update public.group_purchases set status = 'completed'
      where id = p_group_id and status = 'active';
  end if;
  select status into v_status from public.group_purchases where id = p_group_id;
  return v_status;
end $$;
grant execute on function public.complete_group_if_paid(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5.  Server-side expiry sweep (pg_cron if available)
-- ---------------------------------------------------------------------------
-- cancel_expired_groups() already exists (002). Try to schedule it every minute.
-- pg_cron may be available-but-not-installed on this project; everything here is
-- guarded so the migration never fails if pg_cron cannot be enabled.
do $cron$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    begin
      create extension if not exists pg_cron;
    exception when others then
      raise notice 'pg_cron present but not installable here: %', sqlerrm;
    end;
  end if;

  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Replace any prior schedule of the same name, then (re)create it.
    begin execute $q$ select cron.unschedule('tickeasy_cancel_expired_groups') $q$;
    exception when others then null; end;
    execute $q$ select cron.schedule('tickeasy_cancel_expired_groups', '* * * * *',
                 $job$ select public.cancel_expired_groups() $job$) $q$;
    raise notice 'scheduled tickeasy_cancel_expired_groups (every minute)';
  else
    raise notice 'pg_cron unavailable; skipping cron schedule for cancel_expired_groups()';
  end if;
end $cron$;

-- ---------------------------------------------------------------------------
-- 6.  get_tickets_for_sale — add server-computed is_mine (no raw user_id exposed)
-- ---------------------------------------------------------------------------
drop function if exists public.get_tickets_for_sale();
create or replace function public.get_tickets_for_sale()
returns table (
  id uuid, event_id text, event_title text, event_venue text, event_city text,
  event_date text, event_time text, event_image text, ticket_type text,
  seat_info text, sale_price numeric, created_at timestamptz, is_mine boolean
)
language sql stable security definer set search_path = public as $$
  select id, event_id, event_title, event_venue, event_city, event_date,
         event_time, event_image, ticket_type, seat_info, sale_price, created_at,
         (user_id = auth.uid()) as is_mine
  from public.tickets where is_for_sale = true;
$$;
grant execute on function public.get_tickets_for_sale() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7.  Backfill primary transactions for seeded sold inventory (idempotent)
-- ---------------------------------------------------------------------------
-- Analytics/Dashboard sum public.transactions. A freshly-seeded DB (003) has no
-- transactions, so Analytics reads zero. Insert one 'primary' transaction per
-- sold seat (total_tickets - available_tickets) for each seeded event, using a
-- deterministic id so re-runs never duplicate. buyer_id is set to the event's
-- manager purely to satisfy NOT NULL; only amount/event_id/type feed analytics.
insert into public.transactions (id, ticket_id, event_id, buyer_id, amount, type)
select md5('seed-primary-' || e.id::text || '-' || g)::uuid,
       null, e.id, e.manager_id, e.price, 'primary'
from public.events e
cross join lateral generate_series(1, greatest(e.total_tickets - e.available_tickets, 0)) as g
where e.id::text like '10000000-0000-4000-8000-%'
on conflict (id) do nothing;
