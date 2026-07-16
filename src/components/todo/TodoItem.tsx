"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Company } from "@/lib/types";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { listItemVariants } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconCheck, IconGlobe, IconPencil, IconTrash } from "@/components/ui/Icons";

interface TodoItemProps {
  company: Company;
  onEdit: (company: Company) => void;
}

export function TodoItem({ company, onEdit }: TodoItemProps) {
  const { updateCompany, deleteCompany } = useCompanies();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checking, setChecking] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const markBuilt = () => {
    setChecking(true);
    // Let the check animation land before the row animates out.
    setTimeout(
      () => {
        void updateCompany(company.id, { built: true });
        toast(`${company.name} moved to Built`, "success");
      },
      reduced ? 0 : 350
    );
  };

  return (
    <motion.div
      layout
      variants={listItemVariants(reduced)}
      initial="initial"
      animate="animate"
      exit="exit"
      className="glass glass-hover flex items-center gap-4 px-4 py-3.5"
    >
      <button
        type="button"
        onClick={markBuilt}
        disabled={checking}
        aria-label={`Mark ${company.name} as built`}
        title="Mark as built"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
          checking
            ? "border-stage-built bg-stage-built text-void shadow-[0_0_12px_rgba(91,157,245,0.6)]"
            : "border-white/25 text-transparent hover:border-stage-built hover:text-stage-built/60"
        }`}
      >
        <IconCheck className="h-3.5 w-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <Link
          href={`/company?id=${company.id}`}
          className="block truncate text-sm font-semibold text-ink transition-colors hover:text-ember"
        >
          {company.name}
        </Link>
        {company.notes && <p className="mt-0.5 truncate text-xs text-muted">{company.notes}</p>}
      </div>

      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-ember sm:inline-flex"
        >
          <IconGlobe className="h-3.5 w-3.5" />
          <span className="max-w-40 truncate">{company.website.replace(/^https?:\/\//, "")}</span>
        </a>
      )}

      <div className="flex shrink-0 items-center gap-1">
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
          aria-label={`Delete ${company.name}`}
          className="hover:!text-danger"
          onClick={() => setConfirmDelete(true)}
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          void deleteCompany(company.id);
          toast(`Deleted ${company.name}`, "info");
        }}
        title={`Delete ${company.name}?`}
        message="This removes the idea and any files attached to it. There is no undo."
        confirmLabel="Delete"
        danger
      />
    </motion.div>
  );
}
