-- 004_ticket_rpcs.sql — make ticket creation & resale-listing server-authoritative.
-- The client may no longer insert/update tickets directly; all writes go through
-- SECURITY DEFINER functions that copy authoritative values from public.events
-- and enforce the price cap. This prevents free-ticket minting and price tampering.

-- Primary purchase: price + event fields come from the server, not the client.
create or replace function public.purchase_ticket(p_event_id uuid, p_seat_info text)
returns public.tickets
language plpgsql security definer set search_path = public as $$
declare e public.events; t public.tickets; v_buyer uuid := auth.uid();
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;
  select * into e from public.events where id = p_event_id;
  if not found then raise exception 'event not found'; end if;
  if e.available_tickets <= 0 then raise exception 'sold out'; end if;
  insert into public.tickets(user_id, event_id, event_title, event_venue, event_city,
    event_date, event_time, event_image, ticket_type, seat_info, price, qr_code, is_for_sale)
  values (v_buyer, e.id::text, e.title, e.venue, e.city, e.event_date::text, e.event_time,
    e.image, 'standard', p_seat_info, e.price,
    'TKT-' || replace(gen_random_uuid()::text, '-', ''), false)
  returning * into t;
  update public.events set available_tickets = available_tickets - 1 where id = e.id;
  insert into public.transactions(ticket_id, event_id, buyer_id, amount, type)
    values (t.id, e.id, v_buyer, e.price, 'primary');
  return t;
end $$;
grant execute on function public.purchase_ticket(uuid, text) to authenticated;

-- List own ticket for resale; cap enforced against the ticket's true face value.
create or replace function public.list_ticket_for_resale(p_ticket_id uuid, p_price numeric)
returns public.tickets
language plpgsql security definer set search_path = public as $$
declare t public.tickets;
begin
  select * into t from public.tickets where id = p_ticket_id for update;
  if not found then raise exception 'ticket not found'; end if;
  if t.user_id <> auth.uid() then raise exception 'not your ticket'; end if;
  if p_price > t.price then raise exception 'resale price exceeds face value'; end if;
  if p_price <= 0 then raise exception 'invalid price'; end if;
  update public.tickets set is_for_sale = true, sale_price = p_price, updated_at = now()
    where id = p_ticket_id returning * into t;
  return t;
end $$;
grant execute on function public.list_ticket_for_resale(uuid, numeric) to authenticated;

create or replace function public.unlist_ticket(p_ticket_id uuid)
returns public.tickets
language plpgsql security definer set search_path = public as $$
declare t public.tickets;
begin
  select * into t from public.tickets where id = p_ticket_id for update;
  if not found then raise exception 'ticket not found'; end if;
  if t.user_id <> auth.uid() then raise exception 'not your ticket'; end if;
  update public.tickets set is_for_sale = false, sale_price = null, updated_at = now()
    where id = p_ticket_id returning * into t;
  return t;
end $$;
grant execute on function public.unlist_ticket(uuid) to authenticated;

-- Remove direct client write access to tickets (RPCs above are the only writers).
drop policy if exists tickets_ins on public.tickets;
drop policy if exists tickets_upd on public.tickets;
