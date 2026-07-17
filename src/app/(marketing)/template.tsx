"use client";

import { motion, useReducedMotion } from "framer-motion";

// Soft fade between marketing pages. Sits below the persistent header/footer,
// so only the page content transitions on navigation.
export default function MarketingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
