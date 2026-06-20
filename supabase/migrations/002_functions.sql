-- 002_functions.sql — ownership transfer + group lifecycle

-- Drop the old, insecure signature (buyer id was caller-supplied).
drop function if exists public.transfer_ticket_ownership(uuid, uuid, text);

-- Atomic resale ownership transfer. The buyer is ALWAYS the authenticated caller
-- (auth.uid()) — never a caller-supplied id — so a user can only buy for themselves.
-- Enforces the price cap server-side, voids the old barcode, issues a new one,
-- reassigns the owner, and logs a transaction. Payment is simulated (per project scope).
create or replace function public.transfer_ticket_ownership(
  p_ticket_id uuid, p_buyer_name text
) returns public.tickets
language plpgsql security definer set search_path = public as $$
declare
  t public.tickets;
  v_event uuid;
  v_buyer uuid := auth.uid();
begin
  if v_buyer is null then raise exception 'not authenticated'; end if;

  select * into t from public.tickets where id = p_ticket_id for update;
  if not found then raise exception 'ticket not found'; end if;
  if t.is_for_sale is not true then raise exception 'ticket not for sale'; end if;
  if coalesce(t.sale_price, t.price) > t.price then
    raise exception 'resale price exceeds face value';
  end if;
  if t.user_id = v_buyer then raise exception 'cannot buy your own ticket'; end if;

  begin
    v_event := nullif(t.event_id, '')::uuid;
  exception when others then v_event := null;
  end;

  insert into public.transactions(ticket_id, event_id, seller_id, buyer_id, amount, type)
    values (t.id, v_event, t.user_id, v_buyer, coalesce(t.sale_price, t.price), 'resale');

  update public.tickets set
    user_id = v_buyer,
    qr_code = 'TKT-' || replace(gen_random_uuid()::text, '-', ''),
    is_for_sale = false,
    sale_price = null,
    purchase_date = now(),
    updated_at = now()
  where id = p_ticket_id
  returning * into t;

  return t;
end $$;
grant execute on function public.transfer_ticket_ownership(uuid, text) to authenticated;

-- Cancel any active group whose reservation window has elapsed.
create or replace function public.cancel_expired_groups() returns int
language sql security definer set search_path = public as $$
  with upd as (
    update public.group_purchases set status = 'cancelled'
    where status = 'active' and expires_at < now()
    returning 1
  ) select count(*)::int from upd;
$$;
grant execute on function public.cancel_expired_groups() to authenticated;

-- Mark a group 'completed' iff every participant has paid. Callable by any member,
-- but only flips status when the paid condition is truly met (so it can't be forced).
create or replace function public.complete_group_if_paid(p_group_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare v_unpaid int; v_status text;
begin
  select count(*) into v_unpaid from public.group_participants
    where group_id = p_group_id and has_paid = false;
  if v_unpaid = 0 then
    update public.group_purchases set status = 'completed'
      where id = p_group_id and status = 'active';
  end if;
  select status into v_status from public.group_purchases where id = p_group_id;
  return v_status;
end $$;
grant execute on function public.complete_group_if_paid(uuid) to authenticated;
