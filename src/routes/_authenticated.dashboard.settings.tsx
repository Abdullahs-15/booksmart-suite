import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, type Business } from "@/types";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — BookSmart" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { business } = useMyBusiness();
  const [form, setForm] = useState<Business | null>(null);

  useEffect(() => { if (business) setForm(business); }, [business]);

  if (!form) return <div className="text-sm text-white/60">Loading…</div>;

  const link = typeof window !== "undefined" ? `${window.location.origin}/book/${form.slug}` : `/book/${form.slug}`;

  async function save() {
    if (!form) return;
    const { error } = await supabase.from("businesses").update({
      name: form.name, description: form.description, category: form.category,
      phone: form.phone, address: form.address, avatar_url: form.avatar_url,
    }).eq("id", form.id);
    if (error) toast.error(error.message); else toast.success("Saved");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-white/70">Manage your business profile and booking link.</p>
      </div>
      <Card className="p-5 rounded-xl glass glass-strong border-white/20">
        <Label className="text-white/85">Your booking link</Label>
        <div className="mt-2 flex gap-2">
          <Input readOnly value={link} className="bg-white/10 border-white/20 text-white" />
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button>
          <a href={`/book/${form.slug}`} target="_blank" rel="noreferrer"><Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20"><ExternalLink className="h-4 w-4" /></Button></a>
        </div>
      </Card>
      <Card className="p-5 rounded-xl space-y-4 glass glass-strong border-white/20">
        <div className="space-y-2"><Label className="text-white/85">Business name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
        <div className="space-y-2"><Label className="text-white/85">Description</Label><Textarea value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-white/85">Category</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">{CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label className="text-white/85">Phone</Label><Input value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
        </div>
        <div className="space-y-2"><Label className="text-white/85">Address</Label><Input value={form.address ?? ""} onChange={e => setForm({ ...form, address: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
        <div className="space-y-2"><Label className="text-white/85">Avatar URL</Label><Input value={form.avatar_url ?? ""} onChange={e => setForm({ ...form, avatar_url: e.target.value })} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" /></div>
        <Button onClick={save} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700">Save changes</Button>
      </Card>
    </div>
  );
}