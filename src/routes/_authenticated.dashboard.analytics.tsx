import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Booking, Service } from "@/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — BookSmart" }] }),
  component: AnalyticsPage,
});

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444"];

function AnalyticsPage() {
  const { business } = useMyBusiness();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!business) return;
    supabase.from("bookings").select("*").eq("business_id", business.id).then(({ data }) => setBookings((data as Booking[]) ?? []));
    supabase.from("services").select("*").eq("business_id", business.id).then(({ data }) => setServices((data as Service[]) ?? []));
  }, [business]);

  const bySvc = useMemo(() => Object.fromEntries(services.map(s => [s.id, s])), [services]);

  const last30 = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      days.push({ date: key.slice(5), count: bookings.filter(b => b.booking_date === key).length });
    }
    return days;
  }, [bookings]);

  const revBySvc = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach(b => map.set(b.service_id, (map.get(b.service_id) ?? 0) + b.deposit_paid));
    return Array.from(map.entries()).map(([sid, cents]) => ({ name: bySvc[sid]?.name ?? "Unknown", value: cents / 100 }));
  }, [bookings, bySvc]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { confirmed: 0, completed: 0, cancelled: 0, pending: 0 };
    bookings.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1; });
    return Object.entries(counts).filter(([,v]) => v > 0).map(([k,v]) => ({ name: k, value: v }));
  }, [bookings]);

  const totalRev = bookings.reduce((s,b) => s + b.deposit_paid, 0);
  const avgVal = bookings.length ? Math.round(bookings.reduce((s,b) => s + b.total_price, 0) / bookings.length) : 0;
  const cancelRate = bookings.length ? Math.round((bookings.filter(b => b.status === "cancelled").length / bookings.length) * 100) : 0;

  const empty = bookings.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track bookings and revenue over time.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total bookings" value={String(bookings.length)} />
        <Stat label="Total revenue" value={formatPrice(totalRev)} />
        <Stat label="Avg booking value" value={formatPrice(avgVal)} />
        <Stat label="Cancellation rate" value={`${cancelRate}%`} />
      </div>

      {empty ? (
        <Card className="p-16 text-center rounded-xl">
          <p className="font-medium">No bookings yet</p>
          <p className="text-sm text-muted-foreground mt-1">Share your booking page to start collecting data.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5 rounded-xl">
            <h3 className="font-semibold mb-4">Bookings (last 30 days)</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={last30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5 rounded-xl">
            <h3 className="font-semibold mb-4">Revenue by service</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={revBySvc}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#6366F1" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5 rounded-xl lg:col-span-2">
            <h3 className="font-semibold mb-4">Status breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusCounts} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                    {statusCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5 rounded-xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </Card>
  );
}