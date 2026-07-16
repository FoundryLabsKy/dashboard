"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Company } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { formatCurrency } from "@/lib/format";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SoldModal } from "./SoldModal";
import { IconExternal } from "@/components/ui/Icons";

export function SoldToggleSection({ company }: { company: Company }) {
  const { unmarkSold } = useCompanies();
  const [soldModalOpen, setSoldModalOpen] = useState(false);
  const [confirmUnsold, setConfirmUnsold] = useState(false);
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      className={`glass p-5 ${company.sold ? "!border-stage-sold/30" : ""}`}
      animate={
        company.sold && !reduced
          ? { boxShadow: "0 0 32px -8px rgba(62,207,142,0.35)" }
          : { boxShadow: "0 0 0px 0px rgba(62,207,142,0)" }
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-sm font-bold text-ink">
            {company.sold ? "Sold" : "Not sold yet"}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {company.sold
              ? "This client is live and under monthly management."
              : "Flip the switch when the client says yes."}
          </p>
        </div>
        <Toggle
          size="lg"
          checked={company.sold}
          label={company.sold ? "Mark as not sold" : "Mark as sold"}
          onChange={(next) => {
            if (next) setSoldModalOpen(true);
            else setConfirmUnsold(true);
          }}
        />
      </div>

      {company.sold && (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/8 pt-4 sm:grid-cols-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Sale price</p>
            <p className="mt-1 font-mono text-sm text-stage-sold">
              {company.sale_price != null ? formatCurrency(company.sale_price) : "—"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Monthly fee</p>
            <p className="mt-1 font-mono text-sm text-ink">
              {company.monthly_fee != null ? `${formatCurrency(company.monthly_fee)}/mo` : "—"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Domain</p>
            <p className="mt-1 truncate font-mono text-sm text-ink">{company.final_domain ?? "—"}</p>
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Live site</p>
            {company.final_url ? (
              <a
                href={company.final_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex max-w-full items-center gap-1 font-mono text-sm text-muted transition-colors hover:text-ember"
              >
                <span className="truncate">
                  {company.final_url.replace(/^https?:\/\//, "")}
                </span>
                <IconExternal className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <p className="mt-1 font-mono text-sm text-ink">—</p>
            )}
          </div>
          <div className="col-span-2 sm:col-span-4">
            <Button variant="subtle" size="sm" onClick={() => setSoldModalOpen(true)}>
              Edit sale details
            </Button>
          </div>
        </div>
      )}

      <SoldModal company={soldModalOpen ? company : null} onClose={() => setSoldModalOpen(false)} />
      <ConfirmDialog
        open={confirmUnsold}
        onClose={() => setConfirmUnsold(false)}
        onConfirm={() => void unmarkSold(company.id)}
        title="Mark as not sold?"
        message={`${company.name} will move back to Built and its sale details (price, fee, final domain) will be cleared. Recurring revenue updates immediately.`}
        confirmLabel="Mark not sold"
        danger
      />
    </motion.div>
  );
}
