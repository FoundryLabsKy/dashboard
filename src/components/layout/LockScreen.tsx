"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

// Boot gate: the app asks for an access code once per browser session.
// The code is never stored in the source — only its SHA-256 digest is,
// and the entered value is hashed before comparison.
const CODE_SHA256 = "f354ee99e2bc863ce19d80b843353476394ebc3530a51c9290d629065bacc3b3";
const UNLOCK_KEY = "foundry:unlocked";

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Status = "checking" | "locked" | "open";

export function LockScreen({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Deferred so the check runs after hydration, keeping SSR output stable.
    const frame = requestAnimationFrame(() => {
      let unlocked = false;
      try {
        unlocked = sessionStorage.getItem(UNLOCK_KEY) === "1";
      } catch {
        // Storage unavailable (rare); fall back to asking for the code.
      }
      setStatus(unlocked ? "open" : "locked");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (status === "locked") inputRef.current?.focus();
  }, [status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const entered = code.trim().toLowerCase();
    const hash = entered ? await sha256Hex(entered) : "";
    if (hash === CODE_SHA256) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {
        // Session-only unlock still works without storage.
      }
      setStatus("open");
    } else {
      setError(true);
      setCode("");
      inputRef.current?.focus();
    }
    setBusy(false);
  };

  if (status === "open") return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {status === "locked" && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="glass w-full max-w-sm p-8 text-center"
        >
          <p className="font-display text-2xl font-bold tracking-tight text-ink">
            Foundry<span className="text-ember">.</span>
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-faint">
            Labs OS
          </p>

          <form onSubmit={submit} className="mt-8">
            <label htmlFor="access-code" className="block text-sm text-muted">
              Enter access code
            </label>
            <motion.div
              animate={error && !reduced ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <input
                ref={inputRef}
                id="access-code"
                type="password"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(false);
                }}
                aria-invalid={error}
                aria-describedby={error ? "access-code-error" : undefined}
                className={`mt-3 w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-center font-mono text-lg tracking-[0.3em] text-ink transition-colors focus:outline-none ${
                  error
                    ? "border-danger/60 focus:border-danger"
                    : "border-white/10 focus:border-ember/50"
                }`}
              />
            </motion.div>
            <p
              id="access-code-error"
              role="alert"
              className={`mt-2 min-h-5 text-sm text-danger transition-opacity ${
                error ? "opacity-100" : "opacity-0"
              }`}
            >
              {error ? "Wrong code. Try again." : ""}
            </p>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={!code.trim() || busy}
              className="ember-glow mt-3 w-full rounded-xl bg-ember px-4 py-3 text-sm font-semibold text-void transition-opacity disabled:opacity-40"
            >
              Unlock
            </motion.button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
