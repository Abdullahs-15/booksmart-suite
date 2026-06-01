import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, CreditCard, Check, Sparkles, Plus, ArrowUp, Globe } from "lucide-react";
import { useState } from "react";
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
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    { q: "What is BookSmart?", a: "BookSmart is a beautifully simple booking platform for salons, coaches and independent service businesses. Your customers book in seconds from any device." },
    { q: "How does BookSmart work?", a: "Sign up, add your services and weekly hours, then share your /book link. Customers pick a time, pay a deposit and you both get a confirmation." },
    { q: "Can I export my data?", a: "Yes — bookings, customers and revenue can be exported as CSV from the analytics dashboard at any time." },
    { q: "Is there a free trial?", a: "BookSmart is completely free during beta — no credit card required." },
  ];

  return (
    <div className="light-surface">
      {/* Nav */}
      <header className="sticky top-4 z-20 mx-auto max-w-6xl px-4">
        <div className="glass-light flex items-center justify-between px-4 sm:px-6 h-14 rounded-full">
          <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-orange text-white shadow-sm"><Sparkles className="h-4 w-4" /></span>
            <span className="hidden sm:inline">BookSmart</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-mid">
            <a href="#features" className="accent-orange font-medium">Product</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="hidden sm:inline-flex h-9 w-9 rounded-full items-center justify-center text-ink-mid hover:bg-black/5" aria-label="Language"><Globe className="h-4 w-4" /></button>
            <Link to="/login"><Button variant="ghost" className="text-ink hover:bg-black/5 rounded-full h-9 px-4">Log in</Button></Link>
            <Link to="/signup"><Button className="bg-ink text-white hover:bg-black rounded-full h-9 px-5" style={{ backgroundColor: "#0a0a0a" }}>Start Booking</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full opacity-60"
             style={{ background: "radial-gradient(closest-side, rgba(255,213,170,0.7), transparent 70%)" }} />
        <div className="relative mx-auto max-w-3xl px-6 pt-24 sm:pt-32 pb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-black/5 px-3 py-1 text-xs font-medium shadow-sm">
            <span className="rounded-full bg-lime-300 text-lime-900 px-2 py-0.5 text-[10px] font-semibold tracking-wide">NEW</span>
            <span className="text-ink-mid">Stripe deposits now live</span>
          </span>
          <h1 className="mt-6 text-5xl sm:text-7xl font-bold tracking-tight text-ink leading-[1.02]">
            Book with BookSmart
          </h1>
          <p className="mt-6 text-lg text-ink-mid max-w-xl mx-auto leading-relaxed">
            BookSmart lets service businesses take online appointments in minutes. An airy, minimalist workspace designed for seamless customer booking.
          </p>

          {/* Prompt-style CTA card */}
          <div className="mt-10 mx-auto max-w-2xl">
            <div className="glass-light-strong p-5 text-left">
              <p className="text-ink-sub text-sm">Describe the business you want to launch...</p>
              <div className="h-20" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 rounded-full border border-black/10 inline-flex items-center justify-center text-ink-mid hover:bg-black/5" aria-label="Attach"><Plus className="h-4 w-4" /></button>
                  <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 h-9 text-sm text-ink-mid">Plan <span className="inline-block w-7 h-4 rounded-full bg-black/15 relative"><span className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" /></span></span>
                </div>
                <Link to="/signup" aria-label="Get started" className="h-10 w-10 rounded-full bg-ink text-white inline-flex items-center justify-center hover:opacity-90" style={{ backgroundColor: "#0a0a0a" }}>
                  <ArrowUp className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Suggestion chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {["Hair Salon", "Personal Trainer", "Tutor", "Massage Studio"].map(c => (
                <span key={c} className="glass-light px-4 py-2 text-sm text-ink-mid rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 grid sm:grid-cols-3 gap-5">
        {[
          { Icon: Calendar, t: "Online Bookings", d: "A beautiful booking page customers can use from any device, 24/7." },
          { Icon: Bell, t: "Automated Reminders", d: "Email confirmations that cut no-shows and keep customers in the loop." },
          { Icon: CreditCard, t: "Stripe Payments", d: "Collect deposits up front. Funds land directly in your Stripe account." },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="glass-light p-6">
            <div className="h-11 w-11 rounded-2xl inline-flex items-center justify-center bg-orange-100">
              <Icon className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="mt-4 font-semibold text-ink">{t}</h3>
            <p className="mt-1.5 text-sm text-ink-mid leading-relaxed">{d}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-4xl font-bold tracking-tight text-center text-ink">How it works</h2>
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {[
            { n: 1, t: "Create your page", d: "Sign up, add your services, and set your weekly hours." },
            { n: 2, t: "Share your link", d: "Drop your /book link on Instagram, your website, or in DMs." },
            { n: 3, t: "Get booked & paid", d: "Customers book a slot and pay a deposit. You get a notification." },
          ].map(s => (
            <div key={s.n} className="glass-light p-6">
              <div className="h-8 w-8 rounded-full bg-orange-100 inline-flex items-center justify-center text-sm font-semibold text-orange-600">{s.n}</div>
              <h3 className="mt-4 font-semibold text-ink">{s.t}</h3>
              <p className="mt-1.5 text-sm text-ink-mid">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:pt-6">
            <h2 className="text-5xl font-bold tracking-tight text-ink leading-[1.05]">Simple,<br/>transparent<br/>pricing.</h2>
            <p className="mt-6 text-ink-mid max-w-sm">Choose the plan that fits your ambition. No hidden fees.</p>
          </div>

          <PricingCard
            tone="white"
            title="Start with Free"
            price="$0"
            features={["3 Services", "Community support", "Basic booking page"]}
            cta="Get Started"
          />
          <PricingCard
            tone="orange"
            title="Pro"
            badge="POPULAR"
            price="$20"
            features={["Unlimited bookings", "Priority support", "Custom domain", "Advanced integrations"]}
            cta="Upgrade to Pro"
          />
        </div>

        <div className="mt-10 glass-tint-lilac p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-ink">Enterprise needs?</h3>
            <p className="text-ink-mid text-sm mt-1">Custom SLAs, dedicated account management, and more.</p>
          </div>
          <Button className="bg-white text-ink border border-black/10 hover:bg-black/5 rounded-full h-11 px-6">Contact Sales</Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 pb-20 grid sm:grid-cols-3 gap-5">
        {[
          { q: "I replaced three apps with BookSmart. My Sundays are mine again.", a: "Maya R.", role: "Owner, Luxe Hair Studio" },
          { q: "Deposits cut my no-show rate in half. Setup took ten minutes.", a: "Daniel K.", role: "Personal Trainer" },
          { q: "My students just click a link and book. No more back-and-forth.", a: "Priya S.", role: "Math Tutor" },
        ].map(t => (
          <div key={t.a} className="glass-light p-6">
            <p className="text-sm text-ink leading-relaxed">"{t.q}"</p>
            <p className="mt-4 text-sm font-medium text-ink">{t.a}</p>
            <p className="text-xs text-ink-sub">{t.role}</p>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-6 pb-28 grid lg:grid-cols-[1fr_1.4fr] gap-10">
        <h2 className="text-5xl font-bold tracking-tight text-ink leading-[1.05]">Frequently<br/>asked<br/>questions</h2>
        <div className="divide-y divide-black/10">
          {faqs.map((f, i) => (
            <button key={f.q} onClick={() => setOpen(open === i ? null : i)} className="w-full text-left py-5 flex items-start gap-6 group">
              <div className="flex-1">
                <div className="text-lg font-medium text-ink">{f.q}</div>
                <div className={cn("text-sm text-ink-mid overflow-hidden transition-all", open === i ? "mt-3 max-h-40" : "max-h-0")}>{f.a}</div>
              </div>
              <span className="text-2xl text-ink-mid mt-1 leading-none">{open === i ? "−" : "+"}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/10 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-sub">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 accent-orange" /> <span className="text-ink font-medium">BookSmart</span></div>
          <p>© {new Date().getFullYear()} BookSmart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function PricingCard({ tone, title, price, features, cta, badge }: { tone: "white" | "orange"; title: string; price: string; features: string[]; cta: string; badge?: string }) {
  return (
    <div className={cn("relative p-8", tone === "orange" ? "glass-tint-orange" : "glass-light")}>
      {badge && <span className="absolute top-4 right-4 text-[10px] tracking-widest font-semibold text-ink-mid bg-white/70 px-2 py-1 rounded-full">{badge}</span>}
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-6xl font-bold text-ink tracking-tight">{price}</span>
        <span className="text-ink-sub text-sm">/mo</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map(f => (
          <li key={f} className="flex items-center gap-3 text-sm text-ink">
            <Check className="h-4 w-4 text-orange-600" /> {f}
          </li>
        ))}
      </ul>
      <Link to="/signup" className="block mt-8">
        <Button className={cn("w-full rounded-full h-11", tone === "orange" ? "bg-white text-ink hover:bg-white/80" : "bg-ink text-white hover:bg-black/90")}
                style={tone === "orange" ? undefined : { backgroundColor: "#0a0a0a" }}>
          {cta}
        </Button>
      </Link>
    </div>
  );
}
