import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import type { Purchase } from "../lib/types";
import { formatDayLabel, formatMoney, formatTime } from "../lib/format";
import Sheet from "./Sheet";

interface DayGroup {
  label: string;
  entries: Purchase[];
}

function groupByDay(purchases: Purchase[]): DayGroup[] {
  const sorted = [...purchases].sort((a, b) => b.timestamp - a.timestamp);
  const groups: DayGroup[] = [];
  for (const p of sorted) {
    const label = formatDayLabel(p.timestamp);
    const current = groups[groups.length - 1];
    if (current && current.label === label) {
      current.entries.push(p);
    } else {
      groups.push({ label, entries: [p] });
    }
  }
  return groups;
}

export default function Timeline() {
  const { purchases, settings, updatePurchase, deletePurchase } = useApp();
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");

  const groups = useMemo(() => groupByDay(purchases), [purchases]);

  const openEditor = (p: Purchase) => {
    setEditing(p);
    setBrand(p.brand);
    setPrice(String(p.price));
  };

  const save = () => {
    if (!editing) return;
    updatePurchase(editing.id, {
      brand: brand.trim() || editing.brand,
      price: Number(price) >= 0 && price !== "" ? Number(price) : editing.price,
    });
    setEditing(null);
  };

  const remove = () => {
    if (!editing) return;
    deletePurchase(editing.id);
    setEditing(null);
  };

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-[max(3.5rem,env(safe-area-inset-top))] pb-32">
      <h1 className="px-4 text-[34px] font-bold tracking-tight">Timeline</h1>

      {purchases.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-[17px] font-semibold">Nothing here yet</p>
          <p className="mt-1 text-[15px] text-label-secondary">
            Every pack you log shows up here.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="px-4 pb-2 text-[13px] font-semibold tracking-[0.06em] text-label-secondary uppercase">
                {group.label}
              </h2>
              <div className="overflow-hidden rounded-[16px] bg-card">
                <AnimatePresence initial={false}>
                  {group.entries.map((p, i) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 36 }}
                      onClick={() => openEditor(p)}
                      className={`block w-full text-left ${
                        i > 0
                          ? "relative before:absolute before:top-0 before:right-0 before:left-4 before:h-px before:bg-separator"
                          : ""
                      }`}
                    >
                      <span className="flex min-h-[56px] items-center justify-between px-4 py-3">
                        <span>
                          <span className="block text-[17px] font-medium">{p.brand}</span>
                          <span className="block text-[14px] text-label-secondary">
                            {formatTime(p.timestamp)} · {p.packSize} cigarettes
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="tabular text-[17px] font-semibold">
                            {formatMoney(p.price, settings.currency)}
                          </span>
                          <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden>
                            <path
                              d="M1 1l6 6-6 6"
                              stroke="var(--ios-label-tertiary)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </div>
      )}

      <Sheet open={editing !== null} onClose={() => setEditing(null)} label="Edit purchase">
        <h2 className="text-center text-[20px] font-semibold tracking-tight">Edit purchase</h2>
        {editing && (
          <p className="mt-1.5 text-center text-[15px] text-label-secondary">
            {formatDayLabel(editing.timestamp)} · {formatTime(editing.timestamp)}
          </p>
        )}
        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1.5 block px-1 text-[13px] font-semibold tracking-[0.04em] text-label-secondary uppercase">
              Brand
            </span>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              aria-label="Brand"
              className="h-[52px] w-full rounded-[14px] bg-fill px-4 text-[17px] outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block px-1 text-[13px] font-semibold tracking-[0.04em] text-label-secondary uppercase">
              Price
            </span>
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              aria-label="Price"
              className="h-[52px] w-full rounded-[14px] bg-fill px-4 text-[17px] outline-none"
            />
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={save}
            className="h-[52px] w-full rounded-[14px] bg-accent text-[17px] font-semibold text-white"
          >
            Save
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={remove}
            className="h-[52px] w-full rounded-[14px] bg-fill text-[17px] font-semibold text-destructive"
          >
            Delete Entry
          </motion.button>
        </div>
      </Sheet>
    </div>
  );
}
