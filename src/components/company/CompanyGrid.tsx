"use client";

import { AnimatePresence } from "framer-motion";
import type { Company } from "@/lib/types";
import { CompanyCard } from "./CompanyCard";

interface CompanyGridProps {
  companies: Company[];
  onArchive?: (company: Company) => void;
}

export function CompanyGrid({ companies, onArchive }: CompanyGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} onArchive={onArchive} />
        ))}
      </AnimatePresence>
    </div>
  );
}
