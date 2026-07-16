import type { Transition, Variants } from "framer-motion";

// Shared motion vocabulary. Every factory takes the reduced-motion flag so
// durations collapse uniformly when the user prefers reduced motion.

export const spring: Transition = { type: "spring", stiffness: 380, damping: 32 };

export function pageVariants(reduced: boolean): Variants {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.25, ease: "easeOut" },
    },
  };
}

export function fadeUp(reduced: boolean, delay = 0): Variants {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: reduced ? { duration: 0 } : { duration: 0.3, ease: "easeOut", delay },
    },
  };
}

export function listItemVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }
  return {
    initial: { opacity: 0, scale: 0.96, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0, transition: spring },
    exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } },
  };
}

export function backdropVariants(reduced: boolean): Variants {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: reduced ? 0 : 0.2 } },
    exit: { opacity: 0, transition: { duration: reduced ? 0 : 0.15 } },
  };
}

export function modalVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0 } },
      exit: { opacity: 0, transition: { duration: 0 } },
    };
  }
  return {
    initial: { opacity: 0, scale: 0.95, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0, transition: spring },
    exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.15 } },
  };
}
