"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Company } from "@/lib/types";
import type { useCompanyFiles } from "@/hooks/useCompanyFiles";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/components/ui/Toast";
import { isHtmlFile, normalizeUrl } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { IconExternal, IconUpload } from "@/components/ui/Icons";

type Tab = "current" | "previous";

function Frame({ src, title }: { src: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-void-raised">
      <iframe
        src={src}
        title={title}
        sandbox="allow-scripts allow-same-origin"
        className="h-105 w-full bg-white"
        loading="lazy"
      />
    </div>
  );
}

function EmbedNote({ url }: { url: string }) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <p className="text-xs text-faint">If the preview stays blank, this site blocks embedding.</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ember"
      >
        Open in new tab
        <IconExternal className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

interface WebsitePreviewProps {
  company: Company;
  files: ReturnType<typeof useCompanyFiles>;
}

export function WebsitePreview({ company, files }: WebsitePreviewProps) {
  const { updateCompany } = useCompanies();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("current");
  const [urlDraft, setUrlDraft] = useState(company.preview_url ?? "");
  const [resolved, setResolved] = useState<{ fileId: string; url: string } | null>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);

  // The newest uploaded HTML build doubles as the preview when no hosted URL
  // is set — this is what makes single-file HTML uploads instantly viewable.
  const latestHtmlFile = useMemo(
    () => files.files.find((f) => isHtmlFile(f.filename, f.mime_type)) ?? null,
    [files.files]
  );

  useEffect(() => {
    if (!latestHtmlFile || resolved?.fileId === latestHtmlFile.id) return;
    let cancelled = false;
    files
      .getUrl(latestHtmlFile)
      .then((url) => {
        if (!cancelled) setResolved({ fileId: latestHtmlFile.id, url });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [latestHtmlFile, resolved, files]);

  const uploadedUrl =
    latestHtmlFile && resolved?.fileId === latestHtmlFile.id ? resolved.url : null;
  const currentSrc = company.preview_url || uploadedUrl;

  const savePreviewUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlDraft.trim() ? normalizeUrl(urlDraft) : null;
    void updateCompany(company.id, { preview_url: url });
    toast(url ? "Preview URL saved" : "Preview URL cleared", "success");
  };

  const uploadHtml = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    await files.upload(fileList);
  };

  const tabClass = (t: Tab) =>
    `rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
      tab === t ? "bg-white/[0.08] text-ink" : "text-muted hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-sm font-bold text-ink">Website</h2>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
          <button type="button" className={tabClass("current")} onClick={() => setTab("current")}>
            Current build
          </button>
          <button type="button" className={tabClass("previous")} onClick={() => setTab("previous")}>
            Previous website
          </button>
        </div>
      </div>

      {tab === "current" ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-end gap-2">
            <form onSubmit={savePreviewUrl} className="flex min-w-0 flex-1 gap-2">
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                placeholder="Paste a hosted preview URL"
                aria-label="Hosted preview URL"
                className="w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-sm text-ink placeholder:text-faint transition-colors focus:border-ember/50 focus:outline-none"
              />
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              onClick={() => htmlInputRef.current?.click()}
              disabled={files.uploading}
            >
              <IconUpload className="h-4 w-4" />
              {files.uploading ? "Uploading…" : "Upload HTML"}
            </Button>
            <input
              ref={htmlInputRef}
              type="file"
              accept=".html,.htm,text/html"
              hidden
              aria-label="Upload HTML build"
              onChange={(e) => {
                void uploadHtml(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
          <p className="mt-2 text-xs text-faint">
            Single-file HTML works best — the newest upload becomes the preview automatically.
          </p>

          <div className="mt-4">
            {currentSrc ? (
              <>
                <Frame src={currentSrc} title={`${company.name} — current build`} />
                <EmbedNote url={currentSrc} />
              </>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/12">
                <p className="max-w-xs px-4 text-center text-sm text-faint">
                  No build yet. Paste a hosted preview URL or upload the HTML file.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {company.website ? (
            <>
              <Frame src={company.website} title={`${company.name} — previous website`} />
              <EmbedNote url={company.website} />
            </>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/12">
              <p className="text-sm text-faint">No existing website on record.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
