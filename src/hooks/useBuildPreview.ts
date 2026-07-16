"use client";

import { useEffect, useState } from "react";
import type { Company } from "@/lib/types";
import { isHtmlFile } from "@/lib/format";
import { useCompanies } from "./useCompanies";

/**
 * Resolve the preview URL a card should show: the hosted preview_url when
 * set, otherwise the newest uploaded HTML build (resolved once per company).
 */
export function useBuildPreview(company: Company): string | null {
  const { repo } = useCompanies();
  const [resolved, setResolved] = useState<{ key: string; url: string | null } | null>(null);

  useEffect(() => {
    if (company.preview_url) return;
    let cancelled = false;
    repo
      .listFiles(company.id)
      .then(async (files) => {
        const html = files.find((f) => isHtmlFile(f.filename, f.mime_type));
        const url = html ? await repo.getFileUrl(html) : null;
        if (!cancelled) setResolved({ key: company.id, url });
      })
      .catch(() => {
        if (!cancelled) setResolved({ key: company.id, url: null });
      });
    return () => {
      cancelled = true;
    };
  }, [repo, company.id, company.preview_url]);

  return company.preview_url || (resolved?.key === company.id ? resolved.url : null);
}
