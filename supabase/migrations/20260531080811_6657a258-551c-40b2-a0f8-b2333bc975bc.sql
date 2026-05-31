
-- Discounts table
CREATE TABLE public.discounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  valid_until date,
  times_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.discounts TO authenticated;
GRANT SELECT, UPDATE ON public.discounts TO anon;
GRANT ALL ON public.discounts TO service_role;

ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own discounts" ON public.discounts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses b WHERE b.id = discounts.business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses b WHERE b.id = discounts.business_id AND b.owner_id = auth.uid()));

-- Public can look up active discounts by email to apply at checkout, and increment times_used
CREATE POLICY "Public can view active discounts" ON public.discounts
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Public can increment times_used" ON public.discounts
  FOR UPDATE TO anon, authenticated
  USING (is_active = true)
  WITH CHECK (is_active = true);

CREATE INDEX idx_discounts_business ON public.discounts(business_id);
CREATE INDEX idx_discounts_email ON public.discounts(customer_email);

-- Booking columns for discount tracking
ALTER TABLE public.bookings
  ADD COLUMN discount_id uuid,
  ADD COLUMN discount_applied integer,
  ADD COLUMN payment_method text NOT NULL DEFAULT 'stripe';
