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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="p-10 max-w-md text-center rounded-xl">
        <div className="mx-auto h-14 w-14 rounded-full bg-[color:var(--success)]/15 text-[color:var(--success)] flex items-center justify-center"><Check className="h-7 w-7" /></div>
        <h1 className="mt-4 text-2xl font-semibold">You're booked!</h1>
        <p className="text-sm text-muted-foreground mt-2">{business?.name ?? "Your appointment"} is confirmed.</p>
        <div className="mt-6 text-sm space-y-1">
          {service && <div><span className="text-muted-foreground">Service: </span>{service.name}</div>}
          {date && <div><span className="text-muted-foreground">Date: </span>{formatDateLong(date)}</div>}
          {time && <div><span className="text-muted-foreground">Time: </span>{formatTime(time)}</div>}
        </div>
        <p className="text-xs text-muted-foreground mt-6">A confirmation email will be sent shortly.</p>
        <Link to="/book/$slug" params={{ slug }} className="block mt-6"><Button variant="outline" className="w-full">Back to {business?.name ?? "booking page"}</Button></Link>
      </Card>
    </div>
  );
}