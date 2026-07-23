/**
 * Ledger — personal spending tracker, styled to the iOS Human Interface
 * Guidelines: semantic color roles (light/dark), SF system type scale,
 * inset grouped layout with concentric radii (28 card → 16 padding → 12
 * inner), glass on the navigation layer only, and spring-driven motion
 * (zero bounce by default, touch-down response, velocity projection).
 * The entire app lives in this file. Data persists in localStorage;
 * categorization runs client-side against the Anthropic API.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import Anthropic from "@anthropic-ai/sdk";

/* ---------------------------------- data ---------------------------------- */

type Purchase = {
  id: string;
  name: string;
  price: number;
  category: string;
  ts: string; // ISO timestamp
};

type Favorite = { id: string; name: string; price: number };

type Settings = {
  budget: number;
  currency: string;
  apiKey: string;
};

const CATEGORIES = [
  "Food",
  "Drinks",
  "Groceries",
  "Transport",
  "Entertainment",
  "Shopping",
  "Subscriptions",
  "Health",
] as const;

const UNCATEGORIZED = "Uncategorized";
const ALL_CATEGORIES = [...CATEGORIES, UNCATEGORIZED];

// Data palette lives in CSS custom properties so each appearance mode gets
// hues validated for its surface. Uncategorized/Other are neutral, not hues.
const CATEGORY_COLOR: Record<string, string> = {
  Food: "var(--cat-food)",
  Drinks: "var(--cat-drinks)",
  Groceries: "var(--cat-groceries)",
  Transport: "var(--cat-transport)",
  Entertainment: "var(--cat-entertainment)",
  Shopping: "var(--cat-shopping)",
  Subscriptions: "var(--cat-subscriptions)",
  Health: "var(--cat-health)",
  [UNCATEGORIZED]: "var(--cat-none)",
  Other: "var(--cat-other)",
};

const CURRENCIES = ["USD", "KYD", "EUR", "GBP", "CAD", "AUD", "JPY"];

const DEFAULT_SETTINGS: Settings = { budget: 2000, currency: "USD", apiKey: "" };

const DEFAULT_FAVORITES: Favorite[] = [
  { id: "fav-coffee", name: "Coffee", price: 5.5 },
  { id: "fav-lunch", name: "Lunch", price: 14 },
  { id: "fav-water", name: "Bottled water", price: 2 },
];

const LS = {
  purchases: "spending.purchases.v1",
  favorites: "spending.favorites.v1",
  settings: "spending.settings.v1",
  categoryCache: "spending.categoryCache.v1",
};

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const normName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/* --------------------------------- motion ---------------------------------- */

// Springs, never duration curves: zero bounce by default.
const SPRING_PRESS = { type: "spring", duration: 0.2, bounce: 0 } as const;
const SPRING_SETTLE = { type: "spring", duration: 0.35, bounce: 0 } as const;
const SPRING_SHEET = { type: "spring", duration: 0.5, bounce: 0 } as const;

// iOS momentum projection: decelerationRate 0.998 →
// projected = offset + (v/1000) * (rate / (1 - rate)) ≈ offset + v * 0.499
const project = (offset: number, velocity: number) => offset + velocity * 0.499;

const tapHaptic = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(10);
  }
};

/* ------------------------------ AI categorizer ----------------------------- */

const CATEGORY_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: [...CATEGORIES] },
        },
        required: ["name", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["items"],
  additionalProperties: false,
};

async function categorizeWithClaude(
  names: string[],
  apiKey: string,
): Promise<Record<string, string>> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: CATEGORY_SCHEMA },
    },
    system:
      "You categorize personal purchase items into exactly one spending category each. " +
      `Allowed categories: ${CATEGORIES.join(", ")}. ` +
      "Prepared meals and snacks are Food; coffee, alcohol and other beverages are Drinks; " +
      "supermarket runs are Groceries; recurring services (Netflix, Spotify, gym, iCloud) are Subscriptions.",
    messages: [
      {
        role: "user",
        content: `Categorize these purchase items:\n${JSON.stringify(names)}`,
      },
    ],
  });
  if (response.stop_reason === "refusal") throw new Error("categorization refused");
  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  const parsed = JSON.parse(text) as { items: { name: string; category: string }[] };
  const map: Record<string, string> = {};
  for (const item of parsed.items) {
    if ((CATEGORIES as readonly string[]).includes(item.category)) {
      map[normName(item.name)] = item.category;
    }
  }
  return map;
}

