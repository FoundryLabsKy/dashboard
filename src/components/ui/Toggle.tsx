"use client";

import { motion, useReducedMotion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "md" | "lg";
}

export function Toggle({ checked, onChange, label, disabled, size = "md" }: ToggleProps) {
  const reduced = useReducedMotion() ?? false;
  const dims =
    size === "lg"
      ? { track: "h-9 w-16 p-1", knob: "h-7 w-7" }
      : { track: "h-6 w-11 p-0.5", knob: "h-5 w-5" };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative flex shrink-0 items-center rounded-full border transition-colors disabled:opacity-50 ${dims.track} ${
        checked
          ? "justify-end border-stage-sold/50 bg-stage-sold/25"
          : "justify-start border-white/15 bg-white/[0.06]"
      }`}
    >
      <motion.span
        layout
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
        className={`block rounded-full ${dims.knob} ${
          checked ? "bg-stage-sold shadow-[0_0_12px_rgba(62,207,142,0.5)]" : "bg-muted"
        }`}
      />
    </button>
  );
}
