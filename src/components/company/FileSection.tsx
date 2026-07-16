"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CompanyFile } from "@/lib/types";
import { useCompanyFiles } from "@/hooks/useCompanyFiles";
import { formatBytes, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { IconExternal, IconFile, IconTrash, IconUpload } from "@/components/ui/Icons";

interface FileSectionProps {
  companyId: string;
  files: ReturnType<typeof useCompanyFiles>;
}

export function FileSection({ files }: FileSectionProps) {
  const { files: list, loading, uploading, upload, remove, getUrl } = files;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const reduced = useReducedMotion() ?? false;

  const openFile = async (file: CompanyFile) => {
    const url = await getUrl(file);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <h2 className="font-display text-sm font-bold text-ink">Files</h2>
      <p className="mt-1 text-xs text-faint">HTML builds, logos, photos, PDFs, documents.</p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={`mt-3 flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-sm transition-colors ${
          dragging
            ? "border-ember/60 bg-ember/[0.06] text-ember"
            : "border-white/15 text-muted hover:border-white/30 hover:text-ink"
        }`}
      >
        <IconUpload />
        {uploading ? "Uploading…" : "Drop files here or click to upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        aria-label="Upload files"
        onChange={(e) => {
          if (e.target.files?.length) void upload(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="mt-4">
        {loading ? (
          <ListSkeleton count={2} />
        ) : list.length === 0 ? (
          <p className="text-sm text-faint">No files uploaded yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {list.map((file) => (
                <motion.li
                  key={file.id}
                  layout
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5"
                >
                  <IconFile className="h-4 w-4 shrink-0 text-faint" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{file.filename}</p>
                    <p className="font-mono text-[11px] text-faint">
                      {formatBytes(file.size_bytes)}
                      {file.size_bytes != null && " · "}
                      {formatDate(file.uploaded_at)}
                    </p>
                  </div>
                  <Button
                    variant="subtle"
                    size="sm"
                    aria-label={`Open ${file.filename}`}
                    onClick={() => void openFile(file)}
                  >
                    <IconExternal className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    aria-label={`Delete ${file.filename}`}
                    className="hover:!text-danger"
                    onClick={() => void remove(file)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