/* -------------------------------- store hook ------------------------------- */

function useSpendingStore() {
  const [loaded, setLoaded] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>(DEFAULT_FAVORITES);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [categoryCache, setCategoryCache] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setPurchases(loadLS<Purchase[]>(LS.purchases, []));
      setFavorites(loadLS<Favorite[]>(LS.favorites, DEFAULT_FAVORITES));
      setSettings({ ...DEFAULT_SETTINGS, ...loadLS<Partial<Settings>>(LS.settings, {}) });
      setCategoryCache(loadLS<Record<string, string>>(LS.categoryCache, {}));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(LS.purchases, JSON.stringify(purchases));
  }, [loaded, purchases]);
  useEffect(() => {
    if (loaded) localStorage.setItem(LS.favorites, JSON.stringify(favorites));
  }, [loaded, favorites]);
  useEffect(() => {
    if (loaded) localStorage.setItem(LS.settings, JSON.stringify(settings));
  }, [loaded, settings]);
  useEffect(() => {
    if (loaded) localStorage.setItem(LS.categoryCache, JSON.stringify(categoryCache));
  }, [loaded, categoryCache]);

  const inFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!loaded || !settings.apiKey) return;
    const pending = [
      ...new Set(
        purchases
          .filter((p) => p.category === UNCATEGORIZED)
          .map((p) => normName(p.name))
          .filter((n) => !categoryCache[n] && !inFlight.current.has(n)),
      ),
    ];
    if (pending.length === 0) return;
    pending.forEach((n) => inFlight.current.add(n));
    const timer = setTimeout(async () => {
      try {
        const map = await categorizeWithClaude(pending, settings.apiKey);
        setCategoryCache((prev) => ({ ...map, ...prev }));
        setPurchases((prev) =>
          prev.map((p) =>
            p.category === UNCATEGORIZED && map[normName(p.name)]
              ? { ...p, category: map[normName(p.name)] }
              : p,
          ),
        );
      } catch {
        // Leave items as Uncategorized; the app keeps working without AI.
      } finally {
        pending.forEach((n) => inFlight.current.delete(n));
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [loaded, purchases, settings.apiKey, categoryCache]);

  const addPurchase = useCallback(
    (name: string, price: number) => {
      const cached = categoryCache[normName(name)];
      const purchase: Purchase = {
        id: uid(),
        name: name.trim(),
        price,
        category: cached ?? UNCATEGORIZED,
        ts: new Date().toISOString(),
      };
      setPurchases((prev) => [purchase, ...prev]);
      return purchase;
    },
    [categoryCache],
  );

  const removePurchase = useCallback((id: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updatePurchase = useCallback(
    (id: string, patch: Partial<Pick<Purchase, "name" | "price" | "category">>) => {
      setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      if (patch.category && patch.category !== UNCATEGORIZED) {
        const target = purchases.find((p) => p.id === id);
        const cacheName = patch.name ?? target?.name;
        if (cacheName) {
          setCategoryCache((cache) => ({
            ...cache,
            [normName(cacheName)]: patch.category!,
          }));
        }
      }
    },
    [purchases],
  );

  return {
    loaded,
    purchases,
    favorites,
    setFavorites,
    settings,
    setSettings,
    addPurchase,
    removePurchase,
    updatePurchase,
  };
}

/* -------------------------------- utilities -------------------------------- */

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

function dayLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (sameDay(d, now)) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/* ----------------------------- shared components ---------------------------- */

function AnimatedMoney({
  value,
  currency,
  className,
}: {
  value: number;
  currency: string;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (reduced || prev.current === value) {
      prev.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(prev.current, value, {
      type: "spring",
      duration: 0.7,
      bounce: 0,
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduced]);

  return (
    <span className={`tabular ${className ?? ""}`}>{formatMoney(display, currency)}</span>
  );
}

function CategoryDot({ category }: { category: string }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: CATEGORY_COLOR[category] ?? CATEGORY_COLOR.Other }}
    />
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="t-secondary mb-2 px-5 text-[13px] font-normal uppercase tracking-[0.06em]">
      {children}
    </h2>
  );
}

function SectionFootnote({ children }: { children: React.ReactNode }) {
  return <p className="t-secondary mt-2 px-5 text-[13px] leading-[1.38]">{children}</p>;
}

const inputClass =
  "bg-fill t-label h-11 w-full rounded-xl px-4 text-[17px] placeholder:t-tertiary focus:outline-none";

/* --------------------------------- home tab -------------------------------- */

function BudgetBar({
  spent,
  budget,
  currency,
}: {
  spent: number;
  budget: number;
  currency: string;
}) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const over = budget > 0 && spent > budget;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="t-secondary text-[13px]">Monthly budget</p>
        <p className="t-secondary tabular text-[13px]">
          <AnimatedMoney
            value={spent}
            currency={currency}
            className={over ? "t-red" : "t-label"}
          />{" "}
          / {formatMoney(budget, currency)}
        </p>
      </div>
      <div className="bg-fill mt-2 h-1.5 overflow-hidden rounded-full">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: over ? "var(--system-red)" : "var(--accent)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={SPRING_SETTLE}
        />
      </div>
      <p className="t-secondary mt-2 text-[13px]">
        {over
          ? `${formatMoney(spent - budget, currency)} over budget this month`
          : `${Math.round(pct)}% of budget used`}
      </p>
    </div>
  );
}

