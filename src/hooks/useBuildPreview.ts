"use client";

import { useEffect, useState } from "react";
import type { Company } from "@/lib/types";
import { isHtmlFile, isPitchFile } from "@/lib/format";
import { useCompanies } from "./useCompanies";

interface CompanyAssets {
  previewUrl: string | null;
  pitchUrl: string | null;
}

/**
 * Resolve the URLs a card needs: the website preview (hosted preview_url or
 * the newest uploaded HTML build) and the pitch deck (pitch_url or the
 * newest uploaded deck). One file listing per company covers both.
 */
export function useBuildPreview(company: Company): CompanyAssets {
  const { repo } = useCompanies();
  const [resolved, setResolved] = useState<{ key: string; assets: CompanyAssets } | null>(null);
  const needsFiles = !company.preview_url || !company.pitch_url;

  useEffect(() => {
    if (!needsFiles) return;
    let cancelled = false;
    repo
      .listFiles(company.id)
      .then(async (files) => {
        const build = files.find(
          (f) => isHtmlFile(f.filename, f.mime_type) && !isPitchFile(f.storage_path)
        );
        const pitch = files.find((f) => isPitchFile(f.storage_path));
        const assets: CompanyAssets = {
          previewUrl: build ? await repo.getFileUrl(build) : null,
          pitchUrl: pitch ? await repo.getFileUrl(pitch) : null,
        };
        if (!cancelled) setResolved({ key: company.id, assets });
      })
      .catch(() => {
        if (!cancelled) {
          setResolved({ key: company.id, assets: { previewUrl: null, pitchUrl: null } });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repo, company.id, needsFiles]);

  const fromFiles = resolved?.key === company.id ? resolved.assets : null;
  return {
    previewUrl: company.preview_url || fromFiles?.previewUrl || null,
    pitchUrl: company.pitch_url || fromFiles?.pitchUrl || null,
  };
}
