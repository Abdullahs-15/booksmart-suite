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

  if (!form) return <div className="text-sm text-muted-foreground">Loading…</div>;

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
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your business profile and booking link.</p>
      </div>
      <Card className="p-5 rounded-xl">
        <Label>Your booking link</Label>
        <div className="mt-2 flex gap-2">
          <Input readOnly value={link} />
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(link); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button>
          <a href={`/book/${form.slug}`} target="_blank" rel="noreferrer"><Button variant="outline"><ExternalLink className="h-4 w-4" /></Button></a>
        </div>
      </Card>
      <Card className="p-5 rounded-xl space-y-4">
        <div className="space-y-2"><Label>Business name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Description</Label><Textarea value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>Address</Label><Input value={form.address ?? ""} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div className="space-y-2"><Label>Avatar URL</Label><Input value={form.avatar_url ?? ""} onChange={e => setForm({ ...form, avatar_url: e.target.value })} /></div>
        <Button onClick={save}>Save changes</Button>
      </Card>
    </div>
  );
}