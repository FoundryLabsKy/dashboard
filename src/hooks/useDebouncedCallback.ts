"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Debounce a callback. `flush` runs any pending call immediately —
 * used to persist autosaved notes on unmount/navigation.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<Args | null>(null);
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingArgsRef.current) {
      const args = pendingArgsRef.current;
      pendingArgsRef.current = null;
      callbackRef.current(...args);
    }
  }, []);

  const debounced = useCallback(
    (...args: Args) => {
      pendingArgsRef.current = args;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        const pending = pendingArgsRef.current;
        pendingArgsRef.current = null;
        if (pending) callbackRef.current(...pending);
      }, delay);
    },
    [delay]
  );

  useEffect(() => flush, [flush]);

  return { debounced, flush };
}
