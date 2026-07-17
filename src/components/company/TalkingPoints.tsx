"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Company } from "@/lib/types";
import { talkingPoints } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/Button";
import { IconCheck, IconPlus, IconX } from "@/components/ui/Icons";

// The call agenda: what to bring up with this client. Check items off as
// they're covered; they stay (struck through) as a record of the talk.
export function TalkingPoints({ company, compact }: { company: Company; compact?: boolean }) {
  const { updateCompany } = useCompanies();
  const [draft, setDraft] = useState("");
  const reduced = useReducedMotion() ?? false;
  const points = talkingPoints(company);

  const save = (next: typeof points) =>
    void updateCompany(company.id, { talking_points: next });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    save([...points, { id: crypto.randomUUID(), text, done: false }]);
    setDraft("");
  };

  const toggle = (id: string) =>
    save(points.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));

  const remove = (id: string) => save(points.filter((p) => p.id !== id));

  const open = points.filter((p) => !p.done).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-bold text-ink">Talking points</h2>
        {points.length > 0 && (
          <span className="font-mono text-[11px] text-faint">
            {open === 0 ? "all covered" : `${open} to cover`}
          </span>
        )}
      </div>
      {!compact && (
        <p className="mt-1 text-xs text-faint">What to bring up next time you talk.</p>
      )}

      <ul className={points.length ? "mt-3 flex flex-col gap-1.5" : "mt-3"}>
        <AnimatePresence mode="popLayout">
          {points.map((point) => (
            <motion.li
              key={point.id}
              layout
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
            >
              <button
                type="button"
                onClick={() => toggle(point.id)}
                aria-label={point.done ? `Reopen "${point.text}"` : `Mark "${point.text}" covered`}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  point.done
                    ? "border-ember bg-ember text-void"
                    : "border-white/25 text-transparent hover:border-ember hover:text-ember/60"
                }`}
              >
                <IconCheck className="h-3 w-3" />
              </button>
              <span
                className={`min-w-0 flex-1 text-sm break-words ${
                  point.done ? "text-faint line-through" : "text-ink"
                }`}
              >
                {point.text}
              </span>
              <button
                type="button"
                onClick={() => remove(point.id)}
                aria-label={`Delete "${point.text}"`}
                className="text-faint opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger focus-visible:opacity-100"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {points.length === 0 && (
          <li className="text-sm text-faint">Nothing queued up yet.</li>
        )}
      </ul>

      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add something to discuss"
          aria-label={`Add talking point for ${company.name}`}
          className="w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:outline-none"
        />
        <Button type="submit" size="sm" disabled={!draft.trim()}>
          <IconPlus className="h-4 w-4" />
          Add
        </Button>
      </form>
    </div>
  );
}
