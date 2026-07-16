"use client";

import { useMemo, useState } from "react";
import type { Company, SortKey } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { computeKpis } from "@/lib/stats";
import { searchCompanies, sortCompanies } from "@/lib/sort";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortSelect } from "@/components/ui/SortSelect";
import { CardGridSkeleton, StatRowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CompanyGrid } from "@/components/company/CompanyGrid";
import { AddCompanyModal } from "@/components/company/AddCompanyModal";
import { FloatingAddButton } from "@/components/company/FloatingAddButton";

export default function DashboardPage() {
  const { companies, loading, updateCompany } = useCompanies();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [addOpen, setAddOpen] = useState(false);

  const kpis = useMemo(() => computeKpis(companies), [companies]);
  const visible = useMemo(() => {
    const active = companies.filter((c) => !c.archived);
    return sortCompanies(searchCompanies(active, query), sort);
  }, [companies, query, sort]);

  const archive = (company: Company) => {
    void updateCompany(company.id, { archived: true });
    toast(`Archived ${company.name}`, "info");
  };

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Everything Foundry Labs is building, pitching, and running."
      />

      {loading ? (
        <StatRowSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total ideas" value={kpis.totalIdeas} />
          <StatCard label="Websites built" value={kpis.websitesBuilt} accent="built" />
          <StatCard label="Ready to pitch" value={kpis.readyToPitch} accent="built" />
          <StatCard label="Sold" value={kpis.soldCount} accent="sold" />
          <StatCard
            label="Monthly recurring"
            value={kpis.mrr}
            format={(n) => formatCurrency(Math.round(n))}
            accent="ember"
          />
          <StatCard
            label="Revenue closed"
            value={kpis.totalRevenue}
            format={(n) => formatCurrency(Math.round(n))}
            accent="ember"
          />
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={query} onChange={setQuery} className="w-full max-w-xs" />
        <SortSelect value={sort} onChange={setSort} />
      </div>

      <div className="mt-5">
        {loading ? (
          <CardGridSkeleton />
        ) : visible.length === 0 ? (
          query ? (
            <EmptyState
              title="No matches"
              message={`Nothing matches “${query}”. Try a different name, industry, or domain.`}
              action={
                <Button variant="ghost" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No companies yet"
              message="Add the first company you want to build a website for and start the pipeline."
              action={
                <Button variant="primary" onClick={() => setAddOpen(true)}>
                  Add your first company
                </Button>
              }
            />
          )
        ) : (
          <CompanyGrid companies={visible} onArchive={archive} />
        )}
      </div>

      <FloatingAddButton onClick={() => setAddOpen(true)} />
      <AddCompanyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
