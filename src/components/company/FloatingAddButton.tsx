"use client";

import { motion, useReducedMotion } from "framer-motion";
import { IconPlus } from "@/components/ui/Icons";

export function FloatingAddButton({ onClick }: { onClick: () => void }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="ember-glow fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-ember px-5 py-3.5 text-sm font-semibold text-void shadow-xl"
    >
      <IconPlus className="h-4 w-4" />
      Add Company
    </motion.button>
  );
}
