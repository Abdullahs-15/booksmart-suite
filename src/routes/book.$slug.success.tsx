import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatDateLong, formatTime } from "@/lib/utils";
import type { Business, Service } from "@/types";

export const Route = createFileRoute("/book/$slug/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    service: typeof s.service === "string" ? s.service : "",
    date: typeof s.date === "string" ? s.date : "",
    time: typeof s.time === "string" ? s.time : "",
  }),
  head: () => ({ meta: [{ title: "You're booked — BookSmart" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { slug } = Route.useParams();
  const { service: sid, date, time } = Route.useSearch();
  const [business, setBusiness] = useState<Business | null>(null);
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    (async () => {
      const { data: biz } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
      setBusiness((biz as Business) ?? null);
      if (sid) {
        const { data: s } = await supabase.from("services").select("*").eq("id", sid).maybeSingle();
        setService((s as Service) ?? null);
      }
    })();
  }, [slug, sid]);

  return (
    <div className="light-surface flex items-center justify-center px-4 py-12">
      <div className="glass-light-strong p-10 max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"><Check className="h-7 w-7" /></div>
        <h1 className="mt-4 text-2xl font-semibold text-ink">You're booked!</h1>
        <p className="text-sm text-ink-mid mt-2">{business?.name ?? "Your appointment"} is confirmed.</p>
        <div className="mt-6 text-sm space-y-1">
          {service && <div><span className="text-ink-mid">Service: </span><span className="text-ink">{service.name}</span></div>}
          {date && <div><span className="text-ink-mid">Date: </span><span className="text-ink">{formatDateLong(date)}</span></div>}
          {time && <div><span className="text-ink-mid">Time: </span><span className="text-ink">{formatTime(time)}</span></div>}
        </div>
        <p className="text-xs text-ink-sub mt-6">A confirmation email will be sent shortly.</p>
        <Link to="/book/$slug" params={{ slug }} className="block mt-6"><Button variant="outline" className="w-full rounded-full bg-white border-black/10 text-ink hover:bg-black/5">Back to {business?.name ?? "booking page"}</Button></Link>
      </div>
    </div>
  );
}