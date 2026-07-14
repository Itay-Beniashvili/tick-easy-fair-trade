-- 010_seating_schema.sql — Phase 1 seating: venue_sections + seats schema and
-- the two RPCs that create sections (manager) and buy seats within a section
-- (buyer). Idempotent / re-runnable. SECURITY DEFINER, search_path = public.
-- WRITE-ONLY: do NOT apply until reviewed — controller applies to the live DB.
--
-- Contract summary (for the frontend agent, S3/S4):
--   create_event_sections(p_event_id uuid, p_sections jsonb) -> int (section count)
--   purchase_section_seats(p_event_id uuid, p_section_id uuid, p_quantity int)
--     -> setof tickets (the minted ticket rows, with real seat_info labels)
-- purchase_ticket (005) is untouched — events WITHOUT sections keep today's
-- flat GA flow unchanged.

-- ---------------------------------------------------------------------------
-- 1.  Tables
-- ---------------------------------------------------------------------------
create table if not exists public.venue_sections (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  label text not null,                 -- translatable display label
  kind text not null default 'seated' check (kind in ('seated','ga')),
  price numeric not null check (price >= 0),
  capacity int not null check (capacity > 0),
  sold int not null default 0 check (sold >= 0),
  color text not null default 'var(--music)',   -- gel token for tinting
  geometry jsonb not null,             -- {points:[[x,y],...]} normalized 0-100 polygon
  rows_count int,                      -- seated only: parametric grid params
  seats_per_row int,
  sort int not null default 0
);
create index if not exists venue_sections_event_idx on public.venue_sections(event_id);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.venue_sections(id) on delete cascade,
  row_label text not null,
  seat_number int not null,
  x real, y real,                      -- baked position (P2 uses; generated now)
  status text not null default 'available' check (status in ('available','sold')),  -- 'held' arrives in P2
  ticket_id uuid references public.tickets(id) on delete set null,
  unique (section_id, row_label, seat_number)
);
create index if not exists seats_section_status_idx on public.seats(section_id, status);

-- ---------------------------------------------------------------------------
-- 2.  RLS — public SELECT (availability is public info; ticket_id is an
--     opaque uuid, no buyer identity leaks — tickets has its own RLS). No
--     insert/update/delete policies: the two RPCs below are the only write
--     path (SECURITY DEFINER bypasses RLS).
-- ---------------------------------------------------------------------------
alter table public.venue_sections enable row level security;
alter table public.seats enable row level security;

drop policy if exists venue_sections_read on public.venue_sections;
create policy venue_sections_read on public.venue_sections for select using (true);

drop policy if exists seats_read on public.seats;
create policy seats_read on public.seats for select using (true);

-- ---------------------------------------------------------------------------
-- 3.  create_event_sections — manager-only, one-time section+seat generation
--     for an event. Sections become the source of truth for inventory: this
--     sets events.total_tickets/available_tickets = sum(capacity).
-- ---------------------------------------------------------------------------
create or replace function public.create_event_sections(p_event_id uuid, p_sections jsonb)
returns int
language plpgsql security definer set search_path = public as $$
declare
  e                 public.events;
  sec               jsonb;
  v_label           text;
  v_kind            text;
  v_price           numeric;
  v_capacity        int;
  v_color           text;
  v_geometry        jsonb;
  v_rows_count      int;
  v_seats_per_row   int;
  v_section_id      uuid;
  v_row_idx         int;
  v_seat_idx        int;
  v_row_label       text;
  v_x               real;
  v_y               real;
  v_seats_generated int;
  v_sort            int := 0;
  v_count           int := 0;
  v_total_capacity  int := 0;
