
-- Remove all anon access to the base table
DROP POLICY IF EXISTS "Public can view listed tickets (safe columns)" ON public.tickets;
REVOKE ALL ON public.tickets FROM anon;

-- Drop the view; replace with a SECURITY DEFINER function returning only safe columns
DROP VIEW IF EXISTS public.tickets_for_sale;

CREATE OR REPLACE FUNCTION public.get_tickets_for_sale()
RETURNS TABLE (
  id uuid,
  event_id text,
  event_title text,
  event_date text,
  event_time text,
  event_venue text,
  event_city text,
  event_image text,
  ticket_type text,
  seat_info text,
  sale_price numeric,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, event_id, event_title, event_date, event_time, event_venue,
         event_city, event_image, ticket_type, seat_info, sale_price, created_at
  FROM public.tickets
  WHERE is_for_sale = true
$$;

REVOKE EXECUTE ON FUNCTION public.get_tickets_for_sale() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_tickets_for_sale() TO anon, authenticated;
