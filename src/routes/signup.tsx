import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import { CATEGORIES } from "@/types";
import { Sparkles, Check } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — BookSmart" }] }),
  component: SignupPage,
});

async function uniqueSlug(base: string) {
  let slug = base || "business";
  let i = 1;
  while (true) {
    const { data } = await supabase.from("businesses").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i++}`;
  }
}

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", businessName: "", email: "", password: "", category: "Beauty & Wellness",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: auth, error: signErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          data: { full_name: form.fullName },
        },
      });
      if (signErr) throw signErr;
      const user = auth.user;
      if (!user) throw new Error("Account created — check your email to confirm, then log in.");
      const slug = await uniqueSlug(slugify(form.businessName));
      const { data: bizRow, error: bizErr } = await supabase
        .from("businesses")
        .insert({
          owner_id: user.id,
          name: form.businessName,
          slug,
          category: form.category,
        })
        .select("id")
        .single();
      if (bizErr || !bizRow) throw bizErr ?? new Error("Could not create business");
      // Default availability Mon–Fri 9–17, weekends off
      await supabase.from("availability").insert(
        [0,1,2,3,4,5,6].map(d => ({
          business_id: bizRow.id,
          day_of_week: d,
          start_time: "09:00",
          end_time: "17:00",
          is_available: d >= 1 && d <= 5,
        }))
      );
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not sign up";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="light-surface grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-12 text-ink border-r border-black/5" style={{ background: "linear-gradient(160deg, #FFEDD5 0%, #FFE4D1 60%, #FCE7F3 100%)" }}>
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-ink">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-orange text-white shadow-sm"><Sparkles className="h-4 w-4" /></span>
          BookSmart
        </Link>
        <div>
          <h2 className="text-4xl font-bold leading-tight tracking-tight text-ink">Start taking online bookings today.</h2>
          <ul className="mt-8 space-y-3 text-sm text-ink-mid">
            {["A polished booking page in minutes","Stripe deposits, no chargebacks","Cuts no-shows by 50% on average","Free during beta — no card required"].map(b => (
              <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4 text-orange-600" />{b}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-ink-sub">© {new Date().getFullYear()} BookSmart</p>
      </aside>
      <main className="flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md relative">
          <h1 className="text-2xl font-semibold text-ink">Create your account</h1>
          <p className="text-sm text-ink-mid mt-1">Already have one? <Link to="/login" className="accent-orange font-medium">Log in</Link></p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2"><Label className="text-ink">Full name</Label><Input required value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} className="bg-white border-black/10 text-ink" /></div>
            <div className="space-y-2"><Label className="text-ink">Business name</Label><Input required value={form.businessName} onChange={e => setForm(f => ({...f, businessName: e.target.value}))} className="bg-white border-black/10 text-ink" /></div>
            <div className="space-y-2"><Label className="text-ink">Email</Label><Input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className="bg-white border-black/10 text-ink" /></div>
            <div className="space-y-2"><Label className="text-ink">Password</Label><Input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} className="bg-white border-black/10 text-ink" /></div>
            <div className="space-y-2">
              <Label className="text-ink">Business category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger className="bg-white border-black/10 text-ink"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full rounded-full h-11" style={{ backgroundColor: "#0a0a0a", color: "white" }} disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </form>
        </div>
      </main>
    </div>
  );
}