DROP POLICY IF EXISTS "Public can increment times_used" ON public.discounts;
REVOKE UPDATE ON public.discounts FROM anon;