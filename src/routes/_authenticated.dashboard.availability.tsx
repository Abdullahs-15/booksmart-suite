import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DAYS, type Availability } from "@/types";
import { generateTimeSlots, formatTime } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/availability")({
  head: () => ({ meta: [{ title: "Availability — BookSmart" }] }),
  component: AvailabilityPage,
});

const TIMES = generateTimeSlots("06:00", "22:30", 30);

function AvailabilityPage() {
  const { business } = useMyBusiness();
  const [rows, setRows] = useState<Availability[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!business) return;
    supabase.from("availability").select("*").eq("business_id", business.id).order("day_of_week").then(({ data }) => {
      const map = new Map<number, Availability>((data as Availability[] ?? []).map(r => [r.day_of_week, r]));
      const merged: Availability[] = [0,1,2,3,4,5,6].map(d => map.get(d) ?? {
        id: `tmp-${d}`, business_id: business.id, day_of_week: d, start_time: "09:00", end_time: "17:00", is_available: d >= 1 && d <= 5,
      });
      setRows(merged);
    });
  }, [business]);

  function update(d: number, patch: Partial<Availability>) {
    setRows(rs => rs.map(r => r.day_of_week === d ? { ...r, ...patch } : r));
  }

  async function save() {
    if (!business) return;
    setSaving(true);
    const payload = rows.map(r => ({
      business_id: business.id,
      day_of_week: r.day_of_week,
      start_time: r.start_time,
      end_time: r.end_time,
      is_available: r.is_available,
    }));
    const { error } = await supabase.from("availability").upsert(payload, { onConflict: "business_id,day_of_week" });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Availability saved");
  }

  // Order Mon..Sun for display
  const order = [1,2,3,4,5,6,0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Availability</h1>
        <p className="text-sm text-white/70">Set the hours customers can book each day.</p>
      </div>
      <Card className="rounded-xl divide-y divide-white/10 glass glass-strong border-white/20">
        {order.map(d => {
          const r = rows.find(x => x.day_of_week === d);
          if (!r) return null;
          return (
            <div key={d} className="p-4 flex flex-wrap items-center gap-4 text-white">
              <div className="w-28 font-medium">{DAYS[d]}</div>
              <Switch checked={r.is_available} onCheckedChange={v => update(d, { is_available: v })} />
              <Select value={r.start_time} onValueChange={v => update(d, { start_time: v })}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white disabled:opacity-50" disabled={!r.is_available}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">{TIMES.map(t => <SelectItem key={t} value={t} className="text-white">{formatTime(t)}</SelectItem>)}</SelectContent>
              </Select>
              <span className="text-sm text-white/70">to</span>
              <Select value={r.end_time} onValueChange={v => update(d, { end_time: v })}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white disabled:opacity-50" disabled={!r.is_available}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">{TIMES.map(t => <SelectItem key={t} value={t} className="text-white">{formatTime(t)}</SelectItem>)}</SelectContent>
              </Select>
              {!r.is_available && <span className="text-xs text-white/60">Closed</span>}
            </div>
          );
        })}
      </Card>
      <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700">{saving ? "Saving…" : "Save schedule"}</Button>
    </div>
  );
}