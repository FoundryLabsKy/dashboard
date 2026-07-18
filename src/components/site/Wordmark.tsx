import Link from "next/link";

// Foundry monogram: a graphite plate struck with a molten rust pour —
// the forge identity, drawn rather than defaulted.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-[7px] bg-graphite ${className}`}
      aria-hidden
    >
      <span className="font-editorial text-lg font-semibold leading-none text-paper">
        F
      </span>
      <span className="absolute -bottom-px left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-rust" />
    </span>
  );
}

export function Wordmark({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Foundry Labs home"
    >
      <LogoMark />
      <span className="leading-none">
        <span className="block font-editorial text-[1.3rem] font-semibold tracking-tight text-graphite">
          Foundry Labs
        </span>
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.28em] text-graphite-muted">
          Grand Cayman
        </span>
      </span>
    </Link>
  );
}
