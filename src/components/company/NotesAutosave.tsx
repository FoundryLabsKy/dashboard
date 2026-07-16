"use client";

import { useEffect, useRef, useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

type SaveState = "idle" | "typing" | "saved";

interface NotesAutosaveProps {
  companyId: string;
  initialNotes: string;
}

export function NotesAutosave({ companyId, initialNotes }: NotesAutosaveProps) {
  const { updateCompany } = useCompanies();
  const [value, setValue] = useState(initialNotes);
  const [state, setState] = useState<SaveState>("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { debounced, flush } = useDebouncedCallback((notes: string) => {
    void updateCompany(companyId, { notes });
    setState("saved");
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setState("idle"), 2000);
  }, 800);

  // Flush pending edits when leaving the page.
  useEffect(() => {
    return () => {
      flush();
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, [flush]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold text-ink">Notes</h2>
        <span
          aria-live="polite"
          className={`font-mono text-[11px] transition-opacity ${
            state === "idle" ? "opacity-0" : "opacity-100"
          } ${state === "saved" ? "text-stage-sold" : "text-faint"}`}
        >
          {state === "saved" ? "Saved" : "Saving…"}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setState("typing");
          debounced(e.target.value);
        }}
        placeholder="Pitch angle, pricing thoughts, who to talk to…"
        rows={8}
        aria-label="Company notes"
        className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:bg-white/[0.06] focus:outline-none"
      />
    </div>
  );
}
