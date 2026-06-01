import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — BookSmart" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="light-surface flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 font-semibold text-ink text-lg">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-orange text-white shadow-sm"><Sparkles className="h-4 w-4" /></span>
          BookSmart
        </Link>
        <div className="glass-light-strong p-8">
          <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
          <p className="text-sm text-ink-mid mt-1">Log in to your BookSmart dashboard.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-ink">Email</Label>
              <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-white border-black/10 text-ink" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-ink">Password</Label>
                <button type="button" className="text-xs text-ink-sub hover:accent-orange" onClick={() => toast.info("Password reset coming soon.")}>Forgot?</button>
              </div>
              <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-white border-black/10 text-ink" />
            </div>
            <Button type="submit" className="w-full rounded-full h-11" style={{ backgroundColor: "#0a0a0a", color: "white" }} disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
          </form>
          <p className="text-sm text-ink-mid mt-6 text-center">
            No account? <Link to="/signup" className="accent-orange font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}