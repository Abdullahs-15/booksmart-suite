import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, LayoutDashboard, CalendarDays, Scissors, Clock, BarChart3, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/dashboard/services", label: "Services", icon: Scissors },
  { to: "/dashboard/availability", label: "Availability", icon: Clock },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

function AuthLayout() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { business } = useMyBusiness();
  const pathname = useRouterState({ select: r => r.location.pathname });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <aside className="lg:w-64 lg:fixed lg:inset-y-0 border-b lg:border-b-0 lg:border-r border-border bg-card flex lg:flex-col">
        <div className="px-5 h-16 flex items-center gap-2 font-semibold border-b border-border lg:w-full">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span>
          BookSmart
        </div>
        <nav className="flex lg:flex-col gap-1 p-2 overflow-x-auto lg:overflow-visible flex-1">
          {NAV.map(item => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap",
                active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border lg:block hidden">
          <div className="text-xs text-muted-foreground mb-2 truncate">{business?.name ?? "—"}</div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 lg:ml-64">
        <div className="max-w-6xl mx-auto p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}