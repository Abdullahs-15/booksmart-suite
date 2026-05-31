import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Power, Trash2, Percent } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import type { Discount } from "@/types";

export const Route = createFileRoute("/_authenticated/dashboard/discounts")({
  head: () => ({ meta: [{ title: "Discounts — BookSmart" }] }),
  component: DiscountsPage,
});

type FormState = {
  customer_name: string;
  customer_email: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  reason: string;
  valid_until: string;
  is_active: boolean;
};

const empty: FormState = {
  customer_name: "",
  customer_email: "",
  discount_type: "percentage",
  discount_value: "10",
  reason: "",
  valid_until: "",
  is_active: true,
};

function isExpired(d: Discount) {
  if (!d.valid_until) return false;
  return new Date(d.valid_until) < new Date(new Date().toDateString());
}

function DiscountsPage() {
  const { business } = useMyBusiness();
  const [items, setItems] = useState<Discount[]>([]);
  const [filter, setFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  async function load() {
    if (!business) return;
    const { data } = await supabase.from("discounts").select("*").eq("business_id", business.id).order("created_at", { ascending: false });
    setItems((data as Discount[]) ?? []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [business]);

  const filtered = useMemo(() => {
    if (filter === "active") return items.filter(d => d.is_active && !isExpired(d));
    if (filter === "expired") return items.filter(d => !d.is_active || isExpired(d));
    return items;
  }, [items, filter]);

  function openNew() { setEditing(null); setForm(empty); setDialogOpen(true); }
  function openEdit(d: Discount) {
    setEditing(d);
    setForm({
      customer_name: d.customer_name,
      customer_email: d.customer_email,
      discount_type: d.discount_type,
      discount_value: String(d.discount_type === "fixed" ? d.discount_value / 100 : d.discount_value),
      reason: d.reason,
      valid_until: d.valid_until ?? "",
      is_active: d.is_active,
    });
    setDialogOpen(true);
  }

  async function save() {
    if (!business) return;
    if (!form.customer_email || !form.discount_value) { toast.error("Email and value required"); return; }
    const valueNum = parseFloat(form.discount_value);
    if (isNaN(valueNum) || valueNum <= 0) { toast.error("Invalid value"); return; }
    const stored = form.discount_type === "fixed" ? Math.round(valueNum * 100) : Math.round(valueNum);
    const payload = {
      business_id: business.id,
      customer_name: form.customer_name,
      customer_email: form.customer_email.trim().toLowerCase(),
      discount_type: form.discount_type,
      discount_value: stored,
      reason: form.reason,
      valid_until: form.valid_until || null,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("discounts").update(payload).eq("id", editing.id)
      : await supabase.from("discounts").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Discount updated" : "Discount added");
    setDialogOpen(false);
    load();
  }

  async function toggleActive(d: Discount) {
    await supabase.from("discounts").update({ is_active: !d.is_active }).eq("id", d.id);
    load();
  }

  async function remove(d: Discount) {
    if (!confirm("Delete this discount?")) return;
    await supabase.from("discounts").delete().eq("id", d.id);
    toast.success("Deleted");
    load();
  }

  function formatValue(d: Discount) {
    return d.discount_type === "percentage" ? `${d.discount_value}%` : formatPrice(d.discount_value);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customer Discounts</h1>
          <p className="text-sm text-white/70">Reward loyal customers with automatic discounts at checkout.</p>
        </div>
        <Button onClick={openNew} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700"><Plus className="h-4 w-4 mr-2" />Add Discount</Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="all" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-indigo-500/30">All</TabsTrigger>
          <TabsTrigger value="active" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-indigo-500/30">Active</TabsTrigger>
          <TabsTrigger value="expired" className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-indigo-500/30">Expired</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-xl overflow-hidden glass glass-strong border-white/20">
        <div className="hidden md:grid grid-cols-[1.2fr_1.4fr_0.6fr_0.6fr_1fr_0.6fr_0.9fr_0.8fr_auto] gap-3 px-4 py-3 text-xs font-medium text-white/60 bg-white/5">
          <div>Customer</div><div>Email</div><div>Type</div><div>Value</div><div>Reason</div><div>Used</div><div>Valid until</div><div>Status</div><div></div>
        </div>
        <div className="divide-y divide-white/10">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-white/60">No discounts yet.</div>
          ) : filtered.map(d => {
            const expired = isExpired(d);
            return (
              <div key={d.id} className="grid md:grid-cols-[1.2fr_1.4fr_0.6fr_0.6fr_1fr_0.6fr_0.9fr_0.8fr_auto] gap-3 px-4 py-3 items-center text-sm text-white">
                <div className="font-medium">{d.customer_name || "—"}</div>
                <div className="text-white/70 truncate">{d.customer_email}</div>
                <div className="capitalize text-white/85">{d.discount_type}</div>
                <div className="font-medium text-indigo-400">{formatValue(d)}</div>
                <div className="text-white/70 truncate">{d.reason || "—"}</div>
                <div className="text-white/85">{d.times_used}</div>
                <div className="text-white/70">{d.valid_until ?? "—"}</div>
                <div>
                  {expired || !d.is_active
                    ? <Badge variant="outline" className="bg-white/10 text-white/70 border-transparent">{!d.is_active ? "Inactive" : "Expired"}</Badge>
                    : <Badge variant="outline" className="bg-emerald-500/30 text-emerald-300 border-transparent">Active</Badge>}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => toggleActive(d)}><Power className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => remove(d)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white/10 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white"><Percent className="h-4 w-4 text-indigo-400" />{editing ? "Edit discount" : "New discount"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2"><Label className="text-white/85">Customer email</Label><Input type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
            <div className="space-y-1 col-span-2"><Label className="text-white/85">Customer name</Label><Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
            <div className="space-y-1">
              <Label className="text-white/85">Type</Label>
              <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v as "percentage" | "fixed" })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/20">
                  <SelectItem value="percentage" className="text-white">Percentage</SelectItem>
                  <SelectItem value="fixed" className="text-white">Fixed amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-white/85">{form.discount_type === "percentage" ? "Percent (e.g. 20)" : "Amount in $"}</Label>
              <Input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-1 col-span-2"><Label className="text-white/85">Reason</Label><Input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Loyal customer, Birthday, Referral…" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
            <div className="space-y-1 col-span-2"><Label className="text-white/85">Valid until (optional)</Label><Input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700">{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}