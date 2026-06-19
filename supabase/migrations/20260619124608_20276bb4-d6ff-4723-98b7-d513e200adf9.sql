
DROP POLICY IF EXISTS "Public can view listed tickets" ON public.tickets;

-- Recreate the view without security_invoker so it can read tickets on behalf of anon
DROP VIEW IF EXISTS public.tickets_for_sale;
CREATE VIEW public.tickets_for_sale AS
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
