-- 009_group_ticket_minting.sql — complete_group_if_paid v3: mint real tickets
-- (and matching transactions) the moment a group flips to 'completed'.
-- Idempotent / re-runnable. SECURITY DEFINER, search_path = public.
-- WRITE-ONLY: do NOT apply until reviewed — controller applies to the live DB.

-- ---------------------------------------------------------------------------
-- 1.  Re-entry guard: tickets_minted flags a group whose tickets have already
--     been minted, so re-invoking complete_group_if_paid (e.g. a second
--     pay_participant call racing this one) never double-mints.
-- ---------------------------------------------------------------------------
alter table public.group_purchases
  add column if not exists tickets_minted boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2.  complete_group_if_paid v3 — mints tickets + transactions atomically when
--     the group completes. Mirrors purchase_ticket's (005) tickets/transactions
--     insert shapes exactly so minted tickets behave identically in Wallet/QR/etc.
-- ---------------------------------------------------------------------------
create or replace function public.complete_group_if_paid(p_group_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare
  g        public.group_purchases;
  e        public.events;
  v_paid   int;
  v_needed int;
  part     record;
  i        int;
  t        public.tickets;
begin
  -- Lock the group row: serializes concurrent completion attempts for this group.
  select * into g from public.group_purchases where id = p_group_id for update;
  if not found then
    return null;
  end if;

  select coalesce(sum(ticket_count) filter (where has_paid), 0) into v_paid
    from public.group_participants where group_id = p_group_id;

  if v_paid >= g.total_tickets then
    update public.group_purchases set status = 'completed'
      where id = p_group_id and status = 'active';
  end if;

  -- Re-fetch after the possible status flip above.
  select * into g from public.group_purchases where id = p_group_id;

  if g.status = 'completed' and not g.tickets_minted then
    -- Lock the event row: serializes concurrent inventory decrements.
    select * into e from public.events where id = g.event_id for update;
    if not found then raise exception 'event not found'; end if;

    -- Inventory needed = sum of ticket_count across PAID participants that have
    -- a real user_id (unauthenticated / placeholder participants get no ticket).
    select coalesce(sum(ticket_count), 0) into v_needed
      from public.group_participants
      where group_id = p_group_id and has_paid and user_id is not null;

    if e.available_tickets < v_needed then
      raise exception 'not enough inventory to complete group';
    end if;

    for part in
      select user_id, ticket_count from public.group_participants
      where group_id = p_group_id and has_paid and user_id is not null
    loop
      for i in 1..part.ticket_count loop
        insert into public.tickets(user_id, event_id, event_title, event_venue, event_city,
          event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale)
        values (part.user_id, e.id::text, e.title, e.venue, e.city, e.event_date::text, e.event_time,
          e.image, 'standard', 'General Admission (group)', g.price_per_ticket,
          'TKT-grp-' || substr(gen_random_uuid()::text, 1, 12), false)
        returning * into t;

        insert into public.transactions(ticket_id, event_id, buyer_id, amount, type)
          values (t.id, e.id, part.user_id, g.price_per_ticket, 'primary');
      end loop;
    end loop;

    -- Guarded decrement: only succeeds while inventory remains; belt-and-suspenders
    -- with the row lock above and events' CHECK(available_tickets >= 0) constraint.
    update public.events set available_tickets = available_tickets - v_needed
      where id = e.id and available_tickets >= v_needed;
    if not found then raise exception 'not enough inventory to complete group'; end if;

    update public.group_purchases set tickets_minted = true where id = p_group_id;
  end if;

  return (select status from public.group_purchases where id = p_group_id);
end $$;
grant execute on function public.complete_group_if_paid(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3.  pay_participant now delegates the completion check to
--     complete_group_if_paid instead of duplicating it (006 inlined its own
--     "paid >= total -> status='completed'" flip). pay_participant is the only
--     caller that actually completes a group in the live app (the payment
--     flow), so without this delegation the v3 minting logic above would never
--     fire from real usage. Behavior/signature unchanged from the client's
--     point of view: same args, same 'active'/'completed' return contract.
-- ---------------------------------------------------------------------------
create or replace function public.pay_participant(p_group_id uuid)
returns text
language plpgsql security definer set search_path = public as $$
declare
  g       public.group_purchases;
  v_user  uuid := auth.uid();
  v_is    boolean;
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

  -- complete_group_if_paid re-checks paid >= total, flips status, and mints
  -- tickets in one atomic step. The FOR UPDATE lock above is re-entrant within
  -- this same transaction, so its own row lock on group_purchases doesn't block.
  return public.complete_group_if_paid(p_group_id);
end $$;
grant execute on function public.pay_participant(uuid) to authenticated;
