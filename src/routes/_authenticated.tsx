import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, useMyBusiness } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, LayoutDashboard, CalendarDays, Scissors, Clock, ChartBar as BarChart3, Settings, LogOut, Percent } from "lucide-react";
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
  { to: "/dashboard/discounts", label: "Discounts", icon: Percent },
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
    return <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">Loading…</div>;
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:w-64 lg:fixed lg:inset-y-0 border-b lg:border-b-0 lg:border-r border-white/7 bg-black/20 backdrop-blur-xl flex lg:flex-col">
        <div className="px-5 h-16 flex items-center gap-2 font-semibold border-b border-white/7 lg:w-full text-white text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"><Sparkles className="h-4 w-4" /></span>
          BookSmart
        </div>
        <nav className="flex lg:flex-col gap-1 p-3 overflow-x-auto lg:overflow-visible flex-1">
          {NAV.map(item => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to} className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm whitespace-nowrap transition-all duration-150 relative",
                active
                  ? "bg-indigo-500/20 text-white font-medium lg:border-l-[3px] lg:border-indigo-500 pl-[10px] shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/90"
              )}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/7 lg:block hidden">
          <div className="text-xs text-white/40 mb-2 truncate">{business?.name ?? "—"}</div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-300/60 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-[10px] transition-colors duration-150">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto p-6 lg:p-10 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}