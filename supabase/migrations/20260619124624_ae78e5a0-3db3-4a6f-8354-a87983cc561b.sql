
-- Recreate view as security_invoker (caller-bound RLS + column grants)
DROP VIEW IF EXISTS public.tickets_for_sale;
CREATE VIEW public.tickets_for_sale
WITH (security_invoker = true) AS
SELECT
  id,
  event_id,
  event_title,
  event_date,
  event_time,
  event_venue,
  event_city,
  event_image,
  ticket_type,
  seat_info,
  sale_price,
  created_at
FROM public.tickets
WHERE is_for_sale = true;

GRANT SELECT ON public.tickets_for_sale TO anon, authenticated;

-- Column-level grants on the underlying table: anon can only read non-sensitive columns
REVOKE SELECT ON public.tickets FROM anon;
GRANT SELECT
  (id, event_id, event_title, event_date, event_time, event_venue, event_city,
   event_image, ticket_type, seat_info, sale_price, is_for_sale, created_at)
  ON public.tickets TO anon;

-- RLS policy: anon can only see rows marked for sale
CREATE POLICY "Public can view listed tickets (safe columns)"
ON public.tickets FOR SELECT
TO anon
USING (is_for_sale = true);
