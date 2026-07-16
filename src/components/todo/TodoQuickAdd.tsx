"use client";

import { useRef, useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { normalizeUrl } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { IconPlus } from "@/components/ui/Icons";

// Built for speed: name, optional website and notes, Enter to submit,
// focus returns to the name field so ideas can be dumped in rapid-fire.
export function TodoQuickAdd() {
  const { addCompany } = useCompanies();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    const company = await addCompany({
      name: name.trim(),
      website: website ? normalizeUrl(website) : "",
      notes,
    });
    setSaving(false);
    if (company) {
      toast(`Added ${company.name} to the build list`, "success");
      setName("");
      setWebsite("");
      setNotes("");
      nameRef.current?.focus();
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:bg-white/[0.06] focus:outline-none";

  return (
    <form onSubmit={submit} className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <input
        ref={nameRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Company name"
        aria-label="Company name"
        required
        className={`${fieldClass} sm:flex-1`}
      />
      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="Existing website (optional)"
        aria-label="Existing website"
        className={`${fieldClass} font-mono sm:flex-1`}
      />
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        aria-label="Notes"
        className={`${fieldClass} sm:flex-1`}
      />
      <Button type="submit" variant="primary" disabled={!name.trim() || saving} className="shrink-0">
        <IconPlus className="h-4 w-4" />
        {saving ? "Adding…" : "Add idea"}
      </Button>
    </form>
  );
}
