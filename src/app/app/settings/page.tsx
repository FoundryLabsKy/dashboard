"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useGeminiKey } from "@/hooks/useGeminiKey";
import { testGeminiKey } from "@/lib/ai";
import { IconCheck, IconSpark } from "@/components/ui/Icons";

export default function SettingsPage() {
  const { loaded, key, stored, isDefault, save } = useGeminiKey();
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  // Until the user types, the field shows whatever custom key is stored.
  const shown = touched ? draft : (stored ?? "");

  const saveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save(shown.trim() || null);
      setTouched(false);
      toast(shown.trim() ? "Gemini key saved to the cloud" : "Gemini key removed", "success");
    } catch {
      toast("Could not save the key. Try again.", "error");
    }
    setSaving(false);
  };

  const runTest = async () => {
    const candidate = shown.trim() || key;
    if (!candidate) return;
    setTesting(true);
    try {
      await testGeminiKey(candidate);
      toast("Key works — Gemini is ready", "success");
    } catch (err) {
      toast(`Key test failed: ${err instanceof Error ? err.message : "unknown error"}`, "error");
    }
    setTesting(false);
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Configuration that syncs to every device." />

      <div className="glass max-w-2xl p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-ember">
            <IconSpark />
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink">AI autofill</h2>
            <p className="mt-1 text-sm text-muted">
              Powers the Autofill button: type a company name and Gemini searches the web to
              fill in industry, website, and contact info. Get a free key at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ember hover:underline"
              >
                aistudio.google.com/apikey
              </a>
              .
            </p>
          </div>
        </div>

        {!loaded ? (
          <Skeleton className="mt-5 h-12" />
        ) : (
          <form onSubmit={saveKey} className="mt-5">
            <label htmlFor="gemini-key" className="mb-1.5 block text-[13px] font-medium text-muted">
              Gemini API key
            </label>
            <input
              id="gemini-key"
              type="password"
              autoComplete="off"
              value={shown}
              onChange={(e) => {
                setDraft(e.target.value);
                setTouched(true);
              }}
              placeholder="AIza… or AQ.…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save key"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void runTest()}
                disabled={testing}
              >
                {testing ? "Testing…" : "Test key"}
              </Button>
              <span className="inline-flex items-center gap-1.5 text-xs text-stage-sold">
                <IconCheck className="h-3.5 w-3.5" />
                {isDefault ? "Using the built-in key" : "Custom key on file"}
              </span>
            </div>
            <p className="mt-3 text-xs text-faint">
              A built-in key ships with the app, so autofill works everywhere out of the box.
              Save a key here to override it (synced to every device) — useful if the built-in
              one ever hits its limit. Keep keys on Google&apos;s free tier.
            </p>
          </form>
        )}
      </div>
    </>
  );
}
