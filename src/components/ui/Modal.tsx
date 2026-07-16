"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { backdropVariants, modalVariants } from "@/lib/motion";
import { IconX } from "./Icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  const reduced = useReducedMotion() ?? false;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the dialog for keyboard users.
    const focusable = panelRef.current?.querySelector<HTMLElement>(
      "input, textarea, select, button:not([data-modal-close])"
    );
    focusable?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            variants={backdropVariants(reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`glass relative max-h-[85vh] w-full overflow-y-auto p-6 ${
              wide ? "max-w-2xl" : "max-w-md"
            }`}
            variants={modalVariants(reduced)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
              <button
                type="button"
                data-modal-close
                onClick={onClose}
                aria-label="Close"
                className="-m-1 rounded-lg p-1 text-muted transition-colors hover:text-ink"
              >
                <IconX />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
