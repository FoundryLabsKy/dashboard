import Link from "next/link";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-void-raised ${className}`}
      aria-hidden
    >
      <span className="font-display text-lg font-bold leading-none text-ink">F</span>
      <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-ember shadow-[0_0_8px_1px_rgba(245,158,91,0.7)]" />
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
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold tracking-tight text-ink">
          Foundry<span className="text-ember">.</span>
        </span>
        <span className="block font-mono text-[9px] uppercase tracking-[0.3em] text-faint">
          Labs · Cayman
        </span>
      </span>
    </Link>
  );
}
