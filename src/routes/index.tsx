import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Bell, CreditCard, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BookSmart — Online booking for modern service businesses" },
      { name: "description", content: "BookSmart helps salons, coaches, and consultants take online appointments and deposits in minutes." },
      { property: "og:title", content: "BookSmart" },
      { property: "og:description", content: "Online booking for modern service businesses." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground glow-primary"><Sparkles className="h-4 w-4" /></span>
            BookSmart
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Log in</Button></Link>
            <Link to="/signup"><Button className="bg-gradient-primary glow-primary hover:glow-primary-strong transition-smooth">Start free</Button></Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-24 text-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary glow-primary">
            Free during beta
          </span>
          <h1 className="mt-6 text-5xl sm:text-6xl font-bold tracking-tight">The booking platform for <span className="bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">modern service businesses</span></h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">Accept appointments and deposits online. Set your hours once, share your link, and let BookSmart fill your calendar.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/signup"><Button size="lg" className="bg-gradient-primary glow-primary hover:glow-primary-strong transition-smooth">Start for free</Button></Link>
            <a href="#features"><Button size="lg" variant="outline">See how it works</Button></a>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16 grid sm:grid-cols-3 gap-4">
        {[
          { Icon: Calendar, t: "Online Bookings", d: "A beautiful booking page customers can use from any device, 24/7." },
          { Icon: Bell, t: "Automated Reminders", d: "Email confirmations that cut no-shows and keep customers in the loop." },
          { Icon: CreditCard, t: "Stripe Payments", d: "Collect deposits up front. Funds land directly in your Stripe account." },
        ].map(({ Icon, t, d }) => (
          <Card key={t} className="p-6 rounded-xl">
            <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground inline-flex items-center justify-center"><Icon className="h-5 w-5" /></div>
            <h3 className="mt-4 font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-center">How it works</h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {[
            { n: 1, t: "Create your page", d: "Sign up, add your services, and set your weekly hours." },
            { n: 2, t: "Share your link", d: "Drop your /book link on Instagram, your website, or in DMs." },
            { n: 3, t: "Get booked & paid", d: "Customers book a slot and pay a deposit. You get a notification." },
          ].map(s => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-6">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center text-sm font-semibold">{s.n}</div>
              <h3 className="mt-4 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid sm:grid-cols-3 gap-4">
        {[
          { q: "I replaced three apps with BookSmart. My Sundays are mine again.", a: "Maya R.", role: "Owner, Luxe Hair Studio" },
          { q: "Deposits cut my no-show rate in half. Setup took ten minutes.", a: "Daniel K.", role: "Personal Trainer" },
          { q: "My students just click a link and book. No more back-and-forth.", a: "Priya S.", role: "Math Tutor" },
        ].map(t => (
          <Card key={t.a} className="p-6 rounded-xl">
            <p className="text-sm">"{t.q}"</p>
            <p className="mt-4 text-sm font-medium">{t.a}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-md px-6 py-16">
        <Card className="p-8 rounded-xl border-2 border-primary/30 glow-primary">
          <p className="text-sm font-medium text-primary">Beta</p>
          <h3 className="mt-1 text-3xl font-bold">Free during beta</h3>
          <p className="mt-1 text-sm text-muted-foreground">Everything you need, no card required.</p>
          <ul className="mt-6 space-y-2 text-sm">
            {["Unlimited bookings","Custom booking page","Stripe deposits","Email confirmations","Analytics dashboard","Mobile-friendly"].map(f => (
              <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-[color:var(--success)]" />{f}</li>
            ))}
          </ul>
          <Link to="/signup" className="block mt-6"><Button className="w-full bg-gradient-primary glow-primary hover:glow-primary-strong transition-smooth" size="lg">Start for free</Button></Link>
        </Card>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> BookSmart</div>
          <p>© {new Date().getFullYear()} BookSmart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
