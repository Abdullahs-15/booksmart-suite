import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { Service } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/services")({
  head: () => ({ meta: [{ title: "Services — BookSmart" }] }),
  component: ServicesPage,
});

type Draft = {
  id?: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number; // dollars in form
  deposit_amount: number;
  is_active: boolean;
};

const blank: Draft = { name: "", description: "", duration_minutes: 30, price: 0, deposit_amount: 0, is_active: true };

function ServicesPage() {
  const { business } = useMyBusiness();
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank);

  async function reload() {
    if (!business) return;
    const { data } = await supabase.from("services").select("*").eq("business_id", business.id).order("created_at");
    setServices((data as Service[]) ?? []);
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [business]);

  function openNew() { setDraft(blank); setOpen(true); }
  function openEdit(s: Service) {
    setDraft({ id: s.id, name: s.name, description: s.description, duration_minutes: s.duration_minutes, price: s.price / 100, deposit_amount: s.deposit_amount / 100, is_active: s.is_active });
    setOpen(true);
  }

  async function save() {
    if (!business) return;
    const payload = {
      business_id: business.id,
      name: draft.name,
      description: draft.description,
      duration_minutes: Number(draft.duration_minutes),
      price: Math.round(Number(draft.price) * 100),
      deposit_amount: Math.round(Number(draft.deposit_amount) * 100),
      is_active: draft.is_active,
    };
    const { error } = draft.id
      ? await supabase.from("services").update(payload).eq("id", draft.id)
      : await supabase.from("services").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved");
    setOpen(false);
    reload();
  }

  async function remove(s: Service) {
    if (!confirm("Delete this service?")) return;
    const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("service_id", s.id);
    if ((count ?? 0) > 0) {
      await supabase.from("services").update({ is_active: false }).eq("id", s.id);
      toast.message("Service has existing bookings — marked inactive instead.");
    } else {
      await supabase.from("services").delete().eq("id", s.id);
      toast.success("Deleted");
    }
    reload();
  }

  async function toggleActive(s: Service) {
    await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Services</h1>
          <p className="text-sm text-muted-foreground">What you offer and how much it costs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add service</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{draft.id ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Name</Label><Input value={draft.name} onChange={e => setDraft(d => ({...d, name: e.target.value}))} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={draft.description} onChange={e => setDraft(d => ({...d, description: e.target.value}))} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2"><Label>Minutes</Label><Input type="number" value={draft.duration_minutes} onChange={e => setDraft(d => ({...d, duration_minutes: Number(e.target.value)}))} /></div>
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" step="0.01" value={draft.price} onChange={e => setDraft(d => ({...d, price: Number(e.target.value)}))} /></div>
                <div className="space-y-2"><Label>Deposit ($)</Label><Input type="number" step="0.01" value={draft.deposit_amount} onChange={e => setDraft(d => ({...d, deposit_amount: Number(e.target.value)}))} /></div>
              </div>
              <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={draft.is_active} onCheckedChange={v => setDraft(d => ({...d, is_active: v}))} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground rounded-xl">No services yet. Add one to start taking bookings.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <Card key={s.id} className="p-5 rounded-xl flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{s.name}</h3>
                <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
              </div>
              {s.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{s.duration_minutes} min</span>
                <span className="font-medium">{formatPrice(s.price)}</span>
                <span className="text-xs text-muted-foreground">deposit {formatPrice(s.deposit_amount)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(s)}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}