import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Bell, CreditCard, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen text-white">
      <header className="border-b border-white/7 bg-white/[0.02] backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-white text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"><Sparkles className="h-4 w-4" /></span>
            BookSmart
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Log in</Button></Link>
            <Link to="/signup"><Button size="default">Start free</Button></Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.08] via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.35),transparent)] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/10 backdrop-blur-sm px-4 py-1.5 text-xs text-indigo-300 font-medium">
            Free during beta
          </span>
          <h1 className="mt-6 text-5xl sm:text-6xl font-bold tracking-tight text-white">The booking platform for <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">modern service businesses</span></h1>
          <p className="mt-5 text-lg text-white/65 max-w-2xl mx-auto leading-relaxed">Accept appointments and deposits online. Set your hours once, share your link, and let BookSmart fill your calendar.</p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/signup"><Button size="lg">Start for free</Button></Link>
            <a href="#features"><Button size="lg" variant="outline">See how it works</Button></a>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16 grid sm:grid-cols-3 gap-5">
        {[
          { Icon: Calendar, t: "Online Bookings", d: "A beautiful booking page customers can use from any device, 24/7.", color: "cyan" },
          { Icon: Bell, t: "Automated Reminders", d: "Email confirmations that cut no-shows and keep customers in the loop.", color: "indigo" },
          { Icon: CreditCard, t: "Stripe Payments", d: "Collect deposits up front. Funds land directly in your Stripe account.", color: "violet" },
        ].map(({ Icon, t, d, color }) => (
          <Card key={t} className="p-6 relative overflow-hidden">
            {color === "cyan" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />}
            {color === "indigo" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />}
            {color === "violet" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />}
            <div className={cn(
              "h-11 w-11 rounded-xl inline-flex items-center justify-center",
              color === "cyan" && "bg-cyan-500/15",
              color === "indigo" && "bg-indigo-500/15",
              color === "violet" && "bg-violet-500/15"
            )}>
              <Icon className={cn("h-5 w-5", color === "cyan" && "text-cyan-400", color === "indigo" && "text-indigo-400", color === "violet" && "text-violet-400")} />
            </div>
            <h3 className="mt-4 font-semibold text-white">{t}</h3>
            <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{d}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-center text-white">How it works</h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-5">
          {[
            { n: 1, t: "Create your page", d: "Sign up, add your services, and set your weekly hours." },
            { n: 2, t: "Share your link", d: "Drop your /book link on Instagram, your website, or in DMs." },
            { n: 3, t: "Get booked & paid", d: "Customers book a slot and pay a deposit. You get a notification." },
          ].map(s => (
            <div key={s.n} className="glass-dark p-6">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 inline-flex items-center justify-center text-sm font-semibold text-indigo-300">{s.n}</div>
              <h3 className="mt-4 font-semibold text-white">{s.t}</h3>
              <p className="mt-1.5 text-sm text-white/60">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 grid sm:grid-cols-3 gap-5">
        {[
          { q: "I replaced three apps with BookSmart. My Sundays are mine again.", a: "Maya R.", role: "Owner, Luxe Hair Studio" },
          { q: "Deposits cut my no-show rate in half. Setup took ten minutes.", a: "Daniel K.", role: "Personal Trainer" },
          { q: "My students just click a link and book. No more back-and-forth.", a: "Priya S.", role: "Math Tutor" },
        ].map(t => (
          <Card key={t.a} className="p-6">
            <p className="text-sm text-white/85 leading-relaxed">"{t.q}"</p>
            <p className="mt-4 text-sm font-medium text-white">{t.a}</p>
            <p className="text-xs text-white/50">{t.role}</p>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-md px-6 py-16">
        <Card className="p-8 relative overflow-hidden border-indigo-500/30">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <p className="text-sm font-medium text-indigo-400">Beta</p>
          <h3 className="mt-1 text-3xl font-bold text-white">Free during beta</h3>
          <p className="mt-1 text-sm text-white/60">Everything you need, no card required.</p>
          <ul className="mt-6 space-y-2.5 text-sm text-white/85">
            {["Unlimited bookings","Custom booking page","Stripe deposits","Email confirmations","Analytics dashboard","Mobile-friendly"].map(f => (
              <li key={f} className="flex items-center gap-2.5"><Check className="h-4 w-4 text-emerald-400" />{f}</li>
            ))}
          </ul>
          <Link to="/signup" className="block mt-6"><Button className="w-full" size="lg">Start for free</Button></Link>
        </Card>
      </section>

      <footer className="border-t border-white/7 bg-black/20 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-white/60" /> <span className="text-white/60 font-medium">BookSmart</span></div>
          <p>© {new Date().getFullYear()} BookSmart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
