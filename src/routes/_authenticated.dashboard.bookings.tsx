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
import type { Booking, Service } from "@/types";
import { Check, X, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/bookings")({
  head: () => ({ meta: [{ title: "Bookings — BookSmart" }] }),
  component: BookingsPage,
});

function statusColor(s: string) {
  if (s === "confirmed") return "bg-[color:var(--success)]/15 text-[color:var(--success)] border-transparent";
  if (s === "pending") return "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-transparent";
  if (s === "completed") return "bg-primary/10 text-primary border-transparent";
  return "bg-destructive/15 text-destructive border-transparent";
}

function BookingsPage() {
  const { business } = useMyBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);

  async function reload() {
    if (!business) return;
    const [{ data: b }, { data: s }] = await Promise.all([
      supabase.from("bookings").select("*").eq("business_id", business.id).order("booking_date", { ascending: false }),
      supabase.from("services").select("*").eq("business_id", business.id),
    ]);
    setBookings((b as Booking[]) ?? []);
    setServices((s as Service[]) ?? []);
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [business]);

  const serviceById = useMemo(() => Object.fromEntries(services.map(s => [s.id, s])), [services]);
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  async function setStatus(b: Booking, status: Booking["status"]) {
    await supabase.from("bookings").update({ status }).eq("id", b.id);
    toast.success(`Marked ${status}`);
    reload();
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-sm text-muted-foreground">Every appointment in one place.</p>
      </div>
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {["all","confirmed","pending","completed","cancelled"].map(s => (
            <TabsTrigger key={s} value={s} className="capitalize">{s}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Card className="rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_0.8fr_0.8fr_auto] gap-3 px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/50 hidden md:grid">
          <div>Date</div><div>Time</div><div>Customer</div><div>Service</div><div>Status</div><div>Deposit</div><div></div>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No bookings yet.</div>
          ) : filtered.map(b => (
            <button key={b.id} onClick={() => setSelected(b)} className="w-full text-left grid md:grid-cols-[1fr_1fr_1.2fr_1.2fr_0.8fr_0.8fr_auto] gap-3 px-4 py-3 hover:bg-accent/50 items-center">
              <div className="text-sm">{formatDateLong(b.booking_date)}</div>
              <div className="text-sm">{formatTime(b.booking_time)}</div>
              <div className="text-sm font-medium">{b.customer_name}</div>
              <div className="text-sm text-muted-foreground">{serviceById[b.service_id]?.name ?? "—"}</div>
              <div><Badge variant="outline" className={statusColor(b.status)}>{b.status}</Badge></div>
              <div className="text-sm">{formatPrice(b.deposit_paid)}</div>
              <div className="text-xs text-primary">View</div>
            </button>
          ))}
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className={statusColor(selected.status)}>{selected.status}</Badge></div>
              <div><div className="text-muted-foreground text-xs">When</div><div className="font-medium">{formatDateLong(selected.booking_date)} · {formatTime(selected.booking_time)}</div></div>
              <div><div className="text-muted-foreground text-xs">Service</div><div className="font-medium">{serviceById[selected.service_id]?.name ?? "—"}</div></div>
              <div><div className="text-muted-foreground text-xs">Customer</div><div className="font-medium">{selected.customer_name}</div></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{selected.customer_email}</div>
              {selected.customer_phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{selected.customer_phone}</div>}
              <div className="grid grid-cols-2 gap-2">
                <div><div className="text-muted-foreground text-xs">Total</div><div className="font-medium">{formatPrice(selected.total_price)}</div></div>
                <div><div className="text-muted-foreground text-xs">Deposit paid</div><div className="font-medium">{formatPrice(selected.deposit_paid)}</div></div>
              </div>
              {selected.notes && <div><div className="text-muted-foreground text-xs">Notes</div><div>{selected.notes}</div></div>}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => setStatus(selected, "completed")}><Check className="h-4 w-4 mr-1" />Mark complete</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(selected, "cancelled")}><X className="h-4 w-4 mr-1" />Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}