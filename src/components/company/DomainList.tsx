"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Company } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconX } from "@/components/ui/Icons";

export function DomainList({ company }: { company: Company }) {
  const { updateCompany } = useCompanies();
  const [draft, setDraft] = useState("");
  const reduced = useReducedMotion() ?? false;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const domain = draft.trim().toLowerCase();
    if (!domain || company.potential_domains.includes(domain)) {
      setDraft("");
      return;
    }
    void updateCompany(company.id, {
      potential_domains: [...company.potential_domains, domain],
    });
    setDraft("");
  };

  const remove = (domain: string) => {
    void updateCompany(company.id, {
      potential_domains: company.potential_domains.filter((d) => d !== domain),
    });
  };

  return (
    <div>
      <h2 className="font-display text-sm font-bold text-ink">Potential domains</h2>
      <p className="mt-1 text-xs text-faint">
        Domains under consideration before the site is sold.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {company.potential_domains.map((domain) => (
            <motion.span
              key={domain}
              layout
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs ${
                company.final_domain === domain
                  ? "border-stage-sold/40 text-stage-sold"
                  : "border-white/12 text-muted"
              }`}
            >
              {domain}
              {company.final_domain === domain && (
                <span className="text-[10px] uppercase tracking-wider">final</span>
              )}
              <button
                type="button"
                onClick={() => remove(domain)}
                aria-label={`Remove ${domain}`}
                className="text-faint transition-colors hover:text-danger"
              >
                <IconX className="h-3 w-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        {company.potential_domains.length === 0 && (
          <p className="text-sm text-faint">None yet. Add the first candidate below.</p>
        )}
      </div>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="company.ky"
          aria-label="Add potential domain"
          className="w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:outline-none"
        />
        <Button type="submit" size="sm" disabled={!draft.trim()}>
          <IconPlus className="h-4 w-4" />
          Add
        </Button>
      </form>
    </div>
  );
}
