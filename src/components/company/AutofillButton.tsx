"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useGeminiKey } from "@/hooks/useGeminiKey";
import { autofillCompany, type AutofillResult } from "@/lib/ai";
import { IconSpark } from "@/components/ui/Icons";

interface AutofillButtonProps {
  name: string;
  onResult: (result: AutofillResult) => void;
  size?: "sm" | "md";
  className?: string;
}

export function AutofillButton({ name, onResult, size = "md", className }: AutofillButtonProps) {
  const { key } = useGeminiKey();
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!name.trim() || busy) return;
    if (!key) {
      toast("Add your Gemini API key in Settings first", "error");
      router.push("/settings");
      return;
    }
    setBusy(true);
    try {
      const result = await autofillCompany(name.trim(), key);
      onResult(result);
      toast(
        result.usedSearch
          ? `Research done for ${name.trim()}`
          : `Filled from AI memory — daily web-search limit reached, double-check details`,
        result.usedSearch ? "success" : "info"
      );
    } catch (err) {
      toast(
        `Autofill failed: ${err instanceof Error ? err.message : "unknown error"}`,
        "error"
      );
    }
    setBusy(false);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={className}
      disabled={!name.trim() || busy}
      onClick={() => void run()}
      title="Let AI search the web and fill in the details"
    >
      <IconSpark className={`${size === "sm" ? "h-4 w-4" : "h-4 w-4"} text-ember`} />
      {busy ? "Researching…" : "Autofill"}
    </Button>
  );
}
