import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Shield, Users } from "lucide-react";

const tabs = [
  { to: "/", label: "Sorteo", icon: CalendarDays, ocid: "nav.sorteo" },
  { to: "/equipos", label: "Equipos", icon: Users, ocid: "nav.equipos" },
  { to: "/admin", label: "Admin", icon: Shield, ocid: "nav.admin" },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      data-ocid="nav.panel"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/40 bg-primary pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                data-ocid={tab.ocid}
                activeOptions={{ exact: tab.to === "/" }}
                className="group flex min-h-[56px] flex-col items-center justify-center gap-1 px-2 py-2 text-primary-foreground/70 transition-colors hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                activeProps={{
                  className: "text-accent",
                  "aria-current": "page",
                }}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header
        data-ocid="app.header"
        className="sticky top-0 z-30 border-b border-primary/40 bg-primary pitch-lines"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="label-programme text-primary-foreground/60">
              Sorteo de partidos
            </p>
            <h1 className="truncate font-display text-xl font-bold tracking-tight text-primary-foreground">
              Jornada
            </h1>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-3 py-1 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-accent-foreground">
            Directo
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-5">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-md px-4 pb-24 pt-2 text-center">
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted-foreground",
            "transition-colors hover:text-foreground",
          )}
        >
          © {new Date().getFullYear()}. Built with love using caffeine.ai
        </a>
      </footer>

      <BottomNav />
    </div>
  );
}
