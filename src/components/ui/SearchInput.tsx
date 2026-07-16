"use client";

import { IconSearch, IconX } from "./Icons";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search companies",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pr-9 pl-10 text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:bg-white/[0.06] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-faint transition-colors hover:text-ink"
        >
          <IconX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
