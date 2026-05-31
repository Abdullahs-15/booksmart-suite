import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { formatPrice, formatTime, formatDateLong, generateTimeSlots, cn } from "@/lib/utils";
import type { Availability, Booking, Business, Discount, Service } from "@/types";
import { Clock, MapPin, Sparkles, CreditCard, Banknote, PartyPopper } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/book/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Book — ${params.slug}` }] }),
  component: BookPage,
});

function BookPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Pick<Booking, "booking_date" | "booking_time" | "service_id">[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [payment, setPayment] = useState<"stripe" | "cash">("stripe");
  const [discount, setDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    (async () => {
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
      if (!biz) return;
      setBusiness(biz as Business);
      const [{ data: s }, { data: a }] = await Promise.all([
        supabase.from("services").select("*").eq("business_id", biz.id).eq("is_active", true),
        supabase.from("availability").select("*").eq("business_id", biz.id),
      ]);
      setServices((s as Service[]) ?? []);
      setAvailability((a as Availability[]) ?? []);
    })();
  }, [slug]);

  useEffect(() => {
    if (!business || !date) { setBookings([]); return; }
    const key = date.toISOString().slice(0,10);
    supabase.from("bookings").select("booking_date,booking_time,service_id").eq("business_id", business.id).eq("booking_date", key).then(({ data }) => setBookings(data ?? []));
  }, [business, date]);

  // Look up a discount when the email looks valid
  useEffect(() => {
    if (!business) return;
    const email = form.email.trim().toLowerCase();
    if (!email || !email.includes("@")) { setDiscount(null); return; }
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("discounts")
      .select("*")
      .eq("business_id", business.id)
      .eq("customer_email", email)
      .eq("is_active", true)
      .then(({ data }) => {
        const list = (data as Discount[]) ?? [];
        const valid = list.filter(d => !d.valid_until || d.valid_until >= today);
        setDiscount(valid[0] ?? null);
      });
  }, [form.email, business]);

  const service = services.find(s => s.id === serviceId);
  const availByDay = useMemo(() => Object.fromEntries(availability.map(a => [a.day_of_week, a])), [availability]);

  const pricing = useMemo(() => {
    const price = service?.price ?? 0;
    const baseDeposit = service?.deposit_amount ?? 0;
    let discountCents = 0;
    if (discount) {
      discountCents = discount.discount_type === "percentage"
        ? Math.round((price * discount.discount_value) / 100)
        : Math.min(discount.discount_value, price);
    }
    const finalPrice = Math.max(0, price - discountCents);
    const depositRatio = price > 0 ? baseDeposit / price : 0;
    const depositDue = Math.round(finalPrice * depositRatio);
    return { price, baseDeposit, discountCents, finalPrice, depositDue };
  }, [service, discount]);

  const slots = useMemo(() => {
    if (!date) return [];
    const a = availByDay[date.getDay()];
    if (!a || !a.is_available) return [];
    return generateTimeSlots(a.start_time, a.end_time, 30);
  }, [date, availByDay]);

  const takenSlots = useMemo(() => new Set(bookings.map(b => b.booking_time)), [bookings]);

  function isDayDisabled(d: Date) {
    const a = availByDay[d.getDay()];
    if (!a || !a.is_available) return true;
    const today = new Date(); today.setHours(0,0,0,0);
    return d < today;
  }

  async function confirm() {
    if (!business || !service || !date || !time) { toast.error("Pick a service, date and time"); return; }
    if (!form.first || !form.last || !form.email) { toast.error("Fill in your details"); return; }
    setSubmitting(true);
    const status = payment === "cash" ? "pending_cash" : "confirmed";
    const depositPaid = payment === "cash" ? 0 : pricing.depositDue;
    const { error } = await supabase.from("bookings").insert({
      business_id: business.id,
      service_id: service.id,
      customer_name: `${form.first} ${form.last}`.trim(),
      customer_email: form.email.trim().toLowerCase(),
      customer_phone: form.phone,
      booking_date: date.toISOString().slice(0,10),
      booking_time: time,
      status,
      total_price: pricing.finalPrice,
      deposit_paid: depositPaid,
      notes: form.notes,
      payment_method: payment,
      discount_id: discount?.id ?? null,
      discount_applied: discount ? pricing.discountCents : null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/book/$slug/success", params: { slug }, search: { service: service.id, date: date.toISOString().slice(0,10), time } });
  }

  if (!business) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-sm text-white/60">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-6 py-6 flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center overflow-hidden shadow-lg">
            {business.avatar_url ? <img src={business.avatar_url} alt={business.name} className="h-full w-full object-cover" /> : <Sparkles className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-white">{business.name}</h1>
              <Badge variant="outline" className="bg-white/10 text-white/85 border-white/20">{business.category}</Badge>
            </div>
            {business.description && <p className="text-sm text-white/70 mt-1">{business.description}</p>}
            {business.address && <p className="text-xs text-white/60 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{business.address}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-8">
          <section>
            <h2 className="font-semibold mb-3 text-white">1. Choose a service</h2>
            {services.length === 0 ? (
              <Card className="p-6 text-sm text-white/60 rounded-xl glass glass-strong">This business hasn't added services yet.</Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map(s => (
                  <button key={s.id} onClick={() => { setServiceId(s.id); setTime(null); }} className={cn(
                    "text-left p-4 rounded-xl border backdrop-blur transition-smooth",
                    serviceId === s.id
                      ? "border-indigo-400/50 bg-indigo-500/20"
                      : "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30"
                  )}>
                    <div className="font-medium text-white">{s.name}</div>
                    {s.description && <div className="text-xs text-white/70 mt-1 line-clamp-2">{s.description}</div>}
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 text-white/70"><Clock className="h-3.5 w-3.5" />{s.duration_minutes} min</span>
                      <span className="font-medium text-white">{formatPrice(s.price)}</span>
                    </div>
                    <div className="text-xs text-white/60 mt-1">Deposit {formatPrice(s.deposit_amount)} due now</div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold mb-3 text-white">2. Pick a date</h2>
            <Card className="p-3 rounded-xl inline-block glass glass-strong">
              <Calendar mode="single" selected={date} onSelect={d => { setDate(d); setTime(null); }} disabled={isDayDisabled} className="text-white" />
            </Card>
          </section>

          {date && (
            <section>
              <h2 className="font-semibold mb-3 text-white">3. Pick a time</h2>
              {slots.length === 0 ? (
                <p className="text-sm text-white/60">No times available on this day.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map(t => {
                    const taken = takenSlots.has(t);
                    return (
                      <button key={t} disabled={taken} onClick={() => setTime(t)} className={cn(
                        "px-3 py-1.5 text-sm rounded-full border backdrop-blur",
                        taken && "opacity-40 cursor-not-allowed line-through",
                        time === t ? "bg-indigo-500/40 text-white border-indigo-400/50" : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30 text-white"
                      )}>{formatTime(t)}</button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="font-semibold mb-3 text-white">4. Your details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-white/85">First name</Label><Input value={form.first} onChange={e => setForm({...form, first: e.target.value})} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
              <div className="space-y-1"><Label className="text-white/85">Last name</Label><Input value={form.last} onChange={e => setForm({...form, last: e.target.value})} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
              <div className="space-y-1 sm:col-span-2"><Label className="text-white/85">Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
              <div className="space-y-1 sm:col-span-2"><Label className="text-white/85">Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
              <div className="space-y-1 sm:col-span-2"><Label className="text-white/85">Notes (optional)</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
            </div>
            {discount && (
              <div className="mt-4 flex items-start gap-3 p-3 rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-sm">
                <PartyPopper className="h-4 w-4 mt-0.5 text-emerald-400" />
                <div>
                  <div className="font-medium text-emerald-300">A discount has been applied to your booking!</div>
                  <div className="text-xs text-white/70">{discount.reason || "Customer discount"} · {discount.discount_type === "percentage" ? `${discount.discount_value}% off` : `${formatPrice(discount.discount_value)} off`}</div>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold mb-3 text-white">5. Payment method</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setPayment("stripe")} className={cn(
                "text-left p-4 rounded-xl border backdrop-blur transition-smooth",
                payment === "stripe" ? "border-indigo-400/50 bg-indigo-500/20" : "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30"
              )}>
                <div className="flex items-center gap-2 font-medium text-white"><CreditCard className="h-4 w-4 text-indigo-400" /> Pay deposit now</div>
                <div className="text-xs text-white/70 mt-1">Secure online payment via Stripe</div>
                <div className="text-sm font-medium mt-2 text-white">{formatPrice(pricing.depositDue)}</div>
              </button>
              <button type="button" onClick={() => setPayment("cash")} className={cn(
                "text-left p-4 rounded-xl border backdrop-blur transition-smooth",
                payment === "cash" ? "border-indigo-400/50 bg-indigo-500/20" : "border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30"
              )}>
                <div className="flex items-center gap-2 font-medium text-white"><Banknote className="h-4 w-4 text-amber-400" /> Pay at appointment</div>
                <div className="text-xs text-white/70 mt-1">Full payment due at time of service</div>
                <div className="text-sm font-medium mt-2 text-white">No payment required now</div>
              </button>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 self-start">
          <Card className="p-5 rounded-xl space-y-3 glass glass-strong border-white/20">
            <h3 className="font-semibold text-white">Summary</h3>
            <div className="text-sm">
              <div className="text-white/60 text-xs">Service</div>
              <div className="font-medium text-white">{service?.name ?? "—"}</div>
            </div>
            <div className="text-sm">
              <div className="text-white/60 text-xs">When</div>
              <div className="font-medium text-white">{date ? formatDateLong(date) : "—"}{time ? ` · ${formatTime(time)}` : ""}</div>
            </div>
            <div className="border-t border-white/10 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-white/70">Service total</span><span className="text-white">{formatPrice(pricing.price)}</span></div>
              {discount && pricing.discountCents > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Discount{discount.discount_type === "percentage" ? ` (${discount.discount_value}%)` : ""}</span>
                  <span>−{formatPrice(pricing.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-white"><span>Final price</span><span>{formatPrice(pricing.finalPrice)}</span></div>
              {payment === "stripe" ? (
                <>
                  <div className="flex justify-between"><span className="text-white/70">Deposit due now</span><span className="font-medium text-white">{formatPrice(pricing.depositDue)}</span></div>
                  <div className="flex justify-between text-xs text-white/60"><span>Remainder at appointment</span><span>{formatPrice(pricing.finalPrice - pricing.depositDue)}</span></div>
                </>
              ) : (
                <div className="flex justify-between text-xs text-white/60"><span>Due at appointment</span><span>{formatPrice(pricing.finalPrice)}</span></div>
              )}
            </div>
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 transition-smooth" onClick={confirm} disabled={submitting || !service || !date || !time}>
              {submitting ? "Confirming…" : payment === "cash" ? "Confirm booking" : "Confirm & Pay Deposit"}
            </Button>
            <p className="text-[11px] text-white/60 text-center">{payment === "cash" ? "You'll pay at the appointment." : "Secure checkout coming soon — booking is held."}</p>
          </Card>
          <p className="text-xs text-white/60 text-center mt-3"><Link to="/" className="hover:text-indigo-400">Powered by BookSmart</Link></p>
        </aside>
      </main>
    </div>
  );
}