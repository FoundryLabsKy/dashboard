/**
 * Ledger — personal spending tracker. The entire app lives in this file:
 * Home (quick add + budget), Spending (analytics + history), Settings
 * (favorites, budget, currency, Anthropic key). Data persists in
 * localStorage; categorization runs client-side against the Anthropic API.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
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

// Category hues: validated dark-surface categorical palette, fixed order.
// Uncategorized / "Other" are neutral grays, never a series hue.
const CATEGORY_COLOR: Record<string, string> = {
  Food: "#3987e5",
  Drinks: "#d95926",
  Groceries: "#199e70",
  Transport: "#c98500",
  Entertainment: "#d55181",
  Shopping: "#008300",
  Subscriptions: "#9085e9",
  Health: "#e66767",
  [UNCATEGORIZED]: "#5b6b6f",
  Other: "#93a3a6",
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
    // Deferred so the first paint renders the skeleton without jank.
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

  // Names waiting for AI categorization; retried whenever the queue changes.
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
      // Remember an explicit category choice for that item name going forward.
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
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, reduced]);

  return <span className={className}>{formatMoney(display, currency)}</span>;
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
        <p className="text-[13px] font-medium text-muted">Monthly budget</p>
        <p className="font-mono text-[13px] text-muted">
          <AnimatedMoney value={spent} currency={currency} className={over ? "text-danger" : "text-ink"} />
          <span className="text-faint"> / {formatMoney(budget, currency)}</span>
        </p>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: over ? "var(--color-danger)" : "var(--color-accent)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </div>
      <p className="mt-1.5 text-[12px] text-faint">
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
    setTimeout(() => setTapped(null), 500);
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
    <div className="flex flex-col gap-5">
      <div className="card p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
          Spent today
        </p>
        <AnimatedMoney
          value={todayTotal}
          currency={settings.currency}
          className="mt-1 block font-display text-4xl font-bold tracking-tight text-ink"
        />
        <div className="mt-5">
          <BudgetBar spent={monthTotal} budget={settings.budget} currency={settings.currency} />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink">Quick add</h2>
        {favorites.length === 0 ? (
          <p className="mt-2 text-sm text-faint">
            No favorites yet — add some in Settings for one-tap logging.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {favorites.map((fav) => (
              <motion.button
                key={fav.id}
                type="button"
                onClick={() => quickAdd(fav)}
                whileTap={{ scale: 0.93 }}
                className="card-hover relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left transition-colors"
              >
                <AnimatePresence>
                  {tapped === fav.id && (
                    <motion.span
                      key="pulse"
                      initial={{ opacity: 0.5, scale: 0 }}
                      animate={{ opacity: 0, scale: 2.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="pointer-events-none absolute inset-0 rounded-xl bg-accent"
                    />
                  )}
                </AnimatePresence>
                <span className="block truncate text-sm font-medium text-ink">{fav.name}</span>
                <span className="mt-0.5 block font-mono text-[13px] text-accent">
                  {formatMoney(fav.price, settings.currency)}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink">Log a purchase</h2>
        <form onSubmit={manualAdd} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What did you buy?"
            aria-label="Item name"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/50 focus:outline-none"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            aria-label="Price"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/50 focus:outline-none sm:w-32"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            className="glow rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-accent-deep"
          >
            Add
          </motion.button>
        </form>
      </div>
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

function DonutChart({ slices, total, currency }: { slices: Slice[]; total: number; currency: string }) {
  const reduced = useReducedMotion() ?? false;
  const size = 200;
  const r = 78;
  const stroke = 22;
  const pad = total > 0 ? (2 / (2 * Math.PI * r)) * 2 * Math.PI * 1.6 : 0; // ≈2px surface gap per side

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
          transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <title>{`${arc.label}: ${formatMoney(arc.value, currency)}`}</title>
        </motion.path>
      ))}
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        className="fill-[var(--color-faint)] font-mono"
        fontSize="9"
        letterSpacing="2"
      >
        THIS MONTH
      </text>
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        className="fill-[var(--color-ink)] font-display"
        fontSize="17"
        fontWeight="700"
      >
        {formatMoney(total, currency)}
      </text>
    </svg>
  );
}

function InsightTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{label}</p>
      <p className="mt-1 truncate font-display text-lg font-bold text-ink">{value}</p>
      {sub && <p className="mt-0.5 truncate text-[12px] text-muted">{sub}</p>}
    </div>
  );
}

function EditModal({
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(price);
    if (!name.trim() || !isFinite(parsed) || parsed <= 0) return;
    onSave({ name: name.trim(), price: parsed, category });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card w-full max-w-md p-6"
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-ink">Edit purchase</h2>
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
          <label className="text-[13px] font-medium text-muted">
            Item
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink focus:border-accent/50 focus:outline-none"
            />
          </label>
          <label className="text-[13px] font-medium text-muted">
            Price ({currency})
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-ink focus:border-accent/50 focus:outline-none"
            />
          </label>
          <label className="text-[13px] font-medium text-muted">
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink focus:border-accent/50 focus:outline-none [&>option]:bg-void"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-accent-deep"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function SpendingTab({ store }: { store: ReturnType<typeof useSpendingStore> }) {
  const { purchases, settings, updatePurchase, removePurchase } = store;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Anchored once per mount; tab switches remount and refresh it.
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

  // Donut caps at 6 segments: top 5 + a neutral "Other" fold.
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
    <div className="flex flex-col gap-5">
      <div className="card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-faint">
              {now.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <AnimatedMoney
              value={monthTotal}
              currency={settings.currency}
              className="mt-1 block font-display text-4xl font-bold tracking-tight text-ink"
            />
          </div>
          {prevTotal > 0 && (
            <div className="text-right">
              <p
                className={`font-mono text-sm font-semibold ${
                  delta > 0 ? "text-danger" : "text-good"
                }`}
              >
                {delta > 0 ? "▲" : "▼"} {formatMoney(Math.abs(delta), settings.currency)}
                {deltaPct !== null && ` (${Math.abs(deltaPct).toFixed(0)}%)`}
              </p>
              <p className="mt-0.5 text-[12px] text-faint">vs last month</p>
            </div>
          )}
        </div>
      </div>

      {slices.length > 0 ? (
        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-ink">By category</h2>
          <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
            <DonutChart slices={slices} total={monthTotal} currency={settings.currency} />
            <ul className="w-full flex-1 space-y-2.5">
              {byCategory.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  <CategoryDot category={c.label} />
                  <span className="flex-1 truncate text-ink">{c.label}</span>
                  <span className="font-mono text-muted">
                    {formatMoney(c.value, settings.currency)}
                  </span>
                  <span className="w-11 text-right font-mono text-[12px] text-faint">
                    {monthTotal > 0 ? ((c.value / monthTotal) * 100).toFixed(0) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center text-sm text-faint">
          No purchases yet this month — log one from Home.
        </div>
      )}

      {thisMonth.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink">History</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search purchases…"
            aria-label="Search purchases"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-accent/50 focus:outline-none"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by category"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink focus:border-accent/50 focus:outline-none [&>option]:bg-void"
          >
            <option value="All">All categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {grouped.length === 0 ? (
          <p className="mt-6 text-center text-sm text-faint">Nothing matches.</p>
        ) : (
          <div className="mt-5 max-h-[28rem] overflow-y-auto pr-1">
            {grouped.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  {group.label}
                </p>
                <ul className="space-y-1">
                  <AnimatePresence initial={false}>
                    {group.items.map((p) => (
                      <motion.li
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
                      >
                        <CategoryDot category={p.category} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-ink">{p.name}</p>
                          <p className="text-[11px] text-faint">{p.category}</p>
                        </div>
                        <span className="font-mono text-sm text-muted">
                          {formatMoney(p.price, settings.currency)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${p.name}`}
                            onClick={() => setEditing(p)}
                            className="rounded-lg p-1.5 text-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M17 3a2.4 2.4 0 0 1 3.4 3.4L7.5 19.3 3 21l1.7-4.5Z" />
                            </svg>
                          </button>
                          {confirmDelete === p.id ? (
                            <button
                              type="button"
                              onClick={() => {
                                removePurchase(p.id);
                                setConfirmDelete(null);
                              }}
                              className="rounded-lg bg-danger/15 px-2 py-1 text-[11px] font-semibold text-danger"
                            >
                              Sure?
                            </button>
                          ) : (
                            <button
                              type="button"
                              aria-label={`Delete ${p.name}`}
                              onClick={() => {
                                setConfirmDelete(p.id);
                                setTimeout(() => setConfirmDelete((c) => (c === p.id ? null : c)), 2500);
                              }}
                              className="rounded-lg p-1.5 text-faint transition-colors hover:bg-white/[0.06] hover:text-danger"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <EditModal
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
  // Drafts initialize from settings on mount; the tab remounts on each visit.
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
    <div className="flex flex-col gap-5">
      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink">Favorites</h2>
        <p className="mt-1 text-sm text-muted">
          Shown as one-tap quick add buttons on Home.
        </p>
        <ul className="mt-4 space-y-1">
          <AnimatePresence initial={false}>
            {favorites.map((fav) => (
              <motion.li
                key={fav.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
              >
                <span className="flex-1 truncate text-sm text-ink">{fav.name}</span>
                <span className="font-mono text-sm text-muted">
                  {formatMoney(fav.price, settings.currency)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingFav(fav.id);
                    setFavName(fav.name);
                    setFavPrice(String(fav.price));
                  }}
                  className="rounded-lg px-2 py-1 text-[12px] font-medium text-faint transition-colors hover:text-ink"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setFavorites(favorites.filter((f) => f.id !== fav.id))}
                  className="rounded-lg px-2 py-1 text-[12px] font-medium text-faint transition-colors hover:text-danger"
                >
                  Remove
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <form onSubmit={addFavorite} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={favName}
            onChange={(e) => setFavName(e.target.value)}
            placeholder="Item name"
            aria-label="Favorite name"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none"
          />
          <input
            value={favPrice}
            onChange={(e) => setFavPrice(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            aria-label="Favorite price"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none sm:w-28"
          />
          <button
            type="submit"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-accent-deep"
          >
            {editingFav ? "Save" : "Add"}
          </button>
          {editingFav && (
            <button
              type="button"
              onClick={() => {
                setEditingFav(null);
                setFavName("");
                setFavPrice("");
              }}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:text-ink"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink">Budget & currency</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1 text-[13px] font-medium text-muted">
            Monthly budget
            <input
              value={budgetDraft}
              onChange={(e) => setBudgetDraft(e.target.value)}
              onBlur={saveBudget}
              inputMode="decimal"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-ink focus:border-accent/50 focus:outline-none"
            />
          </label>
          <label className="text-[13px] font-medium text-muted">
            Currency
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink focus:border-accent/50 focus:outline-none [&>option]:bg-void sm:w-32"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-ink">AI categorization</h2>
        <p className="mt-1 text-sm text-muted">
          Purchases are auto-sorted into categories with the Anthropic API. Without a key,
          everything lands in Uncategorized and you can sort manually.
        </p>
        <form onSubmit={saveKey} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            autoComplete="off"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="sk-ant-…"
            aria-label="Anthropic API key"
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-faint focus:border-accent/50 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-accent-deep"
          >
            {keySaved ? "Saved ✓" : "Save key"}
          </button>
        </form>
        <p className="mt-2 text-[12px] text-faint">
          Stored locally on this device alongside your spending data.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------- shell ----------------------------------- */

