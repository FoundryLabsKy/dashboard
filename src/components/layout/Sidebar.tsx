"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCompanies } from "@/hooks/useCompanies";
import {
  IconArchive,
  IconChat,
  IconChecklist,
  IconDollar,
  IconGrid,
  IconHammer,
  IconLock,
  IconSliders,
  IconX,
} from "@/components/ui/Icons";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: IconGrid },
  { href: "/app/todo", label: "To-Do", icon: IconChecklist },
  { href: "/app/built", label: "Built", icon: IconHammer },
  { href: "/app/talks", label: "In Talks", icon: IconChat },
  { href: "/app/income", label: "Income", icon: IconDollar },
  { href: "/app/archived", label: "Archived", icon: IconArchive },
  { href: "/app/settings", label: "Settings", icon: IconSliders },
];

const FUTURE_MODULES = [
  "CRM",
  "AI Assistant",
  "Tasks",
  "Website Analytics",
  "Client Communications",
  "Hosting Management",
  "Domain Management",
  "Revenue Reports",
  "Team Management",
  "Invoicing",
  "Calendar",
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/app")
    return pathname === "/app" || pathname.startsWith("/app/company");
  return pathname.startsWith(href);
}

function Wordmark() {
  return (
    <Link href="/app" className="block px-3 pt-1">
      <span className="font-display text-xl font-bold tracking-tight text-ink">
        Foundry
        <span className="text-ember">.</span>
      </span>
      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
        Labs OS
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className={`relative ${active ? "text-ember" : ""}`}>
              <Icon />
            </span>
            <span className="relative">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function FutureModules() {
  return (
    <div className="mt-8">
      <p className="px-3 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
        Coming soon
      </p>
      <ul className="mt-2 flex flex-col">
        {FUTURE_MODULES.map((name) => (
          <li key={name}>
            <span
              title="Coming soon"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] text-faint/70"
            >
              <IconLock className="h-3.5 w-3.5 opacity-60" />
              {name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DemoBadge() {
  const { mode } = useCompanies();
  if (mode !== "demo") return null;
  return (
    <div
      className="mx-1 mt-6 rounded-xl border border-ember/25 bg-ember/[0.06] px-3 py-2.5"
      title="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to connect Supabase."
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">Demo mode</p>
      <p className="mt-1 text-[11px] leading-snug text-muted">
        Data lives in this browser. Connect Supabase to sync.
      </p>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <Wordmark />
      <NavList onNavigate={onNavigate} />
      <FutureModules />
      <div className="flex-1" />
      <DemoBadge />
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduced = useReducedMotion() ?? false;

  return (
    <>
      {/* Desktop: floating glass panel */}
      <aside className="fixed top-4 bottom-4 left-4 z-40 hidden w-60 lg:block">
        <div className="glass h-full">
          <SidebarBody />
        </div>
      </aside>

      {/* Mobile: top bar + slide-in drawer */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/app" className="font-display text-lg font-bold tracking-tight">
          Foundry<span className="text-ember">.</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="glass flex h-10 w-10 items-center justify-center !rounded-xl text-muted"
        >
          <IconGrid />
        </button>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-[55] bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed top-0 bottom-0 left-0 z-[60] w-72 lg:hidden"
              initial={reduced ? { opacity: 0 } : { x: "-100%" }}
              animate={reduced ? { opacity: 1 } : { x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
            >
              <div className="glass h-full !rounded-l-none">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="absolute top-4 right-4 z-10 text-muted hover:text-ink"
                >
                  <IconX />
                </button>
                <SidebarBody onNavigate={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
