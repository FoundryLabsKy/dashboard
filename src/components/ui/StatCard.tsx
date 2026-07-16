"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  format?: (n: number) => string;
}

export function CountUp({ value, format = (n) => Math.round(n).toLocaleString() }: CountUpProps) {
  const reduced = useReducedMotion() ?? false;
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    if (reduced) {
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, reduced]);

  // With reduced motion the value renders directly — no animation state.
  return <span className="tabular-nums">{format(reduced ? value : display)}</span>;
}

interface StatCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  accent?: "ember" | "sold" | "built" | "none";
}

const ACCENTS = {
  ember: "text-ember",
  sold: "text-stage-sold",
  built: "text-stage-built",
  none: "text-ink",
};

export function StatCard({ label, value, format, accent = "none" }: StatCardProps) {
  return (
    <div className="glass glass-hover px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{label}</p>
      <p className={`mt-2 font-mono text-2xl font-medium ${ACCENTS[accent]}`}>
        <CountUp value={value} format={format} />
      </p>
    </div>
  );
}
