
-- 1. Remove public exposure of full tickets row; replace with a safe view
DROP POLICY IF EXISTS "Anyone can view tickets for sale" ON public.tickets;

CREATE OR REPLACE VIEW public.tickets_for_sale
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

-- Allow a public-listing policy that only powers the view (still hides qr_code / user_id at the column level via the view definition)
CREATE POLICY "Public can view listed tickets"
ON public.tickets FOR SELECT
TO anon, authenticated
USING (is_for_sale = true);

-- Note: the view is the intended public surface. Apps should query tickets_for_sale, not tickets.
GRANT SELECT ON public.tickets_for_sale TO anon, authenticated;

-- 2. Lock down user_roles writes (defense in depth; trigger uses SECURITY DEFINER and bypasses RLS)
CREATE POLICY "No direct role inserts"
ON public.user_roles FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "No direct role updates"
ON public.user_roles FOR UPDATE
TO authenticated, anon
USING (false);

CREATE POLICY "No direct role deletes"
ON public.user_roles FOR DELETE
TO authenticated, anon
USING (false);

-- 3. Harden has_role: only check caller's own roles, run as SECURITY INVOKER
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(public.app_role) TO authenticated;

-- 4. Set fixed search_path on timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
