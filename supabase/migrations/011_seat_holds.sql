-- 011_seat_holds.sql — Phase 2 seat holds: session-scoped seat locking with
-- lazy + swept expiry, live updates via Supabase Postgres Changes, and the
-- purchase RPC that converts a hold into real tickets. Idempotent /
-- re-runnable. SECURITY DEFINER, search_path = public. Mirrors 010's
-- advisory-lock + ticket-insert conventions and 006's guarded pg_cron
-- scheduling pattern. WRITE-ONLY: do NOT apply until reviewed — controller
-- applies to the live DB.
--
-- Contract summary (for the frontend agent, P2-B/P2-C):
--   hold_seats(p_event_id uuid, p_seat_ids uuid[]) -> timestamptz (hold expiry)
--   release_my_holds(p_event_id uuid)              -> int (seats released)
--   purchase_held_seats(p_event_id uuid)            -> setof tickets
-- Realtime: this project has no realtime.messages table / realtime.send()
-- function (broadcast-from-database is unavailable here), so live seat-status
-- updates ride Postgres Changes instead: every UPDATE to public.seats is
-- published automatically on the `supabase_realtime` publication (added
-- below). Clients subscribe per expanded section with
-- supabase.channel(...).on('postgres_changes', {event:'UPDATE', schema:'public',
-- table:'seats', filter:'section_id=eq.<id>'}, handler) and refetch once on
-- subscribe to cover any missed changes (best-effort). RLS (public SELECT on
-- seats) governs what each client receives.

-- ---------------------------------------------------------------------------
-- 1.  seats.status gains 'held' (drop + re-add the column check by name)
-- ---------------------------------------------------------------------------
alter table public.seats drop constraint if exists seats_status_check;
alter table public.seats add constraint seats_status_check
  check (status in ('available', 'held', 'sold'));