function HomeTab({
  store,
  onAdded,
}: {
  store: ReturnType<typeof useSpendingStore>;
  onAdded: (p: Purchase) => void;
}) {
  const { purchases, favorites, settings, addPurchase } = store;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [tapped, setTapped] = useState<string | null>(null);

  const now = new Date();
  const todayTotal = purchases
    .filter((p) => sameDay(new Date(p.ts), now))
    .reduce((s, p) => s + p.price, 0);
  const monthTotal = purchases
    .filter((p) => sameMonth(new Date(p.ts), now))
    .reduce((s, p) => s + p.price, 0);

  const quickAdd = (fav: Favorite) => {
    setTapped(fav.id);
    setTimeout(() => setTapped(null), 450);
    tapHaptic();
    onAdded(addPurchase(fav.name, fav.price));
  };

  const manualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(price);
    if (!name.trim() || !isFinite(parsed) || parsed <= 0) return;
    onAdded(addPurchase(name, parsed));
    setName("");
    setPrice("");
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="grouped-card p-4">
        <p className="t-secondary px-1 text-[13px] uppercase tracking-[0.06em]">
          Spent today
        </p>
        <AnimatedMoney
          value={todayTotal}
          currency={settings.currency}
          className="t-label mt-1 block px-1 text-[34px] leading-[1.2] font-bold tracking-tight"
        />
        <div className="mt-4 px-1 pb-1">
          <BudgetBar
            spent={monthTotal}
            budget={settings.budget}
            currency={settings.currency}
          />
        </div>
      </section>

      <section>
        <SectionHeader>Quick add</SectionHeader>
        <div className="grouped-card p-4">
          {favorites.length === 0 ? (
            <p className="t-secondary px-1 py-2 text-[15px]">
              Add favorites in Settings for one-tap logging.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {favorites.map((fav) => (
                <motion.button
                  key={fav.id}
                  type="button"
                  onClick={() => quickAdd(fav)}
                  whileTap={{ scale: 0.96 }}
                  transition={SPRING_PRESS}
                  className="bg-fill relative min-h-[60px] overflow-hidden rounded-xl px-4 py-3 text-left"
                >
                  <AnimatePresence>
                    {tapped === fav.id && (
                      <motion.span
                        key="pulse"
                        initial={{ opacity: 0.35, scale: 0 }}
                        animate={{ opacity: 0, scale: 2.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", duration: 0.45, bounce: 0 }}
                        className="pointer-events-none absolute inset-0 rounded-xl"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="t-label block text-[17px] font-normal">
                    {fav.name}
                  </span>
                  <span className="t-secondary tabular mt-0.5 block text-[15px]">
                    {formatMoney(fav.price, settings.currency)}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <SectionHeader>Log a purchase</SectionHeader>
        <form onSubmit={manualAdd} className="grouped-card flex flex-col gap-3 p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What did you buy?"
            aria-label="Item name"
            className={inputClass}
          />
          <div className="flex gap-3">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              aria-label="Price"
              className={`${inputClass} tabular flex-1`}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              transition={SPRING_PRESS}
              className="bg-accent-c h-11 shrink-0 rounded-xl px-6 text-[17px] font-semibold text-white"
            >
              Add
            </motion.button>
          </div>
        </form>
      </section>
    </div>
  );
}

/* ------------------------------- spending tab ------------------------------ */

type Slice = { label: string; value: number; color: string };

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const toXY = (angle: number) => ({
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2),
  });
  const start = toXY(startAngle);
  const end = toXY(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function DonutChart({
  slices,
  total,
  currency,
}: {
  slices: Slice[];
  total: number;
  currency: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const size = 200;
  const r = 78;
  const stroke = 22;
  const pad = total > 0 ? (2 / (2 * Math.PI * r)) * 2 * Math.PI * 1.6 : 0;

  const arcs = slices.map((s, i) => {
    const before = slices.slice(0, i).reduce((sum, x) => sum + x.value, 0);
    const start = (before / total) * Math.PI * 2;
    const sweep = (s.value / total) * Math.PI * 2;
    const a0 = start + pad / 2;
    const a1 = Math.max(a0 + 0.001, start + sweep - pad / 2);
    return { ...s, a0, a1 };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-48 w-48"
      role="img"
      aria-label="Spending by category"
    >
      {arcs.map((arc, i) => (
        <motion.path
          key={arc.label}
          d={arcPath(size / 2, size / 2, r, arc.a0, arc.a1)}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeLinecap="butt"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.7, bounce: 0, delay: i * 0.05 }}
        >
          <title>{`${arc.label}: ${formatMoney(arc.value, currency)}`}</title>
        </motion.path>
      ))}
      <text
        x="50%"
        y="45%"
        textAnchor="middle"
        fill="var(--secondary-label)"
        fontSize="11"
      >
        This month
      </text>
      <text
        x="50%"
        y="57%"
        textAnchor="middle"
        fill="var(--label)"
        fontSize="17"
        fontWeight="600"
        className="tabular"
      >
        {formatMoney(total, currency)}
      </text>
    </svg>
  );
}

function InsightTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="grouped-card flex-1 p-4">
      <p className="t-secondary text-[13px]">{label}</p>
      <p className="t-label mt-1 text-[20px] font-semibold">{value}</p>
      {sub && <p className="t-secondary mt-0.5 text-[13px]">{sub}</p>}
    </div>
  );
}

function HistoryRow({
  purchase,
  currency,
  isLast,
  onEdit,
  onDelete,
}: {
  purchase: Purchase;
  currency: string;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const x = useMotionValue(0);
  const reduced = useReducedMotion() ?? false;
  const OPEN = -88;
  // Hidden at rest so it can't peek through the card's rounded corners,
  // and stretched during overshoot so no gap opens behind the row.
  const actionOpacity = useTransform(x, [-12, -2], [1, 0]);
  const actionWidth = useTransform(x, (v) => `${Math.max(88, -v)}px`);

  const settle = (target: number) =>
    reduced
      ? animate(x, target, { duration: 0 })
      : animate(x, target, { type: "spring", duration: 0.35, bounce: 0 });

  return (
    <li className="relative overflow-hidden">
      {/* Swipe action revealed behind the row */}
      <motion.button
        type="button"
        style={{ opacity: actionOpacity, width: actionWidth }}
        onClick={() => {
          tapHaptic();
          onDelete();
        }}
        className="bg-red-c press-parent absolute inset-y-0 right-0 text-[15px] font-normal text-white"
      >
        <span className="press-label">Delete</span>
      </motion.button>
      <motion.div
        drag="x"
        style={{ x, backgroundColor: "var(--secondary-grouped-background)" }}
        dragConstraints={{ left: OPEN, right: 0 }}
        dragElastic={{ left: 0.15, right: 0.15 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const projected = project(x.get(), info.velocity.x);
          settle(projected < OPEN / 2 ? OPEN : 0);
        }}
        className="relative"
      >
        <button
          type="button"
          onClick={() => {
            if (x.get() < -4) {
              settle(0);
            } else {
              onEdit();
            }
          }}
          className="row-press flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-left"
        >
          <CategoryDot category={purchase.category} />
          <span className="min-w-0 flex-1">
            <span className="t-label block truncate text-[17px]">{purchase.name}</span>
            <span className="t-secondary block text-[13px]">{purchase.category}</span>
          </span>
          <span className="t-secondary tabular text-[17px]">
            {formatMoney(purchase.price, currency)}
          </span>
          <svg
            width="8"
            height="14"
            viewBox="0 0 8 14"
            fill="none"
            stroke="var(--tertiary-label)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M1 1l6 6-6 6" />
          </svg>
        </button>
        {!isLast && <div className="hairline ml-[43px] border-b" />}
      </motion.div>
    </li>
  );
}

function EditSheet({
  purchase,
  currency,
  onSave,
  onClose,
}: {
  purchase: Purchase;
  currency: string;
  onSave: (patch: { name: string; price: number; category: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(purchase.name);
  const [price, setPrice] = useState(String(purchase.price));
  const [category, setCategory] = useState(purchase.category);
  const y = useMotionValue(0);
  const reducedSheet = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Minimal focus trap: keep Tab cycling inside the sheet.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          "button, input, select",
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const current = document.activeElement;
        if (e.shiftKey && (current === first || !panelRef.current.contains(current))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (current === last || !panelRef.current.contains(current))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    const parsed = parseFloat(price);
    if (!name.trim() || !isFinite(parsed) || parsed <= 0) return;
    onSave({ name: name.trim(), price: parsed, category });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.9 }}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const height = panelRef.current?.offsetHeight ?? 480;
          // Projection decides intent: position + velocity, not position alone.
          if (project(info.offset.y, info.velocity.y) > height / 2) {
            onClose();
          } else {
            if (reducedSheet) animate(y, 0, { duration: 0 });
            else animate(y, 0, { type: "spring", duration: 0.4, bounce: 0 });
          }
        }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "110%" }}
        transition={SPRING_SHEET}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit purchase"
        className="w-full max-w-lg rounded-t-[28px] pb-[max(1rem,env(safe-area-inset-bottom))]"
        style={{
          y,
          backgroundColor: "var(--secondary-grouped-background)",
          boxShadow: "var(--sheet-shadow)",
        }}
      >
        {/* Grabber */}
        <div className="flex justify-center pt-2 pb-1" aria-hidden>
          <div className="bg-fill h-[5px] w-9 rounded-full" />
        </div>
        <div className="flex min-h-[44px] items-center justify-between px-4">
          <button
            type="button"
            onClick={onClose}
            className="t-accent pressable min-h-[44px] min-w-[44px] text-left text-[17px]"
          >
            Cancel
          </button>
          <span className="t-label text-[17px] font-semibold">Edit purchase</span>
          <button
            type="button"
            onClick={save}
            className="t-accent pressable min-h-[44px] min-w-[44px] text-right text-[17px] font-semibold"
          >
            Save
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Item name"
            autoFocus
            className={inputClass}
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            aria-label={`Price in ${currency}`}
            className={`${inputClass} tabular`}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Category"
            className="bg-fill t-label h-11 w-full rounded-xl px-3 text-[17px] focus:outline-none"
          >
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SpendingTab({ store }: { store: ReturnType<typeof useSpendingStore> }) {
  const { purchases, settings, updatePurchase, removePurchase } = store;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Purchase | null>(null);

  const [now] = useState(() => new Date());
  const lastMonth = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() - 1, 1),
    [now],
  );

  const thisMonth = useMemo(
    () => purchases.filter((p) => sameMonth(new Date(p.ts), now)),
    [purchases, now],
  );
  const prevMonth = useMemo(
    () => purchases.filter((p) => sameMonth(new Date(p.ts), lastMonth)),
    [purchases, lastMonth],
  );

  const monthTotal = thisMonth.reduce((s, p) => s + p.price, 0);
  const prevTotal = prevMonth.reduce((s, p) => s + p.price, 0);
  const delta = monthTotal - prevTotal;
  const deltaPct = prevTotal > 0 ? (delta / prevTotal) * 100 : null;

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of thisMonth) map.set(p.category, (map.get(p.category) ?? 0) + p.price);
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [thisMonth]);

  const slices: Slice[] = useMemo(() => {
    const top = byCategory.slice(0, 5);
    const rest = byCategory.slice(5).reduce((s, c) => s + c.value, 0);
    const out: Slice[] = top.map((c) => ({
      label: c.label,
      value: c.value,
      color: CATEGORY_COLOR[c.label] ?? CATEGORY_COLOR.Other,
    }));
    if (rest > 0) out.push({ label: "Other", value: rest, color: CATEGORY_COLOR.Other });
    return out;
  }, [byCategory]);

  const insights = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const p of thisMonth) {
      const key = normName(p.name);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { name: p.name, count: 1 });
    }
    const mostBought = [...counts.values()].sort((a, b) => b.count - a.count)[0];
    const biggest = byCategory[0];
    const dailyAvg = monthTotal / now.getDate();
    return { mostBought, biggest, dailyAvg };
  }, [thisMonth, byCategory, monthTotal, now]);

  const history = useMemo(() => {
    const q = normName(search);
    return purchases
      .filter((p) => (filter === "All" ? true : p.category === filter))
      .filter((p) => (q ? normName(p.name).includes(q) : true))
      .sort((a, b) => b.ts.localeCompare(a.ts));
  }, [purchases, search, filter]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: Purchase[] }[] = [];
    for (const p of history) {
      const label = dayLabel(p.ts);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.items.push(p);
      else groups.push({ label, items: [p] });
    }
    return groups;
  }, [history]);

  return (
    <div className="flex flex-col gap-6">
      <section className="grouped-card p-4">
        <div className="flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <p className="t-secondary text-[13px] uppercase tracking-[0.06em]">
              {now.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <AnimatedMoney
              value={monthTotal}
              currency={settings.currency}
              className="t-label mt-1 block text-[34px] leading-[1.2] font-bold tracking-tight"
            />
          </div>
          {prevTotal > 0 && (
            <div className="pb-1 text-right">
              <p
                className={`tabular text-[15px] font-semibold ${delta > 0 ? "t-red" : "t-green"}`}
              >
                {delta > 0 ? "↑" : "↓"} {formatMoney(Math.abs(delta), settings.currency)}
                {deltaPct !== null && ` (${Math.abs(deltaPct).toFixed(0)}%)`}
              </p>
              <p className="t-secondary mt-0.5 text-[13px]">vs last month</p>
            </div>
          )}
        </div>
      </section>

      {slices.length > 0 ? (
        <section>
          <SectionHeader>By category</SectionHeader>
          <div className="grouped-card p-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              <DonutChart slices={slices} total={monthTotal} currency={settings.currency} />
              <ul className="w-full flex-1">
                {byCategory.map((c, i) => (
                  <li key={c.label}>
                    <div className="flex min-h-[36px] items-center gap-2.5 text-[15px]">
                      <CategoryDot category={c.label} />
                      <span className="t-label flex-1 truncate">{c.label}</span>
                      <span className="t-label tabular">
                        {formatMoney(c.value, settings.currency)}
                      </span>
                      <span className="t-secondary tabular w-11 text-right text-[13px]">
                        {monthTotal > 0 ? ((c.value / monthTotal) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                    {i < byCategory.length - 1 && <div className="hairline ml-[22px] border-b" />}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <section className="grouped-card p-6 text-center">
          <p className="t-label text-[17px] font-semibold">No purchases yet</p>
          <p className="t-secondary mt-1 text-[15px]">
            Log your first purchase from the Home tab.
          </p>
        </section>
      )}

      {thisMonth.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <InsightTile
            label="Most bought"
            value={insights.mostBought?.name ?? "—"}
            sub={insights.mostBought ? `${insights.mostBought.count}× this month` : undefined}
          />
          <InsightTile
            label="Biggest category"
            value={insights.biggest?.label ?? "—"}
            sub={
              insights.biggest
                ? formatMoney(insights.biggest.value, settings.currency)
                : undefined
            }
          />
          <InsightTile
            label="Daily average"
            value={formatMoney(insights.dailyAvg, settings.currency)}
            sub="so far this month"
          />
        </div>
      )}

      <section>
        <SectionHeader>History</SectionHeader>
        <div className="mb-3 flex gap-3 px-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search purchases"
            className={inputClass}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by category"
            className="bg-fill t-label h-11 shrink-0 rounded-xl px-3 text-[15px] focus:outline-none"
          >
            <option value="All">All</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {grouped.length === 0 ? (
          <div className="grouped-card p-6 text-center">
            <p className="t-secondary text-[15px]">No purchases match your search.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map((group) => (
              <div key={group.label}>
                <SectionHeader>{group.label}</SectionHeader>
                <ul className="grouped-card overflow-hidden">
                  <AnimatePresence initial={false}>
                    {group.items.map((p, i) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={SPRING_SETTLE}
                      >
                        <HistoryRow
                          purchase={p}
                          currency={settings.currency}
                          isLast={i === group.items.length - 1}
                          onEdit={() => setEditing(p)}
                          onDelete={() => removePurchase(p.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {editing && (
          <EditSheet
            purchase={editing}
            currency={settings.currency}
            onSave={(patch) => updatePurchase(editing.id, patch)}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------- settings tab ------------------------------ */

function SettingsTab({ store }: { store: ReturnType<typeof useSpendingStore> }) {
  const { favorites, setFavorites, settings, setSettings } = store;
  const [favName, setFavName] = useState("");
  const [favPrice, setFavPrice] = useState("");
  const [editingFav, setEditingFav] = useState<string | null>(null);
  const [budgetDraft, setBudgetDraft] = useState(String(settings.budget));
  const [keyDraft, setKeyDraft] = useState(settings.apiKey);
  const [keySaved, setKeySaved] = useState(false);

  const addFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(favPrice);
    if (!favName.trim() || !isFinite(parsed) || parsed <= 0) return;
    if (editingFav) {
      setFavorites(
        favorites.map((f) =>
          f.id === editingFav ? { ...f, name: favName.trim(), price: parsed } : f,
        ),
      );
      setEditingFav(null);
    } else {
      setFavorites([...favorites, { id: uid(), name: favName.trim(), price: parsed }]);
    }
    setFavName("");
    setFavPrice("");
  };

  const saveBudget = () => {
    const parsed = parseFloat(budgetDraft);
    if (isFinite(parsed) && parsed >= 0) setSettings({ ...settings, budget: parsed });
  };

  const saveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({ ...settings, apiKey: keyDraft.trim() });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHeader>Favorites</SectionHeader>
        <ul className="grouped-card overflow-hidden">
          <AnimatePresence initial={false}>
            {favorites.map((fav, i) => (
              <motion.li
                key={fav.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={SPRING_SETTLE}
              >
                <div className="flex min-h-[44px] items-center gap-3 px-4 py-1.5">
                  <span className="t-label min-w-0 flex-1 truncate text-[17px]">
                    {fav.name}
                  </span>
                  <span className="t-secondary tabular text-[17px]">
                    {formatMoney(fav.price, settings.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFav(fav.id);
                      setFavName(fav.name);
                      setFavPrice(String(fav.price));
                    }}
                    className="t-accent pressable min-h-[44px] min-w-[44px] px-2 text-[15px]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setFavorites(favorites.filter((f) => f.id !== fav.id))}
                    className="t-red pressable min-h-[44px] min-w-[44px] px-2 text-[15px]"
                  >
                    Remove
                  </button>
                </div>
                {i < favorites.length - 1 && <div className="hairline ml-4 border-b" />}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <form onSubmit={addFavorite} className="grouped-card mt-3 flex flex-col gap-3 p-4">
          <input
            value={favName}
            onChange={(e) => setFavName(e.target.value)}
            placeholder="Item name"
            aria-label="Favorite name"
            className={inputClass}
          />
          <div className="flex gap-3">
            <input
              value={favPrice}
              onChange={(e) => setFavPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              aria-label="Favorite price"
              className={`${inputClass} tabular flex-1`}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              transition={SPRING_PRESS}
              className="bg-accent-c h-11 shrink-0 rounded-xl px-6 text-[17px] font-semibold text-white"
            >
              {editingFav ? "Save changes" : "Add favorite"}
            </motion.button>
          </div>
          {editingFav && (
            <button
              type="button"
              onClick={() => {
                setEditingFav(null);
                setFavName("");
                setFavPrice("");
              }}
              className="t-accent pressable min-h-[44px] text-[15px]"
            >
              Cancel
            </button>
          )}
        </form>
        <SectionFootnote>
          Favorites appear as one-tap buttons on the Home tab.
        </SectionFootnote>
      </section>

      <section>
        <SectionHeader>Budget and currency</SectionHeader>
        <div className="grouped-card overflow-hidden">
          <label className="flex min-h-[44px] items-center justify-between gap-4 px-4 py-1.5">
            <span className="t-label text-[17px]">Monthly budget</span>
            <input
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              onBlur={saveBudget}
              inputMode="decimal"
              aria-label="Monthly budget"
              className="bg-fill t-label tabular h-11 w-28 rounded-xl px-3 text-right text-[17px] focus:outline-none"
            />
          </label>
          <div className="hairline ml-4 border-b" />
          <label className="flex min-h-[44px] items-center justify-between gap-4 px-4 py-1.5">
            <span className="t-label text-[17px]">Currency</span>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              aria-label="Currency"
              className="bg-fill t-label h-11 rounded-xl px-3 text-[17px] focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section>
        <SectionHeader>AI categorization</SectionHeader>
        <form onSubmit={saveKey} className="grouped-card flex flex-col gap-3 p-4">
          <input
            type="password"
            autoComplete="off"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="sk-ant-…"
            aria-label="Anthropic API key"
            className={inputClass}
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            transition={SPRING_PRESS}
            className="bg-accent-c h-11 rounded-xl text-[17px] font-semibold text-white"
          >
            {keySaved ? "Saved" : "Save key"}
          </motion.button>
        </form>
        <SectionFootnote>
          New purchases are sorted into categories automatically using the Anthropic
          API. Without a key, purchases stay in Uncategorized and you can sort them
          yourself. The key is stored only on this device.
        </SectionFootnote>
      </section>
    </div>
  );
}

/* ---------------------------------- shell ----------------------------------- */

const TABS = [
  { id: "Home", title: "Ledger" },
  { id: "Spending", title: "Spending" },
  { id: "Settings", title: "Settings" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function TabIcon({ tab, active }: { tab: TabId; active: boolean }) {
  const props = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 2.1 : 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (tab === "Home")
    return (
      <svg {...props}>
        <path d="M3 11l9-8 9 8" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      </svg>
    );
  if (tab === "Spending")
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 3" />
      </svg>
    );
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z" />
    </svg>
  );
}

export default function App() {
  const store = useSpendingStore();
  const [tab, setTab] = useState<TabId>("Home");
  const [undo, setUndo] = useState<Purchase | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = TABS.find((t) => t.id === tab)!.title;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 44);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAdded = (p: Purchase) => {
    setUndo(p);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 4000);
  };

  const undoAdd = () => {
    if (undo) store.removePurchase(undo.id);
    setUndo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const switchTab = (t: TabId) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  return (
    <MotionConfig reducedMotion="user">
      {/* Inline top bar: appears with a scroll edge effect once the large title scrolls away */}
      <div
        className={`glass-bar fixed inset-x-0 top-0 z-40 transition-opacity duration-200 ${
          scrolled ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!scrolled}
      >
        <div className="flex h-[52px] items-center justify-center pt-[env(safe-area-inset-top)]">
          <span className="t-label text-[17px] font-semibold">{title}</span>
        </div>
      </div>

      <main className="mx-auto min-h-screen w-full max-w-lg px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-36">
        <h1 className="t-label mb-4 px-1 text-[34px] leading-[1.2] font-bold tracking-tight">
          {title}
        </h1>

        {!store.loaded ? (
          <div className="grouped-card h-64 animate-pulse" />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "Home" && <HomeTab store={store} onAdded={handleAdded} />}
              {tab === "Spending" && <SpendingTab store={store} />}
              {tab === "Settings" && <SettingsTab store={store} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Floating tab bar — the only glass layer */}
      <nav
        aria-label="Main"
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="glass-bar flex justify-around rounded-[28px] p-1">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <motion.button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                whileTap={{ scale: 0.94 }}
                transition={SPRING_PRESS}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-3xl ${
                  active ? "t-accent" : "t-secondary"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="bg-fill absolute inset-0 rounded-3xl"
                    transition={SPRING_SETTLE}
                  />
                )}
                <span className="relative">
                  <TabIcon tab={t.id} active={active} />
                </span>
                <span className="relative text-[11px] font-medium">{t.id}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {undo && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={SPRING_SETTLE}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          >
            <div
              className="flex items-center gap-4 rounded-2xl px-5 py-3"
              style={{
                backgroundColor: "var(--secondary-grouped-background)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
            >
              <span className="t-label text-[15px] whitespace-nowrap">
                Added {undo.name} ·{" "}
                <span className="tabular">
                  {formatMoney(undo.price, store.settings.currency)}
                </span>
              </span>
              <button
                type="button"
                onClick={undoAdd}
                className="t-accent pressable min-h-[44px] min-w-[44px] px-1 text-[15px] font-semibold"
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
