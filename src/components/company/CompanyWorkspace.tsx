"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { deriveStage } from "@/lib/types";
import { useCompanies, useCompany } from "@/hooks/useCompanies";
import { useCompanyFiles } from "@/hooks/useCompanyFiles";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StageRail } from "@/components/ui/StageRail";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AutofillButton } from "@/components/company/AutofillButton";
import { EditCompanyModal } from "@/components/company/EditCompanyModal";
import { NotesAutosave } from "@/components/company/NotesAutosave";
import { DomainList } from "@/components/company/DomainList";
import { FileSection } from "@/components/company/FileSection";
import { PitchDeckSection } from "@/components/company/PitchDeckSection";
import { WebsitePreview } from "@/components/company/WebsitePreview";
import { SoldToggleSection } from "@/components/company/SoldToggleSection";
import {
  IconArchive,
  IconArrowLeft,
  IconCheck,
  IconGlobe,
  IconPencil,
  IconRestore,
  IconTrash,
} from "@/components/ui/Icons";

export function CompanyWorkspace({ id }: { id: string }) {
  const { loading, updateCompany, deleteCompany } = useCompanies();
  const company = useCompany(id);
  const files = useCompanyFiles(id);
  const { toast } = useToast();
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Bumped when autofill writes notes so the autosaving textarea remounts
  // with the new content (it otherwise owns its own state).
  const [notesVersion, setNotesVersion] = useState(0);

  if (loading) {
    return (
      <div className="pt-4 lg:pt-0">
        <Skeleton className="h-9 w-64" />
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex flex-col gap-5 lg:col-span-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-56" />
          </div>
          <div className="flex flex-col gap-5">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="pt-12">
        <EmptyState
          title="Company not found"
          message="It may have been permanently deleted."
          action={
            <Link href="/">
              <Button variant="ghost">
                <IconArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const stage = deriveStage(company);

  return (
    <motion.div
      // Entering a company should feel like zooming into its workspace.
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="mt-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink lg:mt-0"
      >
        <IconArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              {company.name}
            </h1>
            <StatusBadge stage={stage} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {company.industry && <span>{company.industry}</span>}
            {company.contact && <span>{company.contact}</span>}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-xs transition-colors hover:text-ember"
              >
                <IconGlobe className="h-3.5 w-3.5" />
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="text-faint">Added {formatDate(company.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StageRail stage={stage} />
          <AutofillButton
            name={company.name}
            size="sm"
            onResult={(r) => {
              const patch: Partial<typeof company> = {};
              if (!company.industry && r.industry) patch.industry = r.industry;
              if (!company.contact && r.contact) patch.contact = r.contact;
              if (!company.website && r.website) patch.website = r.website;
              if (!company.notes.trim() && r.summary) patch.notes = r.summary;
              const filled = Object.keys(patch);
              if (filled.length) {
                void updateCompany(company.id, patch);
                if (patch.notes !== undefined) setNotesVersion((v) => v + 1);
                toast(`Filled in: ${filled.join(", ")}`, "success");
              } else {
                toast("Everything is already filled in — nothing new found.", "info");
              }
            }}
          />
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
            <IconPencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {stage === "todo" && (
            <div className="glass flex flex-wrap items-center justify-between gap-4 border-stage-built/20 p-5">
              <div>
                <h2 className="font-display text-sm font-bold text-ink">Still on the build list</h2>
                <p className="mt-1 text-xs text-muted">
                  Mark it built when the website is ready to pitch.
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  void updateCompany(company.id, { built: true });
                  toast(`${company.name} moved to Built`, "success");
                }}
              >
                <IconCheck className="h-4 w-4 text-stage-built" />
                Mark website built
              </Button>
            </div>
          )}

          <div className="glass p-5">
            <WebsitePreview company={company} files={files} />
          </div>

          <div className="glass p-5">
            <PitchDeckSection company={company} files={files} />
          </div>

          <div className="glass p-5">
            <NotesAutosave
              key={`${company.id}:${notesVersion}`}
              companyId={company.id}
              initialNotes={company.notes}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <SoldToggleSection company={company} />

          <div className="glass p-5">
            <DomainList company={company} />
          </div>

          <div className="glass p-5">
            <FileSection companyId={company.id} files={files} />
          </div>

          <div className="glass p-5">
            <h2 className="font-display text-sm font-bold text-ink">Housekeeping</h2>
            <div className="mt-3 flex flex-col gap-2">
              {company.archived ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    void updateCompany(company.id, { archived: false });
                    toast(`Restored ${company.name}`, "success");
                  }}
                >
                  <IconRestore className="h-4 w-4" />
                  Restore from archive
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    void updateCompany(company.id, { archived: true });
                    toast(`Archived ${company.name}`, "info");
                  }}
                >
                  <IconArchive className="h-4 w-4" />
                  Archive company
                </Button>
              )}
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                <IconTrash className="h-4 w-4" />
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditCompanyModal company={editOpen ? company : null} onClose={() => setEditOpen(false)} />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          void deleteCompany(company.id);
          toast(`Deleted ${company.name}`, "info");
          router.push("/");
        }}
        title={`Delete ${company.name}?`}
        message="This permanently removes the company, its notes, domains, and every uploaded file. There is no undo."
        confirmLabel="Delete permanently"
        danger
      />
    </motion.div>
  );
}
