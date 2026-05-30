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
      const { error: bizErr } = await supabase.from("businesses").insert({
        owner_id: user.id,
        name: form.businessName,
        slug,
        category: form.category,
      });
      if (bizErr) throw bizErr;
      // Default availability Mon–Fri 9–17
      await supabase.from("availability").insert(
        [0,1,2,3,4,5,6].map(d => ({
          business_id: (await supabase.from("businesses").select("id").eq("slug", slug).single()).data?.id,
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
    <div className="min-h-screen grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><Sparkles className="h-4 w-4" /></span>
          BookSmart
        </Link>
        <div>
          <h2 className="text-3xl font-semibold leading-tight">Start taking online bookings today.</h2>
          <ul className="mt-8 space-y-3 text-sm">
            {["A polished booking page in minutes","Stripe deposits, no chargebacks","Cuts no-shows by 50% on average","Free during beta — no card required"].map(b => (
              <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4" />{b}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-70">© {new Date().getFullYear()} BookSmart</p>
      </aside>
      <main className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Already have one? <Link to="/login" className="text-primary font-medium">Log in</Link></p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2"><Label>Full name</Label><Input required value={form.fullName} onChange={e => setForm(f => ({...f, fullName: e.target.value}))} /></div>
            <div className="space-y-2"><Label>Business name</Label><Input required value={form.businessName} onChange={e => setForm(f => ({...f, businessName: e.target.value}))} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} /></div>
            <div className="space-y-2">
              <Label>Business category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </form>
        </div>
      </main>
    </div>
  );
}