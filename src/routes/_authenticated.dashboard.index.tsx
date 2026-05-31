import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Users, TrendingUp, Copy, Plus, Sparkles } from "lucide-react";
import { formatPrice, formatTime } from "@/lib/utils";
import { toast } from "sonner";
import type { Booking, Service } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — BookSmart" }] }),
  component: Home,
});

function statusColor(s: string) {
  if (s === "confirmed") return "bg-[color:var(--success)]/15 text-[color:var(--success)] border-transparent";
  if (s === "pending" || s === "pending_cash") return "bg-[color:var(--warning)]/15 text-[color:var(--warning)] border-transparent";
  if (s === "completed") return "bg-primary/10 text-primary border-transparent";
  return "bg-destructive/15 text-destructive border-transparent";
}

function Home() {
  const { business } = useMyBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!business) return;
    supabase.from("bookings").select("*").eq("business_id", business.id).then(({ data }) => setBookings((data as Booking[]) ?? []));
    supabase.from("services").select("*").eq("business_id", business.id).then(({ data }) => setServices((data as Service[]) ?? []));
  }, [business]);

  if (!business) return <div className="text-sm text-muted-foreground">Loading business…</div>;

  const today = new Date().toISOString().slice(0, 10);
  const in7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekStart = startOfWeek.toISOString().slice(0, 10);

  const todays = bookings.filter(b => b.booking_date === today && b.status !== "cancelled").sort((a,b) => a.booking_time.localeCompare(b.booking_time));
  const weekRevenue = bookings.filter(b => b.booking_date >= weekStart && b.status !== "cancelled").reduce((s,b) => s + b.deposit_paid, 0);
  const totalCustomers = new Set(bookings.map(b => b.customer_email.toLowerCase())).size;
  const upcoming = bookings.filter(b => b.booking_date >= today && b.booking_date <= in7 && b.status !== "cancelled").length;

  const link = typeof window !== "undefined" ? `${window.location.origin}/book/${business.slug}` : `/book/${business.slug}`;

  const serviceById = Object.fromEntries(services.map(s => [s.id, s]));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">{business.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Booking link copied"); }}>
            <Copy className="h-4 w-4 mr-2" /> Share booking link
          </Button>
          <Button onClick={() => location.assign("/dashboard/services")} className="bg-gradient-primary glow-primary hover:glow-primary-strong transition-smooth"><Plus className="h-4 w-4 mr-2" /> Add service</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={CalendarDays} label="Today's bookings" value={String(todays.length)} />
        <Metric icon={DollarSign} label="Week's deposits" value={formatPrice(weekRevenue)} />
        <Metric icon={Users} label="Total customers" value={String(totalCustomers)} />
        <Metric icon={TrendingUp} label="Upcoming (7d)" value={String(upcoming)} />
      </div>

      <Card className="rounded-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Today's schedule</h2>
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="divide-y divide-border">
          {todays.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No bookings today. Share your link to get started.</div>
          ) : todays.map(b => (
            <div key={b.id} className="p-4 flex items-center gap-4">
              <div className="text-sm font-medium w-20">{formatTime(b.booking_time)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{b.customer_name}</p>
                <p className="text-xs text-muted-foreground">{serviceById[b.service_id]?.name} · {serviceById[b.service_id]?.duration_minutes ?? "—"} min</p>
              </div>
              <Badge variant="outline" className={statusColor(b.status)}>{b.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <Card className="p-5 rounded-xl border-gradient-top relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </Card>
  );
}