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
import type { Availability, Booking, Business, Service } from "@/types";
import { Clock, MapPin, Sparkles } from "lucide-react";
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

  const service = services.find(s => s.id === serviceId);
  const availByDay = useMemo(() => Object.fromEntries(availability.map(a => [a.day_of_week, a])), [availability]);

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
    const { error } = await supabase.from("bookings").insert({
      business_id: business.id,
      service_id: service.id,
      customer_name: `${form.first} ${form.last}`.trim(),
      customer_email: form.email,
      customer_phone: form.phone,
      booking_date: date.toISOString().slice(0,10),
      booking_time: time,
      status: "confirmed",
      total_price: service.price,
      deposit_paid: service.deposit_amount,
      notes: form.notes,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/book/$slug/success", params: { slug }, search: { service: service.id, date: date.toISOString().slice(0,10), time } });
  }

  if (!business) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-6 flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
            {business.avatar_url ? <img src={business.avatar_url} alt={business.name} className="h-full w-full object-cover" /> : <Sparkles className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">{business.name}</h1>
              <Badge variant="outline">{business.category}</Badge>
            </div>
            {business.description && <p className="text-sm text-muted-foreground mt-1">{business.description}</p>}
            {business.address && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{business.address}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-8">
          <section>
            <h2 className="font-semibold mb-3">1. Choose a service</h2>
            {services.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground rounded-xl">This business hasn't added services yet.</Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {services.map(s => (
                  <button key={s.id} onClick={() => { setServiceId(s.id); setTime(null); }} className={cn(
                    "text-left p-4 rounded-xl border-2 transition-colors",
                    serviceId === s.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                  )}>
                    <div className="font-medium">{s.name}</div>
                    {s.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</div>}
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{s.duration_minutes} min</span>
                      <span className="font-medium">{formatPrice(s.price)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Deposit {formatPrice(s.deposit_amount)} due now</div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-semibold mb-3">2. Pick a date</h2>
            <Card className="p-3 rounded-xl inline-block">
              <Calendar mode="single" selected={date} onSelect={d => { setDate(d); setTime(null); }} disabled={isDayDisabled} />
            </Card>
          </section>

          {date && (
            <section>
              <h2 className="font-semibold mb-3">3. Pick a time</h2>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No times available on this day.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map(t => {
                    const taken = takenSlots.has(t);
                    return (
                      <button key={t} disabled={taken} onClick={() => setTime(t)} className={cn(
                        "px-3 py-1.5 text-sm rounded-full border",
                        taken && "opacity-40 cursor-not-allowed line-through",
                        time === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
                      )}>{formatTime(t)}</button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="font-semibold mb-3">4. Your details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1"><Label>First name</Label><Input value={form.first} onChange={e => setForm({...form, first: e.target.value})} /></div>
              <div className="space-y-1"><Label>Last name</Label><Input value={form.last} onChange={e => setForm({...form, last: e.target.value})} /></div>
              <div className="space-y-1 sm:col-span-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="space-y-1 sm:col-span-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="space-y-1 sm:col-span-2"><Label>Notes (optional)</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 self-start">
          <Card className="p-5 rounded-xl space-y-3">
            <h3 className="font-semibold">Summary</h3>
            <div className="text-sm">
              <div className="text-muted-foreground text-xs">Service</div>
              <div className="font-medium">{service?.name ?? "—"}</div>
            </div>
            <div className="text-sm">
              <div className="text-muted-foreground text-xs">When</div>
              <div className="font-medium">{date ? formatDateLong(date) : "—"}{time ? ` · ${formatTime(time)}` : ""}</div>
            </div>
            <div className="border-t border-border pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Service total</span><span>{formatPrice(service?.price ?? 0)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Deposit due now</span><span className="font-medium">{formatPrice(service?.deposit_amount ?? 0)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Remainder at appointment</span><span>{formatPrice((service?.price ?? 0) - (service?.deposit_amount ?? 0))}</span></div>
            </div>
            <Button className="w-full" onClick={confirm} disabled={submitting || !service || !date || !time}>{submitting ? "Confirming…" : "Confirm & Pay Deposit"}</Button>
            <p className="text-[11px] text-muted-foreground text-center">Stripe checkout will be wired in step 10.</p>
          </Card>
          <p className="text-xs text-muted-foreground text-center mt-3"><Link to="/" className="hover:text-primary">Powered by BookSmart</Link></p>
        </aside>
      </main>
    </div>
  );
}