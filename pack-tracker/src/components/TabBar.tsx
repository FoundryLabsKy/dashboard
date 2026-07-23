import { motion } from "framer-motion";

export type Tab = "home" | "stats" | "timeline" | "settings";

const TABS: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: "home",
    label: "Home",
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3.5 10.6 12 3.5l8.5 7.1V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9.4Z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "stats",
    label: "Stats",
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="12" width="3.6" height="8" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" />
        <rect x="10.2" y="7" width="3.6" height="13" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" />
        <rect x="16.4" y="4" width="3.6" height="16" rx="1" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M12 7.5V12l3 2"
          stroke={active ? "var(--ios-card)" : "currentColor"}
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (active) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Zm8-.15-1.87-.48a6.9 6.9 0 0 0-.6-1.45l.98-1.66-1.87-1.87-1.66.98c-.46-.26-.94-.46-1.45-.6L13.05 1.5h-2.1l-.48 1.87c-.5.14-.99.34-1.45.6l-1.66-.98-1.87 1.87.98 1.66c-.26.46-.46.94-.6 1.45L4 8.45v2.1l1.87.48c.14.5.34.99.6 1.45l-.98 1.66 1.87 1.87 1.66-.98c.46.26.94.46 1.45.6l.48 1.87h2.1l.48-1.87c.5-.14.99-.34 1.45-.6l1.66.98 1.87-1.87-.98-1.66c.26-.46.46-.94.6-1.45l1.87-.48v-2.1Z"
          transform="translate(1.5 1.5) scale(0.875)"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

interface TabBarProps {
  tab: Tab;
  onChange: (tab: Tab) => void;
}

export default function TabBar({ tab, onChange }: TabBarProps) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-bg-elevated pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <motion.button
              key={t.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => onChange(t.id)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[50px] flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 ${
                active ? "text-accent" : "text-label-tertiary"
              }`}
            >
              {t.icon(active)}
              <span className="text-[10px] font-medium tracking-[0.01em]">{t.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