begin
  -- Lock the event row: serializes concurrent section-creation attempts and
  -- guards the total_tickets/available_tickets write at the end.
  select * into e from public.events where id = p_event_id for update;
  if not found then raise exception 'event not found'; end if;
  if e.manager_id <> auth.uid() then
    raise exception 'not authorized: caller is not this event''s manager';
  end if;

  if p_sections is null or jsonb_typeof(p_sections) <> 'array' or jsonb_array_length(p_sections) = 0 then
    raise exception 'p_sections must be a non-empty jsonb array';
  end if;

  if exists (select 1 from public.venue_sections where event_id = p_event_id) then
    raise exception 'event already has sections';
  end if;

  for sec in select * from jsonb_array_elements(p_sections)
  loop
    v_label         := sec->>'label';
    v_kind          := coalesce(sec->>'kind', 'seated');
    v_price         := (sec->>'price')::numeric;
    v_capacity      := (sec->>'capacity')::int;
    v_color         := coalesce(sec->>'color', 'var(--music)');
    v_geometry      := sec->'geometry';
    v_rows_count    := nullif(sec->>'rows_count', '')::int;
    v_seats_per_row := nullif(sec->>'seats_per_row', '')::int;

    if v_label is null or length(trim(v_label)) = 0 then
      raise exception 'section label is required';
    end if;
    if v_kind not in ('seated', 'ga') then
      raise exception 'invalid section kind: %', v_kind;
    end if;
    if v_price is null or v_price < 0 then
      raise exception 'invalid section price for %', v_label;
    end if;
    if v_capacity is null or v_capacity <= 0 then
      raise exception 'invalid section capacity for %', v_label;
    end if;
    if v_geometry is null then
      raise exception 'section geometry is required for %', v_label;
    end if;

    if v_kind = 'seated' then
      if v_rows_count is null or v_rows_count <= 0
        or v_seats_per_row is null or v_seats_per_row <= 0 then
        raise exception 'seated section % requires rows_count and seats_per_row', v_label;
      end if;
      if v_rows_count * v_seats_per_row < v_capacity then
        raise exception 'rows_count * seats_per_row must be >= capacity for section %', v_label;
      end if;
    end if;

    insert into public.venue_sections(event_id, label, kind, price, capacity, color, geometry,
      rows_count, seats_per_row, sort)
    values (p_event_id, v_label, v_kind, v_price, v_capacity, v_color, v_geometry,
      v_rows_count, v_seats_per_row, v_sort)
    returning id into v_section_id;

    if v_kind = 'seated' then
      -- Deterministic grid: row labels 'A','B',...; seat_number 1..seats_per_row.
      -- x spread evenly across [10,90] per seats_per_row, y evenly per rows_count.
      -- Generation is capped at capacity seats total — the last row may be
      -- partial (or later rows skipped entirely) when rows*cols > capacity.
      v_seats_generated := 0;
      <<row_loop>>
      for v_row_idx in 0..v_rows_count - 1 loop
        exit row_loop when v_seats_generated >= v_capacity;
        v_row_label := chr(65 + v_row_idx); -- 'A', 'B', ...
        v_y := case when v_rows_count > 1
                 then 10 + v_row_idx * (80.0 / (v_rows_count - 1))
                 else 50 end;
        for v_seat_idx in 1..v_seats_per_row loop
          exit row_loop when v_seats_generated >= v_capacity;
          v_x := case when v_seats_per_row > 1
                   then 10 + (v_seat_idx - 1) * (80.0 / (v_seats_per_row - 1))
                   else 50 end;
          insert into public.seats(section_id, row_label, seat_number, x, y, status)
          values (v_section_id, v_row_label, v_seat_idx, v_x, v_y, 'available');
          v_seats_generated := v_seats_generated + 1;
        end loop;
      end loop;
    end if;

    v_total_capacity := v_total_capacity + v_capacity;
    v_count := v_count + 1;
    v_sort := v_sort + 1;
  end loop;

  -- Sections become the source of truth for inventory. Guarded: the event row
  -- is already locked above, so this must find the row; the explicit check
  -- keeps the guarded-write convention consistent with the rest of the schema.
  update public.events set total_tickets = v_total_capacity, available_tickets = v_total_capacity
    where id = p_event_id;
  if not found then raise exception 'event not found during section commit'; end if;

  return v_count;
