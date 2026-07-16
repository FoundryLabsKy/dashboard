interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="glass flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <span className="h-2 w-2 rounded-full bg-ember/70 shadow-[0_0_12px_rgba(245,158,91,0.6)]" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
