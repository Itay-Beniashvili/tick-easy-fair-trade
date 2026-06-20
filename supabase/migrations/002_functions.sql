-- 002_functions.sql — ownership transfer + group expiry

-- Atomic resale ownership transfer: enforces price cap server-side,
-- voids the old barcode, issues a new one, reassigns the owner, logs a transaction.
create or replace function public.transfer_ticket_ownership(
  p_ticket_id uuid, p_buyer_id uuid, p_buyer_name text
) returns public.tickets
language plpgsql security definer set search_path = public as $$
declare
  t public.tickets;
  v_event uuid;
begin
  select * into t from public.tickets where id = p_ticket_id for update;
  if not found then raise exception 'ticket not found'; end if;
  if t.is_for_sale is not true then raise exception 'ticket not for sale'; end if;
  if coalesce(t.sale_price, t.price) > t.price then
    raise exception 'resale price exceeds face value';
  end if;
  if t.user_id = p_buyer_id then raise exception 'cannot buy your own ticket'; end if;

  begin
    v_event := nullif(t.event_id, '')::uuid;
  exception when others then v_event := null;
  end;

  insert into public.transactions(ticket_id, event_id, seller_id, buyer_id, amount, type)
    values (t.id, v_event, t.user_id, p_buyer_id, coalesce(t.sale_price, t.price), 'resale');

  update public.tickets set
    user_id = p_buyer_id,
    qr_code = 'TKT-' || replace(gen_random_uuid()::text, '-', ''),
    is_for_sale = false,
    sale_price = null,
    purchase_date = now(),
    updated_at = now()
  where id = p_ticket_id
  returning * into t;

  return t;
end $$;
grant execute on function public.transfer_ticket_ownership(uuid, uuid, text) to authenticated;

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