end $$;
grant execute on function public.create_event_sections(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 4.  purchase_section_seats — buyer-facing purchase within a section.
--     Seated: picks a no-orphan contiguous block (falls back to any available
--     seats if no clean block exists). GA: skips seat picking, just moves the
--     capacity/sold counters. Mints real tickets rows (setof tickets) so the
--     client gets the minted tickets with real seat_info labels directly.
-- ---------------------------------------------------------------------------
create or replace function public.purchase_section_seats(p_event_id uuid, p_section_id uuid, p_quantity int)
returns setof public.tickets
language plpgsql security definer set search_path = public as $$
declare
  e            public.events;
  s            public.venue_sections;
  t            public.tickets;
  v_buyer      uuid := auth.uid();
  v_owned      int;
  v_i          int;
  v_row_label  text;
  v_run_start  int;
  v_seat_ids   uuid[];
  v_seat_id    uuid;
  v_seat_row   text;
  v_seat_num   int;
  v_seat_info  text;
  -- Documented cap: same policy as purchase_ticket (005) — at most this many
  -- tickets per user, per event, on the primary market, across all sections.
  c_cap        constant int := 6;
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;
  if p_quantity is null or p_quantity < 1 or p_quantity > 6 then
    raise exception 'quantity must be between 1 and 6';
  end if;

  -- Lock the section row: serializes concurrent buyers within this section
  -- (kills the oversell race and makes the seat-picking scan below safe).
  select * into s from public.venue_sections
    where id = p_section_id and event_id = p_event_id for update;
  if not found then raise exception 'section not found'; end if;

  select * into e from public.events where id = p_event_id;
  if not found then raise exception 'event not found'; end if;

  -- Serialize this buyer's purchases for this event so the per-user cap
  -- cannot be bypassed by concurrent purchases in different sections.
  perform pg_advisory_xact_lock(hashtext(p_event_id::text || v_buyer::text));

  -- Per-user / per-event cap across ALL of the event's tickets (mirrors 005's
  -- purchase_ticket cap; seated purchases count toward the same limit).
  select count(*) into v_owned
  from public.tickets
  where user_id = v_buyer and event_id = e.id::text;
  if v_owned + p_quantity > c_cap then
    raise exception 'purchase limit reached: max % tickets per event', c_cap;
  end if;

  if s.capacity - s.sold < p_quantity then
    raise exception 'not enough seats remaining in section';
  end if;

  if s.kind = 'seated' then
    -- Enumerate maximal runs of consecutive available seat_numbers per row
    -- (gaps-and-islands via seat_number - row_number()), then choose the
    -- first run where run_length == p_quantity or run_length >= p_quantity+2
    -- — never run_length == p_quantity+1, which would strand exactly one
    -- seat as an orphan.
    with avail as (
      select row_label, seat_number,
             seat_number - row_number() over (partition by row_label order by seat_number) as grp
      from public.seats
      where section_id = p_section_id and status = 'available'
    ),
    runs as (
      select row_label, min(seat_number) as run_start, count(*) as run_length
      from avail
      group by row_label, grp
    )
    select row_label, run_start into v_row_label, v_run_start
    from runs
    where run_length = p_quantity or run_length >= p_quantity + 2
    order by row_label, run_start
    limit 1;

    if v_row_label is not null then
      select array_agg(id order by seat_number) into v_seat_ids
      from public.seats
      where section_id = p_section_id and row_label = v_row_label
        and seat_number >= v_run_start and seat_number < v_run_start + p_quantity
        and status = 'available';
    end if;

    if v_seat_ids is null or array_length(v_seat_ids, 1) <> p_quantity then
      -- Fallback: no clean block anywhere in the section — take any
      -- p_quantity available seats ordered by row_label, seat_number.
      select array_agg(id) into v_seat_ids
      from (
        select id from public.seats
        where section_id = p_section_id and status = 'available'
        order by row_label, seat_number
        limit p_quantity
      ) fallback;
    end if;

    if v_seat_ids is null or array_length(v_seat_ids, 1) <> p_quantity then
      raise exception 'not enough seats available in section';
    end if;

    foreach v_seat_id in array v_seat_ids loop
      select row_label, seat_number into v_seat_row, v_seat_num
      from public.seats where id = v_seat_id;
      v_seat_info := s.label || ' · Row ' || v_seat_row || ' · Seat ' || v_seat_num::text;

      insert into public.tickets(user_id, event_id, event_title, event_venue, event_city,
        event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale)
      values (v_buyer, e.id::text, e.title, e.venue, e.city, e.event_date::text, e.event_time,
        e.image, 'standard', v_seat_info, s.price,
        'TKT-seat-' || substr(gen_random_uuid()::text, 1, 12), false)
      returning * into t;

      update public.seats set status = 'sold', ticket_id = t.id where id = v_seat_id;

      insert into public.transactions(ticket_id, event_id, buyer_id, amount, type)
        values (t.id, e.id, v_buyer, s.price, 'primary');

      return next t;
    end loop;
  else
    -- GA section: no seat rows involved — just capacity/sold counters below.
    for v_i in 1..p_quantity loop
      insert into public.tickets(user_id, event_id, event_title, event_venue, event_city,
        event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale)
      values (v_buyer, e.id::text, e.title, e.venue, e.city, e.event_date::text, e.event_time,
        e.image, 'standard', s.label, s.price,
        'TKT-ga-' || substr(gen_random_uuid()::text, 1, 12), false)
      returning * into t;

      insert into public.transactions(ticket_id, event_id, buyer_id, amount, type)
        values (t.id, e.id, v_buyer, s.price, 'primary');

      return next t;
    end loop;
  end if;

  update public.venue_sections set sold = sold + p_quantity where id = s.id;

  -- Guarded decrement: only succeeds while inventory remains; belt-and-
  -- suspenders with the section-row lock above and events'
  -- events_available_nonneg CHECK (005).
  update public.events set available_tickets = available_tickets - p_quantity
    where id = p_event_id and available_tickets >= p_quantity;
  if not found then raise exception 'sold out'; end if;

  return;
end $$;
grant execute on function public.purchase_section_seats(uuid, uuid, int) to authenticated;

-- ---------------------------------------------------------------------------
-- 5.  purchase_ticket guard — 010 supersedes 005's purchase_ticket ONLY to add
--     a guard against the flat GA purchase path being used on events that have
--     been split into sections. Everything else below is byte-for-byte the
--     live 005 definition (same signature, body, and grant) so events WITHOUT
--     sections keep today's flat GA flow unchanged, per the file header above.
-- ---------------------------------------------------------------------------
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

  if exists (select 1 from public.venue_sections vs where vs.event_id = p_event_id) then
    raise exception 'this event uses seated sections — purchase through a section';
  end if;

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
