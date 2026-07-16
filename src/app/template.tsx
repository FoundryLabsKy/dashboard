"use client";

import { motion, useReducedMotion } from "framer-motion";
import { pageVariants } from "@/lib/motion";

// Re-mounts on every navigation, giving each page a soft fade-and-rise entry.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div variants={pageVariants(reduced)} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
