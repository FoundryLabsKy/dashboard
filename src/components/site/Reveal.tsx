"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

// Fades and lifts its children into view the first time they're scrolled to.
export function Reveal({ delay = 0, y = 16, children, ...props }: RevealProps) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
