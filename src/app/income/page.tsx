"use client";

import { useMemo } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { computeKpis } from "@/lib/stats";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton, StatRowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientTable } from "@/components/income/ClientTable";

export default function IncomePage() {
  const { companies, loading } = useCompanies();

  const kpis = useMemo(() => computeKpis(companies), [companies]);
  const clients = useMemo(
    () =>
      companies
        .filter((c) => c.sold && !c.archived)
        .sort((a, b) => (b.sale_price ?? 0) - (a.sale_price ?? 0)),
    [companies]
  );

  return (
    <>
      <PageHeader
        title="Income"
        subtitle="Closed revenue and the recurring base from active clients."
      />

      {loading ? (
        <StatRowSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            label="Revenue closed"
            value={kpis.totalRevenue}
            format={(n) => formatCurrency(Math.round(n))}
            accent="ember"
          />
          <StatCard
            label="Monthly recurring"
            value={kpis.mrr}
            format={(n) => formatCurrency(Math.round(n))}
            accent="ember"
          />
          <StatCard label="Active clients" value={kpis.activeClients} accent="sold" />
          <StatCard
            label="Average sale"
            value={kpis.avgSalePrice}
            format={(n) => formatCurrency(Math.round(n))}
          />
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Active clients</h2>
        {loading ? (
          <Skeleton className="h-48" />
        ) : clients.length === 0 ? (
          <EmptyState
            title="No active clients yet"
            message="When a company is marked sold it appears here with its sale price and monthly fee."
          />
        ) : (
          <ClientTable clients={clients} />
        )}
      </div>
    </>
  );
}