-- ---------------------------------------------------------------------------
-- 2.  seat_holds — private table. held_by / expiry NEVER touch the public
--     seats table; only the holder can read their own hold rows. No write
--     policies at all — the RPCs below (SECURITY DEFINER) are the only path.
-- ---------------------------------------------------------------------------
create table if not exists public.seat_holds (
  seat_id    uuid primary key references public.seats(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  event_id   uuid not null references public.events(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists seat_holds_expires_idx on public.seat_holds(expires_at);
create index if not exists seat_holds_user_event_idx on public.seat_holds(user_id, event_id);

alter table public.seat_holds enable row level security;

drop policy if exists seat_holds_read on public.seat_holds;
create policy seat_holds_read on public.seat_holds for select using (auth.uid() = user_id);
-- (no insert/update/delete policies — hold_seats/release_my_holds/
--  purchase_held_seats/release_expired_seat_holds are the only write path)

-- ---------------------------------------------------------------------------
-- 3.  hold_seats — atomic all-or-nothing claim of 1..6 seats for this event.
--     Re-selection replaces the caller's previous holds for the event in the
--     same transaction. Expired holds on the requested seats are reclaimed
--     inline (lazy reclaim) so correctness never depends on the sweeper.
-- ---------------------------------------------------------------------------
create or replace function public.hold_seats(p_event_id uuid, p_seat_ids uuid[])
returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_buyer         uuid := auth.uid();
  v_n             int;
  v_owned         int;
  v_active_holds  int;
  v_claimed       int;
  v_expires       timestamptz := now() + interval '10 minutes';
  v_released_ids  uuid[];
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;
  if p_seat_ids is null or array_length(p_seat_ids, 1) is null then
    raise exception 'no seats selected';
  end if;
  v_n := array_length(p_seat_ids, 1);
  if v_n < 1 or v_n > 6 then
    raise exception 'seat selection must be between 1 and 6';
  end if;
  if v_n <> (select count(distinct x) from unnest(p_seat_ids) x) then
    raise exception 'duplicate seat in selection';
  end if;

  -- Serialize this buyer's hold/purchase activity for this event (same
  -- pattern as 010's per-user/per-event advisory lock).
  perform pg_advisory_xact_lock(hashtext(p_event_id::text || v_buyer::text));

  -- Re-selection: release the caller's previous holds for this event first
  -- (seats -> available), in the same transaction as the new claim.
  select array_agg(seat_id) into v_released_ids
  from public.seat_holds where user_id = v_buyer and event_id = p_event_id;

  update public.seats set status = 'available'
    where id = any(coalesce(v_released_ids, array[]::uuid[])) and status = 'held';

  delete from public.seat_holds where user_id = v_buyer and event_id = p_event_id;

  -- Lazy reclaim: any of the NOW-requested seats still marked 'held' under an
  -- expired hold (someone else's lapsed session) become claimable inline.
  update public.seats s set status = 'available'
    from public.seat_holds h
    where h.seat_id = s.id and s.id = any(p_seat_ids) and h.expires_at < now()
      and s.status = 'held';

  delete from public.seat_holds
    where seat_id = any(p_seat_ids) and expires_at < now();

  -- Cap: caller's sold tickets for event + caller's ACTIVE holds (0, since we
  -- just released all of this event's holds above) + new selection <= 6.
  select count(*) into v_owned
  from public.tickets where user_id = v_buyer and event_id = p_event_id::text;

  select count(*) into v_active_holds
  from public.seat_holds
  where user_id = v_buyer and event_id = p_event_id and expires_at >= now();

  if v_owned + v_active_holds + v_n > 6 then
    raise exception 'purchase limit reached: max 6 tickets per event';
  end if;

  -- No-orphan: simulate the claim (requested seats -> 'held') and reject if
  -- any remaining available seat would have both numeric row-neighbors
  -- non-available. Row edges (no neighbor at seat_number ± 1) are exempt.
  if exists (
    with touched_rows as (
      select distinct section_id, row_label
      from public.seats where id = any(p_seat_ids)
    ),
    row_seats as (
      select s.section_id, s.row_label, s.seat_number,
             case when s.id = any(p_seat_ids) then 'held' else s.status end as sim_status
      from public.seats s
      join touched_rows tr
        on tr.section_id = s.section_id and tr.row_label = s.row_label
    )
    select 1
    from row_seats rs
    join row_seats l
      on l.section_id = rs.section_id and l.row_label = rs.row_label
      and l.seat_number = rs.seat_number - 1
    join row_seats r
      on r.section_id = rs.section_id and r.row_label = rs.row_label
      and r.seat_number = rs.seat_number + 1
    where rs.sim_status = 'available'
      and l.sim_status <> 'available'
      and r.sim_status <> 'available'
  ) then
    raise exception 'selection would strand a single seat';
  end if;

  -- Atomic claim: all-or-nothing. Row-level locking from this UPDATE is what
  -- actually arbitrates concurrent buyers targeting the same seat — whichever
  -- transaction's UPDATE commits first wins the row; the loser's predicate
  -- (status = 'available') re-evaluates false and it is excluded from the
  -- affected-row count below, tripping the exception and rolling back.
  update public.seats s set status = 'held'
    from public.venue_sections vs
    where s.id = any(p_seat_ids)
      and s.section_id = vs.id
      and vs.event_id = p_event_id
      and s.status = 'available';
  get diagnostics v_claimed = row_count;

  if v_claimed <> v_n then
    raise exception 'seats no longer available';
  end if;

  insert into public.seat_holds(seat_id, user_id, event_id, expires_at)
    select x, v_buyer, p_event_id, v_expires from unnest(p_seat_ids) x;

  -- No manual broadcast needed: the UPDATEs above (release of prior seats,
  -- atomic claim to 'held') are published automatically via Postgres Changes
  -- on the supabase_realtime publication (see bottom of file).

  return v_expires;
end $$;
grant execute on function public.hold_seats(uuid, uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- 4.  release_my_holds — explicit release (change seats / cancel / leave).
-- ---------------------------------------------------------------------------
create or replace function public.release_my_holds(p_event_id uuid)
returns int
language plpgsql security definer set search_path = public as $$
declare
  v_buyer    uuid := auth.uid();
  v_seat_ids uuid[];
  v_count    int;
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;

  perform pg_advisory_xact_lock(hashtext(p_event_id::text || v_buyer::text));

  select array_agg(seat_id) into v_seat_ids
  from public.seat_holds where user_id = v_buyer and event_id = p_event_id;

  if v_seat_ids is null or array_length(v_seat_ids, 1) is null then
    return 0;
  end if;

  update public.seats set status = 'available'
    where id = any(v_seat_ids) and status = 'held';

  delete from public.seat_holds where user_id = v_buyer and event_id = p_event_id;
  get diagnostics v_count = row_count;

  -- No manual broadcast needed: the UPDATE above is published automatically
  -- via Postgres Changes on the supabase_realtime publication.

  return v_count;
end $$;
grant execute on function public.release_my_holds(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5.  purchase_held_seats — converts the caller's active holds for this event
--     into real tickets. Mirrors 010's ticket-insert shape exactly.
-- ---------------------------------------------------------------------------
create or replace function public.purchase_held_seats(p_event_id uuid)
returns setof public.tickets
language plpgsql security definer set search_path = public as $$
declare
  e           public.events;
  v_seat      record;
  t           public.tickets;
  v_buyer     uuid := auth.uid();
  v_seat_ids  uuid[];
  v_count     int := 0;
  v_seat_info text;
  v_rows      int;
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;

  perform pg_advisory_xact_lock(hashtext(p_event_id::text || v_buyer::text));

  -- No FOR UPDATE here: each held seat is already exclusively owned via the
  -- atomic claim in hold_seats, so there is nothing left to serialize across
  -- buyers at finalize time (mirrors 010's purchase_section_seats, which
  -- locks only the section row and leans on the guarded decrement below).
  select * into e from public.events where id = p_event_id;
  if not found then raise exception 'event not found'; end if;

  -- Lazy reclaim of the caller's own expired holds: release those seats and
  -- drop the stale rows before checking what remains active.
  update public.seats s set status = 'available'
    from public.seat_holds h
    where h.seat_id = s.id and h.user_id = v_buyer and h.event_id = p_event_id
      and h.expires_at < now();

  delete from public.seat_holds
    where user_id = v_buyer and event_id = p_event_id and expires_at < now();

  select array_agg(seat_id) into v_seat_ids
  from public.seat_holds
  where user_id = v_buyer and event_id = p_event_id and expires_at >= now();

  if v_seat_ids is null or array_length(v_seat_ids, 1) is null then
    raise exception 'hold expired — reselect seats';
  end if;

  for v_seat in
    select s.id as seat_id, s.row_label, s.seat_number,
           vs.id as section_id, vs.label as section_label, vs.price as section_price
    from public.seats s
    join public.venue_sections vs on vs.id = s.section_id
    where s.id = any(v_seat_ids)
    order by s.row_label, s.seat_number
  loop
    v_seat_info := v_seat.section_label || ' · Row ' || v_seat.row_label || ' · Seat ' || v_seat.seat_number::text;

    insert into public.tickets(user_id, event_id, event_title, event_venue, event_city,
      event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale)
    values (v_buyer, e.id::text, e.title, e.venue, e.city, e.event_date::text, e.event_time,
      e.image, 'standard', v_seat_info, v_seat.section_price,
      'TKT-seat-' || substr(gen_random_uuid()::text, 1, 12), false)
    returning * into t;

    update public.seats set status = 'sold', ticket_id = t.id
      where id = v_seat.seat_id and status = 'held';
    get diagnostics v_rows = row_count;
    if v_rows <> 1 then
      raise exception 'hold expired — reselect seats';
    end if;

    insert into public.transactions(ticket_id, event_id, buyer_id, amount, type)
      values (t.id, e.id, v_buyer, v_seat.section_price, 'primary');

    update public.venue_sections set sold = sold + 1 where id = v_seat.section_id;

    v_count := v_count + 1;
    return next t;
  end loop;

  delete from public.seat_holds where seat_id = any(v_seat_ids);

  -- Guarded decrement: belt-and-suspenders with events_available_nonneg (005).
  update public.events set available_tickets = available_tickets - v_count
    where id = p_event_id and available_tickets >= v_count;
  if not found then raise exception 'sold out'; end if;

  -- No manual broadcast needed: the per-seat UPDATE above (status='sold') is
  -- published automatically via Postgres Changes on the supabase_realtime
  -- publication.

  return;
end $$;
grant execute on function public.purchase_held_seats(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6.  release_expired_seat_holds — sweeper, batched per event. The seats
--     UPDATE below is published automatically via Postgres Changes.
-- ---------------------------------------------------------------------------
create or replace function public.release_expired_seat_holds()
returns int
language plpgsql security definer set search_path = public as $$
declare
  r       record;
  v_total int := 0;
begin
  for r in
    select event_id, array_agg(seat_id) as seat_ids
    from public.seat_holds
    where expires_at < now()
    group by event_id
  loop
    update public.seats set status = 'available'
      where id = any(r.seat_ids) and status = 'held';

    v_total := v_total + coalesce(array_length(r.seat_ids, 1), 0);
  end loop;

  delete from public.seat_holds where expires_at < now();

  return v_total;
end $$;
grant execute on function public.release_expired_seat_holds() to authenticated;
revoke execute on function public.release_expired_seat_holds() from authenticated;

-- Guarded pg_cron scheduling (mirrors 006's conditional block): pg_cron may
-- be available-but-not-installed on this project; everything here is guarded
-- so the migration never fails if pg_cron cannot be enabled.
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
    begin execute $q$ select cron.unschedule('tickeasy_release_expired_holds') $q$;
    exception when others then null; end;
    execute $q$ select cron.schedule('tickeasy_release_expired_holds', '* * * * *',
                 $job$ select public.release_expired_seat_holds() $job$) $q$;
    raise notice 'scheduled tickeasy_release_expired_holds (every minute)';
  else
    raise notice 'pg_cron unavailable; skipping cron schedule for release_expired_seat_holds()';
  end if;
end $cron$;

-- ---------------------------------------------------------------------------
-- 7.  Live seat-status updates ride Postgres Changes: seats UPDATEs are
--     published on the supabase_realtime publication (this project has no
--     realtime.send / broadcast-from-database infrastructure). RLS (public
--     SELECT) governs receipt.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'seats'
  ) then
    alter publication supabase_realtime add table public.seats;
  end if;
end $$;
