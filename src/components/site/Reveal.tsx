import type { ReactNode } from "react";

// Content on the marketing site renders statically and immediately — no
// scroll-triggered fade-in (better LCP, works without JS, and avoids the
// "everything fades up" AI-site tell). This stays a thin passthrough so the
// call sites can keep their structure; motion lives only in real interactions
// (hover, the mobile menu, the FAQ accordion, header-on-scroll).
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  if (className) return <div className={className}>{children}</div>;
  return <>{children}</>;
}
