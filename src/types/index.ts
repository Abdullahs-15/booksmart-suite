export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  phone: string;
  address: string;
  avatar_url: string;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface Availability {
  id: string;
  business_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "pending_cash";

export type PaymentMethod = "stripe" | "cash";

export interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  stripe_session_id: string;
  total_price: number;
  deposit_paid: number;
  notes: string;
  created_at: string;
  payment_method: PaymentMethod;
  discount_id: string | null;
  discount_applied: number | null;
}

export interface Discount {
  id: string;
  business_id: string;
  customer_email: string;
  customer_name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  reason: string;
  is_active: boolean;
  valid_until: string | null;
  times_used: number;
  created_at: string;
}

export const CATEGORIES = [
  "Beauty & Wellness",
  "Fitness & Sports",
  "Education & Tutoring",
  "Health & Medical",
  "Consulting & Coaching",
  "Other",
] as const;

export const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;