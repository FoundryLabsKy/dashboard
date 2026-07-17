"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Company } from "@/lib/types";
import { deriveStage } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { listItemVariants } from "@/lib/motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { NotesAutosave } from "@/components/company/NotesAutosave";
import { TalkingPoints } from "@/components/company/TalkingPoints";
import { SoldModal } from "@/components/company/SoldModal";
import { IconExternal, IconGlobe } from "@/components/ui/Icons";

export default function TalksPage() {
  const { companies, loading, updateCompany } = useCompanies();
  const { toast } = useToast();
  const [selling, setSelling] = useState<Company | null>(null);
  const reduced = useReducedMotion() ?? false;

  const inTalks = useMemo(
    () =>
      companies
        .filter((c) => deriveStage(c) === "talks")
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [companies]
  );

  const backToBuilt = (company: Company) => {
    void updateCompany(company.id, { in_talks: false });
    toast(`${company.name} moved back to Built`, "info");
  };

  const sellingLive = selling ? (companies.find((c) => c.id === selling.id) ?? null) : null;

  return (
    <>
      <PageHeader
        title="In Talks"
        subtitle="Companies you've reached out to — notes and what to cover next."
      />

      {loading ? (
        <ListSkeleton />
      ) : inTalks.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message='When you reach out to a company, hit "In talks" on its Built card and it lands here with a call agenda.'
        />
      ) : (
        <div className="flex flex-col gap-5">
          <AnimatePresence mode="popLayout">
            {inTalks.map((company) => (
              <motion.section
                key={company.id}
                layout
                variants={listItemVariants(reduced)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="glass !border-ember/20 p-5"
                aria-label={`${company.name} — in talks`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/app/company?id=${company.id}`}
                        className="truncate font-display text-lg font-bold text-ink transition-colors hover:text-ember"
                      >
                        {company.name}
                      </Link>
                      <StatusBadge stage="talks" />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      {company.industry && <span>{company.industry}</span>}
                      {company.contact && <span>{company.contact}</span>}
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono transition-colors hover:text-ember"
                        >
                          <IconGlobe className="h-3 w-3" />
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="primary" size="sm" onClick={() => setSelling(company)}>
                      Mark sold
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => backToBuilt(company)}>
                      Back to Built
                    </Button>
                    <Link
                      href={`/app/company?id=${company.id}`}
                      aria-label={`Open ${company.name}`}
                      className="rounded-lg p-2 text-muted transition-colors hover:text-ink"
                    >
                      <IconExternal className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-5 border-t border-white/8 pt-4 lg:grid-cols-2">
                  <TalkingPoints company={company} compact />
                  <NotesAutosave
                    key={company.id}
                    companyId={company.id}
                    initialNotes={company.notes}
                  />
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}

      <SoldModal company={sellingLive} onClose={() => setSelling(null)} />
    </>
  );
}
