import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  className?: string;
  /** Stable identity across mounts so re-opening a tab animates from the last shown value instead of replaying from zero. */
  cacheKey?: string;
}

// Last value shown per cacheKey, survives unmount/remount within the session.
const lastShown = new Map<string, number>();

/**
 * Counts from the previously shown value to `value`. The first time a key is
 * seen it counts up from 0; after that only real changes animate.
 */
export default function AnimatedNumber({ value, format, className, cacheKey }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const localPrev = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = cacheKey !== undefined
      ? (lastShown.get(cacheKey) ?? 0)
      : (localPrev.current ?? 0);
    const remember = () => {
      if (cacheKey !== undefined) lastShown.set(cacheKey, value);
      localPrev.current = value;
    };
    if (reduceMotion || from === value) {
      el.textContent = format(value);
      remember();
      return;
    }
    const controls = animate(from, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = format(v);
      },
      onComplete: () => {
        el.textContent = format(value);
      },
    });
    remember();
    return () => controls.stop();
  }, [value, format, reduceMotion, cacheKey]);

  return (
    <span ref={ref} className={`tabular ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}