const TABS = ["Home", "Spending", "Settings"] as const;
type Tab = (typeof TABS)[number];

function TabIcon({ tab }: { tab: Tab }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
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
        <path d="M12 3v9l6.4 6.3" />
      </svg>
    );
  return (
    <svg {...props}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

export default function App() {
  const store = useSpendingStore();
  const [tab, setTab] = useState<Tab>("Home");
  const [undo, setUndo] = useState<Purchase | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <>
      <div className="atmosphere" aria-hidden />
      <main className="mx-auto min-h-screen w-full max-w-2xl px-4 pt-6 pb-32 sm:px-6">
        <header className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
            Ledger<span className="text-accent">.</span>
          </h1>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
            {tab}
          </span>
        </header>

        {!store.loaded ? (
          <div className="card h-64 animate-pulse" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {tab === "Home" && <HomeTab store={store} onAdded={handleAdded} />}
              {tab === "Spending" && <SpendingTab store={store} />}
              {tab === "Settings" && <SettingsTab store={store} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <nav
        aria-label="Main"
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-2xl -translate-x-1/2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6"
      >
        <div className="card flex justify-around p-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-colors ${
                tab === t ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative">
                <TabIcon tab={t} />
              </span>
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {undo && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="card flex items-center gap-4 px-5 py-3">
              <span className="text-sm whitespace-nowrap text-ink">
                Added <span className="font-medium">{undo.name}</span> ·{" "}
                <span className="font-mono">{formatMoney(undo.price, store.settings.currency)}</span>
              </span>
              <button
                type="button"
                onClick={undoAdd}
                className="text-sm font-semibold text-accent transition-colors hover:text-accent-deep"
              >
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
