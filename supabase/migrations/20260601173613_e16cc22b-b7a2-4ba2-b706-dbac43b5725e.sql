
-- Make the view run as the querying role (avoid SECURITY DEFINER view)
ALTER VIEW public.booking_slots SET (security_invoker = on);

-- Allow anon to read ONLY the slot-checking columns on bookings
GRANT SELECT (business_id, service_id, booking_date, booking_time) ON public.bookings TO anon;

-- Add a SELECT policy scoped to anon for non-cancelled bookings
CREATE POLICY "Anon can read booking slot fields"
ON public.bookings
FOR SELECT
TO anon
USING (status <> 'cancelled');
