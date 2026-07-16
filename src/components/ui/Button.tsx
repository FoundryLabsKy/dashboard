"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

type Variant = "primary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ember text-void font-semibold hover:bg-ember/90 ember-glow border border-transparent",
  ghost:
    "border border-white/10 bg-white/[0.04] text-ink hover:bg-white/[0.08] hover:border-white/20",
  danger:
    "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20",
  subtle: "text-muted hover:text-ink border border-transparent hover:bg-white/[0.05]",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[13px] rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "ghost", size = "md", className = "", children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
});
