"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Company } from "@/lib/types";
import type { useCompanyFiles } from "@/hooks/useCompanyFiles";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { isPitchFile, normalizeUrl } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { IconExternal, IconTrash, IconUpload } from "@/components/ui/Icons";

interface PitchDeckSectionProps {
  company: Company;
  files: ReturnType<typeof useCompanyFiles>;
}

export function PitchDeckSection({ company, files }: PitchDeckSectionProps) {
  const { updateCompany } = useCompanies();
  const { toast } = useToast();
  const [urlDraft, setUrlDraft] = useState(company.pitch_url ?? "");
  const [resolved, setResolved] = useState<{ fileId: string; url: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Newest uploaded deck; a pasted link wins when both exist.
  const pitchFile = useMemo(
    () => files.files.find((f) => isPitchFile(f.storage_path)) ?? null,
    [files.files]
  );

  useEffect(() => {
    if (!pitchFile || resolved?.fileId === pitchFile.id) return;
    let cancelled = false;
    files
      .getUrl(pitchFile)
      .then((url) => {
        if (!cancelled) setResolved({ fileId: pitchFile.id, url });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pitchFile, resolved, files]);

  const uploadedUrl = pitchFile && resolved?.fileId === pitchFile.id ? resolved.url : null;
  const pitchSrc = company.pitch_url || uploadedUrl;

  const saveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlDraft.trim() ? normalizeUrl(urlDraft) : null;
    void updateCompany(company.id, { pitch_url: url });
    toast(url ? "Pitch deck link saved" : "Pitch deck link cleared", "success");
  };

  const removeDeck = async () => {
    if (company.pitch_url) {
      void updateCompany(company.id, { pitch_url: null });
      setUrlDraft("");
    }
    if (pitchFile) {
      await files.remove(pitchFile);
      setResolved(null);
    }
    toast("Pitch deck removed", "info");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-bold text-ink">Pitch deck</h2>
          <p className="mt-1 text-xs text-faint">
            The HTML slideshow you present to the client.
          </p>
        </div>
        {pitchSrc && (
          <a
            href={pitchSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="ember-glow inline-flex items-center gap-2 rounded-xl bg-ember px-4 py-2 text-sm font-semibold text-void transition-opacity hover:opacity-90"
          >
            Present
            <IconExternal className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <form onSubmit={saveUrl} className="flex min-w-0 flex-1 gap-2">
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Paste a hosted pitch deck URL"
            aria-label="Pitch deck URL"
            className="w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:outline-none"
          />
          <Button type="submit" size="sm">
            Save
          </Button>
        </form>
        <Button
          type="button"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={files.uploading}
        >
          <IconUpload className="h-4 w-4" />
          {files.uploading ? "Uploading…" : "Upload deck"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,text/html"
          hidden
          aria-label="Upload pitch deck HTML"
          onChange={(e) => {
            if (e.target.files?.length) void files.upload(e.target.files, "pitch");
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-4">
        {pitchSrc ? (
          <>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-void-raised">
              <iframe
                src={pitchSrc}
                title={`${company.name} — pitch deck`}
                sandbox="allow-scripts allow-same-origin"
                className="h-72 w-full bg-white"
                loading="lazy"
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-faint">
                {pitchFile && !company.pitch_url
                  ? `Uploaded: ${pitchFile.filename}`
                  : "Linked deck. If the preview stays blank, the host blocks embedding."}
              </p>
              <Button
                variant="subtle"
                size="sm"
                className="hover:!text-danger"
                onClick={() => setConfirmRemove(true)}
              >
                <IconTrash className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-white/12">
            <p className="max-w-xs px-4 text-center text-sm text-faint">
              No pitch deck yet. Paste a link or upload the HTML slideshow.
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => void removeDeck()}
        title="Remove pitch deck?"
        message={
          pitchFile
            ? "This clears the link and deletes the uploaded deck file. There is no undo."
            : "This clears the pitch deck link."
        }
        confirmLabel="Remove deck"
        danger
      />
    </div>
  );
}
