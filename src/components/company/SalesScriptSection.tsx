"use client";

import { useEffect, useRef, useState } from "react";
import type { Company } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { useGeminiKey } from "@/hooks/useGeminiKey";
import { useToast } from "@/components/ui/Toast";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { generatePitchScript } from "@/lib/ai";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconSpark } from "@/components/ui/Icons";

// The AI-written sell-the-website script. Stored per company in the
// settings table (key pitch_script:<id>) so it syncs everywhere without
// a schema change. Editable — tweaks autosave like notes do.
export function SalesScriptSection({ company }: { company: Company }) {
  const { repo } = useCompanies();
  const { key } = useGeminiKey();
  const { toast } = useToast();
  const settingKey = `pitch_script:${company.id}`;

  const [loaded, setLoaded] = useState(false);
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo
      .getSetting(settingKey)
      .then((value) => {
        if (!cancelled) {
          setScript(value ?? "");
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [repo, settingKey]);

  const persist = (value: string) => {
    void repo
      .setSetting(settingKey, value.trim() ? value : null)
      .then(() => {
        setSaveState("saved");
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaveState("idle"), 2000);
      })
      .catch(() => toast("Could not save the script. Try again.", "error"));
  };

  const { debounced, flush } = useDebouncedCallback(persist, 800);

  useEffect(() => {
    return () => {
      flush();
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, [flush]);

  const generate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const result = await generatePitchScript(
        {
          name: company.name,
          industry: company.industry,
          contact: company.contact,
          website: company.website,
          notes: company.notes,
          potential_domains: company.potential_domains,
        },
        key
      );
      setScript(result.script);
      persist(result.script);
      toast(
        result.usedSearch
          ? `Script written for ${company.name}`
          : "Script written from AI memory — daily web-search limit reached",
        result.usedSearch ? "success" : "info"
      );
    } catch (err) {
      toast(
        `Script failed: ${err instanceof Error ? err.message : "unknown error"}`,
        "error"
      );
    }
    setGenerating(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      toast("Script copied", "success");
    } catch {
      toast("Could not copy — select and copy manually.", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-bold text-ink">Sales script</h2>
          <p className="mt-1 text-xs text-faint">
            AI researches the business and writes your pitch. Edit it like notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-live="polite"
            className={`font-mono text-[11px] transition-opacity ${
              saveState === "idle" ? "opacity-0" : "opacity-100"
            } ${saveState === "saved" ? "text-stage-sold" : "text-faint"}`}
          >
            {saveState === "saved" ? "Saved" : "Saving…"}
          </span>
          {script && !generating && (
            <Button variant="ghost" size="sm" onClick={() => void copy()}>
              Copy
            </Button>
          )}
          <Button
            variant={script ? "ghost" : "primary"}
            size="sm"
            disabled={generating || !loaded}
            onClick={() => void generate()}
          >
            <IconSpark className="h-4 w-4 text-ember" />
            {generating ? "Researching…" : script ? "Rewrite" : "Write my script"}
          </Button>
        </div>
      </div>

      <div className="mt-3">
        {!loaded || generating ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : script ? (
          <textarea
            value={script}
            onChange={(e) => {
              setScript(e.target.value);
              setSaveState("saving");
              debounced(e.target.value);
            }}
            rows={14}
            aria-label={`Sales script for ${company.name}`}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:bg-white/[0.06] focus:outline-none"
          />
        ) : (
          <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/12">
            <p className="max-w-sm px-4 text-center text-sm text-faint">
              No script yet. The AI will look at {company.name}
              {company.website ? " and their current website" : ""} and write the pitch for
              you.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
