"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Company, SortKey } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { searchCompanies, sortCompanies } from "@/lib/sort";
import { listItemVariants } from "@/lib/motion";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortSelect } from "@/components/ui/SortSelect";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconRestore, IconTrash } from "@/components/ui/Icons";

export default function ArchivedPage() {
  const { companies, loading, updateCompany, deleteCompany } = useCompanies();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [deleting, setDeleting] = useState<Company | null>(null);
  const reduced = useReducedMotion() ?? false;

  const archived = useMemo(() => {
    const list = companies.filter((c) => c.archived);
    return sortCompanies(searchCompanies(list, query), sort);
  }, [companies, query, sort]);

  const restore = (company: Company) => {
    void updateCompany(company.id, { archived: false });
    toast(`Restored ${company.name}`, "success");
  };

  return (
    <>
      <PageHeader
        title="Archived"
        subtitle="Parked companies. Restore them to the pipeline or clear them out."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={query} onChange={setQuery} className="w-56" />
            <SortSelect value={sort} onChange={setSort} />
          </div>
        }
      />

      {loading ? (
        <ListSkeleton />
      ) : archived.length === 0 ? (
        query ? (
          <EmptyState title="No matches" message={`Nothing in the archive matches “${query}”.`} />
        ) : (
          <EmptyState
            title="The archive is empty"
            message="Companies you archive from the Dashboard or Built pages end up here."
          />
        )
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {archived.map((company) => (
              <motion.div
                key={company.id}
                layout
                variants={listItemVariants(reduced)}
                initial="initial"
                animate="animate"
                exit="exit"
                className="glass glass-hover flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/company/${company.id}`}
                    className="block truncate text-sm font-semibold text-ink transition-colors hover:text-ember"
                  >
                    {company.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-faint">
                    {company.industry ? `${company.industry} · ` : ""}
                    Added {formatDate(company.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => restore(company)}>
                    <IconRestore className="h-4 w-4" />
                    Restore
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleting(company)}
                    aria-label={`Delete ${company.name} permanently`}
                  >
                    <IconTrash className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            void deleteCompany(deleting.id);
            toast(`Deleted ${deleting.name}`, "info");
          }
        }}
        title={deleting ? `Delete ${deleting.name}?` : "Delete?"}
        message="This permanently removes the company and every uploaded file. There is no undo."
        confirmLabel="Delete permanently"
        danger
      />
    </>
  );
}
