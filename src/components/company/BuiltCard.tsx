"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { Company } from "@/lib/types";
import { deriveStage } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { listItemVariants } from "@/lib/motion";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { IconArchive, IconChat, IconExternal, IconGlobe, IconPencil } from "@/components/ui/Icons";
import { useBuildPreview } from "@/hooks/useBuildPreview";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";

interface BuiltCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onMarkSold: (company: Company) => void;
  onArchive: (company: Company) => void;
}

export function BuiltCard({ company, onEdit, onMarkSold, onArchive }: BuiltCardProps) {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const stage = deriveStage(company);
  const { previewUrl: previewSrc, pitchUrl } = useBuildPreview(company);
  const { updateCompany } = useCompanies();
  const { toast } = useToast();

  const startTalks = () => {
    void updateCompany(company.id, { in_talks: true, built: true });
    toast(`${company.name} marked as in talks`, "success");
  };

  const open = () => router.push(`/app/company?id=${company.id}`);

  return (
    <motion.article
      layout
      variants={listItemVariants(reduced)}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={reduced ? undefined : { y: -4 }}
      className={`glass glass-hover flex flex-col overflow-hidden ${
        stage === "sold" ? "!border-stage-sold/25" : ""
      }`}
    >
      {/* Preview strip: shows the hosted preview when one is set */}
      <button
        type="button"
        onClick={open}
        aria-label={`View ${company.name}`}
        className="relative block h-36 w-full cursor-pointer overflow-hidden border-b border-white/8 text-left"
      >
        {previewSrc ? (
          <>
            <iframe
              src={previewSrc}
              title={`${company.name} preview`}
              tabIndex={-1}
              loading="lazy"
              sandbox="allow-same-origin"
              scrolling="no"
              className="pointer-events-none h-144 w-[200%] origin-top-left scale-50 bg-white"
            />
            <span className="absolute inset-0" aria-hidden />
          </>
        ) : (
          <span className="flex h-full items-center justify-center bg-white/[0.02]">
            <span
              aria-hidden
              className="font-display text-5xl font-bold text-white/[0.06] select-none"
            >
              {company.name.charAt(0)}
            </span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={open} className="min-w-0 cursor-pointer text-left">
            <h3 className="truncate font-display text-base font-bold text-ink transition-colors hover:text-ember">
              {company.name}
            </h3>
            {company.industry && <p className="mt-0.5 text-xs text-faint">{company.industry}</p>}
          </button>
          <StatusBadge stage={stage} />
        </div>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 self-start font-mono text-xs text-muted transition-colors hover:text-ember"
          >
            <IconGlobe className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
          </a>
        )}

        {company.notes && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{company.notes}</p>
        )}

        {company.potential_domains.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {company.potential_domains.slice(0, 3).map((domain) => (
              <span
                key={domain}
                className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[11px] text-faint"
              >
                {domain}
              </span>
            ))}
            {company.potential_domains.length > 3 && (
              <span className="px-1 py-0.5 font-mono text-[11px] text-faint">
                +{company.potential_domains.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2">
            {company.sold ? (
              <span className="font-mono text-xs text-stage-sold">
                {company.sale_price != null && formatCurrency(company.sale_price)}
                {company.monthly_fee != null &&
                  ` + ${formatCurrency(company.monthly_fee)}/mo`}
              </span>
            ) : (
              <Button variant="primary" size="sm" onClick={() => onMarkSold(company)}>
                Mark sold
              </Button>
            )}
            {stage === "built" && (
              <Button variant="ghost" size="sm" onClick={startTalks} title="Reached out? Track the conversation">
                <IconChat className="h-4 w-4 text-ember" />
                In talks
              </Button>
            )}
            {pitchUrl && (
              <a
                href={pitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-white/20 hover:bg-white/[0.08]"
              >
                Pitch
                <IconExternal className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="subtle"
              size="sm"
              aria-label={`Edit ${company.name}`}
              onClick={() => onEdit(company)}
            >
              <IconPencil className="h-4 w-4" />
            </Button>
            <Button
              variant="subtle"
              size="sm"
              aria-label={`Archive ${company.name}`}
              onClick={() => onArchive(company)}
            >
              <IconArchive className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
