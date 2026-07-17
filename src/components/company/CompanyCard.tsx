"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { Company } from "@/lib/types";
import { deriveStage } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { listItemVariants } from "@/lib/motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StageRail } from "@/components/ui/StageRail";
import { Button } from "@/components/ui/Button";
import { IconArchive, IconGlobe } from "@/components/ui/Icons";

interface CompanyCardProps {
  company: Company;
  onArchive?: (company: Company) => void;
}

export function CompanyCard({ company, onArchive }: CompanyCardProps) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const stage = deriveStage(company);

  return (
    <motion.article
      layout
      variants={listItemVariants(reduced)}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={reduced ? undefined : { y: -4 }}
      onClick={() => router.push(`/app/company?id=${company.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/app/company?id=${company.id}`);
      }}
      tabIndex={0}
      role="link"
      aria-label={`View ${company.name}`}
      className={`glass glass-hover flex cursor-pointer flex-col gap-3 p-5 ${
        stage === "sold" ? "!border-stage-sold/25" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold text-ink">{company.name}</h3>
          {company.industry && <p className="mt-0.5 text-xs text-faint">{company.industry}</p>}
        </div>
        <StatusBadge stage={stage} />
      </div>

      {company.website ? (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex max-w-full items-center gap-1.5 self-start font-mono text-xs text-muted transition-colors hover:text-ember"
        >
          <IconGlobe className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
        </a>
      ) : (
        <p className="font-mono text-xs text-faint/60">No current website</p>
      )}

      {company.notes && (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{company.notes}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <StageRail stage={stage} />
        <div className="flex items-center gap-2">
          {company.sold && company.sale_price != null && (
            <span className="font-mono text-xs text-stage-sold">
              {formatCurrency(company.sale_price)}
            </span>
          )}
          {onArchive && (
            <Button
              variant="subtle"
              size="sm"
              aria-label={`Archive ${company.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onArchive(company);
              }}
            >
              <IconArchive className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
