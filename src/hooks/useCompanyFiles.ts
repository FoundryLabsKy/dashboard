"use client";

import { useCallback, useEffect, useState } from "react";
import type { CompanyFile } from "@/lib/types";
import { useCompanies } from "./useCompanies";
import { useToast } from "@/components/ui/Toast";

export function useCompanyFiles(companyId: string) {
  const { repo } = useCompanies();
  const { toast } = useToast();
  // Loading is derived: state is "loaded for company X", so switching
  // companies resets to loading without a synchronous setState in the effect.
  const [loaded, setLoaded] = useState<{ companyId: string; files: CompanyFile[] } | null>(null);
  const [uploading, setUploading] = useState(false);
  const loading = loaded?.companyId !== companyId;
  const files = loading ? [] : (loaded?.files ?? []);

  const setFiles = useCallback(
    (updater: (prev: CompanyFile[]) => CompanyFile[]) => {
      setLoaded((prev) =>
        prev && prev.companyId === companyId ? { companyId, files: updater(prev.files) } : prev
      );
    },
    [companyId]
  );

  useEffect(() => {
    let cancelled = false;
    repo
      .listFiles(companyId)
      .then((data) => {
        if (!cancelled) setLoaded({ companyId, files: data });
      })
      .catch(() => {
        if (!cancelled) {
          toast("Could not load files.", "error");
          setLoaded({ companyId, files: [] });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repo, companyId, toast]);

  const upload = useCallback(
    async (fileList: FileList | File[]) => {
      const items = Array.from(fileList);
      if (!items.length) return [] as CompanyFile[];
      setUploading(true);
      const uploaded: CompanyFile[] = [];
      try {
        for (const file of items) {
          const record = await repo.uploadFile(companyId, file);
          uploaded.push(record);
        }
        setFiles((prev) => [...uploaded, ...prev]);
        toast(
          items.length === 1 ? `Uploaded ${items[0].name}` : `Uploaded ${items.length} files`,
          "success"
        );
      } catch {
        toast("Upload failed. Try again.", "error");
      } finally {
        setUploading(false);
      }
      return uploaded;
    },
    [repo, companyId, toast, setFiles]
  );

  const remove = useCallback(
    async (file: CompanyFile) => {
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      try {
        await repo.deleteFile(file);
      } catch {
        setFiles((prev) => [file, ...prev]);
        toast("Could not delete the file.", "error");
      }
    },
    [repo, toast, setFiles]
  );

  const getUrl = useCallback((file: CompanyFile) => repo.getFileUrl(file), [repo]);

  return { files, loading, uploading, upload, remove, getUrl };
}
