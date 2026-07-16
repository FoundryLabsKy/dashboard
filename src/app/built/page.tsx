"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Company, SortKey } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { searchCompanies, sortCompanies } from "@/lib/sort";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortSelect } from "@/components/ui/SortSelect";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BuiltCard } from "@/components/company/BuiltCard";
import { EditCompanyModal } from "@/components/company/EditCompanyModal";
import { SoldModal } from "@/components/company/SoldModal";

export default function BuiltPage() {
  const { companies, loading, updateCompany } = useCompanies();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [editing, setEditing] = useState<Company | null>(null);
  const [selling, setSelling] = useState<Company | null>(null);

  const built = useMemo(() => {
    const list = companies.filter((c) => !c.archived && (c.built || c.sold));
    return sortCompanies(searchCompanies(list, query), sort);
  }, [companies, query, sort]);

  const archive = (company: Company) => {
    void updateCompany(company.id, { archived: true });
    toast(`Archived ${company.name}`, "info");
  };

  // Keep the modal in sync with live company data (e.g. optimistic updates).
  const sellingLive = selling ? (companies.find((c) => c.id === selling.id) ?? null) : null;

  return (
    <>
      <PageHeader
        title="Built"
        subtitle="Finished websites, ready to pitch and close."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={query} onChange={setQuery} className="w-56" />
            <SortSelect value={sort} onChange={setSort} />
          </div>
        }
      />

      {loading ? (
        <CardGridSkeleton />
      ) : built.length === 0 ? (
        query ? (
          <EmptyState
            title="No matches"
            message={`Nothing in Built matches “${query}”.`}
          />
        ) : (
          <EmptyState
            title="Nothing built yet"
            message="Check an idea off on the To-Do page and it lands here, ready to pitch."
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {built.map((company) => (
              <BuiltCard
                key={company.id}
                company={company}
                onEdit={setEditing}
                onMarkSold={setSelling}
                onArchive={archive}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <EditCompanyModal company={editing} onClose={() => setEditing(null)} />
      <SoldModal company={sellingLive} onClose={() => setSelling(null)} />
    </>
  );
}
