"use client";

import type { SortKey } from "@/lib/types";
import { SORT_OPTIONS } from "@/lib/sort";
import { IconChevronDown } from "./Icons";

interface SortSelectProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        aria-label="Sort companies"
        className="appearance-none rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-9 pl-3.5 text-sm text-ink transition-colors focus:border-ember/50 focus:outline-none [&>option]:bg-void-raised"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <IconChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-faint" />
    </div>
  );
}
