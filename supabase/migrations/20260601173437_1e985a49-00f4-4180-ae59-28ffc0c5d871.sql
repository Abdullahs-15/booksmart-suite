
-- 1. Stop exposing customer PII publicly. Replace permissive SELECT with a slim view.
DROP POLICY IF EXISTS "Public can read non-cancelled bookings for slots" ON public.bookings;

CREATE OR REPLACE VIEW public.booking_slots AS
SELECT business_id, service_id, booking_date, booking_time
FROM public.bookings
WHERE status <> 'cancelled';

GRANT SELECT ON public.booking_slots TO anon, authenticated;

-- 2. Tighten the permissive public INSERT policy on bookings.
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;

CREATE POLICY "Public can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status IN ('pending', 'confirmed', 'pending_cash')
  AND total_price >= 0
  AND deposit_paid >= 0
  AND EXISTS (
    SELECT 1 FROM public.services s
    WHERE s.id = service_id
      AND s.business_id = bookings.business_id
      AND s.is_active = true
  )
);

-- 3. Revoke EXECUTE on the SECURITY DEFINER event-trigger function from public roles.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
