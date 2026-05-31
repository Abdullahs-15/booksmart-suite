import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPrice, formatTime, formatDateLong } from "@/lib/utils";
import { toast } from "sonner";
import type { Booking, Discount, Service } from "@/types";
import { Check, X, Mail, Phone, CreditCard, Banknote, Percent } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/bookings")({
  head: () => ({ meta: [{ title: "Bookings — BookSmart" }] }),
  component: BookingsPage,
});

function statusColor(s: string) {
  if (s === "confirmed") return "bg-emerald-500/30 text-emerald-300 border-transparent";
  if (s === "pending") return "bg-amber-500/30 text-amber-300 border-transparent";
  if (s === "pending_cash") return "bg-amber-500/30 text-amber-300 border-transparent";
  if (s === "completed") return "bg-indigo-500/30 text-indigo-300 border-transparent";
  return "bg-red-500/30 text-red-300 border-transparent";
}

function statusLabel(s: string) {
  if (s === "pending_cash") return "Cash";
  return s;
}

function BookingsPage() {
  const { business } = useMyBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);

  async function reload() {
    if (!business) return;
    const [{ data: b }, { data: s }, { data: d }] = await Promise.all([
      supabase.from("bookings").select("*").eq("business_id", business.id).order("booking_date", { ascending: false }),
      supabase.from("services").select("*").eq("business_id", business.id),
      supabase.from("discounts").select("*").eq("business_id", business.id),
    ]);
    setBookings((b as Booking[]) ?? []);
    setServices((s as Service[]) ?? []);
    setDiscounts((d as Discount[]) ?? []);
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [business]);

  const serviceById = useMemo(() => Object.fromEntries(services.map(s => [s.id, s])), [services]);
  const discountById = useMemo(() => Object.fromEntries(discounts.map(d => [d.id, d])), [discounts]);
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  async function setStatus(b: Booking, status: Booking["status"]) {
    await supabase.from("bookings").update({ status }).eq("id", b.id);
    // When completing a booking that used a discount, increment its usage count.
    if (status === "completed" && b.discount_id && b.status !== "completed") {
      const d = discountById[b.discount_id];
      if (d) await supabase.from("discounts").update({ times_used: d.times_used + 1 }).eq("id", d.id);
    }
    toast.success(`Marked ${status === "pending_cash" ? "cash" : status}`);
    reload();
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Bookings</h1>
        <p className="text-sm text-white/70">Every appointment in one place.</p>
      </div>
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-white/10 border-white/20">
          {[
            { v: "all", l: "All" },
            { v: "confirmed", l: "Confirmed" },
            { v: "pending_cash", l: "Cash" },
            { v: "pending", l: "Pending" },
            { v: "completed", l: "Completed" },
            { v: "cancelled", l: "Cancelled" },
          ].map(s => (
            <TabsTrigger key={s.v} value={s.v} className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-indigo-500/30">{s.l}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Card className="rounded-xl overflow-hidden glass glass-strong border-white/20">
        <div className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_0.8fr_0.8fr_auto] gap-3 px-4 py-3 text-xs font-medium text-white/60 bg-white/5 hidden md:grid">
          <div>Date</div><div>Time</div><div>Customer</div><div>Service</div><div>Status</div><div>Deposit</div><div></div>
        </div>
        <div className="divide-y divide-white/10">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-white/60">No bookings yet.</div>
          ) : filtered.map(b => (
            <button key={b.id} onClick={() => setSelected(b)} className="w-full text-left grid md:grid-cols-[1fr_1fr_1.2fr_1.2fr_0.8fr_0.8fr_auto] gap-3 px-4 py-3 hover:bg-white/5 items-center text-white">
              <div className="text-sm">{formatDateLong(b.booking_date)}</div>
              <div className="text-sm">{formatTime(b.booking_time)}</div>
              <div className="text-sm font-medium">{b.customer_name}</div>
              <div className="text-sm text-white/70">{serviceById[b.service_id]?.name ?? "—"}</div>
              <div><Badge variant="outline" className={statusColor(b.status)}>{statusLabel(b.status)}</Badge></div>
              <div className="text-sm">{formatPrice(b.deposit_paid)}</div>
              <div className="text-xs text-indigo-400">View</div>
            </button>
          ))}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="bg-white/10 border-white/20 text-white">
          <DialogHeader><DialogTitle className="text-white">Booking details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-white/70">Status</span><Badge variant="outline" className={statusColor(selected.status)}>{statusLabel(selected.status)}</Badge></div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Payment</span>
                <span className="flex items-center gap-1.5 font-medium text-white">
                  {selected.payment_method === "cash"
                    ? <><Banknote className="h-3.5 w-3.5 text-amber-400" /> Cash at appointment</>
                    : <><CreditCard className="h-3.5 w-3.5 text-indigo-400" /> Stripe deposit</>}
                </span>
              </div>
              <div><div className="text-white/60 text-xs">When</div><div className="font-medium text-white">{formatDateLong(selected.booking_date)} · {formatTime(selected.booking_time)}</div></div>
              <div><div className="text-white/60 text-xs">Service</div><div className="font-medium text-white">{serviceById[selected.service_id]?.name ?? "—"}</div></div>
              <div><div className="text-white/60 text-xs">Customer</div><div className="font-medium text-white">{selected.customer_name}</div></div>
              <div className="flex items-center gap-2 text-white/70"><Mail className="h-3.5 w-3.5" />{selected.customer_email}</div>
              {selected.customer_phone && <div className="flex items-center gap-2 text-white/70"><Phone className="h-3.5 w-3.5" />{selected.customer_phone}</div>}
              {selected.discount_id && discountById[selected.discount_id] && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-xs">
                  <Percent className="h-3.5 w-3.5 mt-0.5 text-emerald-400" />
                  <span><span className="font-medium text-emerald-300">Discount applied:</span> {discountById[selected.discount_id].reason || "—"} — −{formatPrice(selected.discount_applied ?? 0)}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-white/60 text-xs">Total</div><div className="font-medium text-white">{formatPrice(selected.total_price)}</div></div>
                <div><div className="text-white/60 text-xs">Deposit paid</div><div className="font-medium text-white">{formatPrice(selected.deposit_paid)}</div></div>
              </div>
              {selected.notes && <div><div className="text-white/60 text-xs">Notes</div><div className="text-white">{selected.notes}</div></div>}
              <div className="flex flex-wrap gap-2 pt-2">
                {selected.status === "pending_cash" && (
                  <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700" onClick={() => setStatus(selected, "completed")}>
                    <Banknote className="h-4 w-4 mr-1" />Mark as paid
                  </Button>
                )}
                {selected.status !== "completed" && selected.status !== "pending_cash" && (
                  <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => setStatus(selected, "completed")}><Check className="h-4 w-4 mr-1" />Mark complete</Button>
                )}
                {selected.status !== "cancelled" && (
                  <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setStatus(selected, "cancelled")}><X className="h-4 w-4 mr-1" />Cancel</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}