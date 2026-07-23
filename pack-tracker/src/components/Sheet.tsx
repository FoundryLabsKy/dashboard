import { AnimatePresence, motion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
}

/** iOS-style bottom sheet: dimmed backdrop, spring slide-up card. */
export default function Sheet({ open, onClose, children, label }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: "110%", opacity: 1 }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="relative w-full max-w-md rounded-t-[20px] bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] sm:rounded-[20px] sm:pb-6"
          >
            <div className="mx-auto mb-4 h-[5px] w-9 rounded-full bg-fill sm:hidden" aria-hidden />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
