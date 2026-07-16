"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Company } from "@/lib/types";
import { deriveStage } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { TodoQuickAdd } from "@/components/todo/TodoQuickAdd";
import { TodoItem } from "@/components/todo/TodoItem";
import { TodoEditModal } from "@/components/todo/TodoEditModal";

export default function TodoPage() {
  const { companies, loading } = useCompanies();
  const [editing, setEditing] = useState<Company | null>(null);

  const todos = useMemo(
    () =>
      companies
        .filter((c) => deriveStage(c) === "todo")
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [companies]
  );

  return (
    <>
      <PageHeader
        title="To-Do"
        subtitle="Dump website ideas here, then check them off as you build."
      />

      <TodoQuickAdd />

      <div className="mt-6">
        {loading ? (
          <ListSkeleton />
        ) : todos.length === 0 ? (
          <EmptyState
            title="The build list is clear"
            message="Every idea has been built. Add the next company above, or head to Built to start pitching."
          />
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {todos.map((company) => (
                <TodoItem key={company.id} company={company} onEdit={setEditing} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <TodoEditModal company={editing} onClose={() => setEditing(null)} />
    </>
  );
}
