// Presentational browser-window mockup used to show off example site styles.
// Renders an abstract, on-brand layout — not a real screenshot.
export function BrowserFrame({
  url,
  accent,
  hue,
  label,
  kind,
  hideCaption = false,
}: {
  url: string;
  accent: string;
  hue: string;
  label: string;
  kind: string;
  hideCaption?: boolean;
}) {
  return (
    <div className="glass overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white/[0.05] px-3 py-1 text-center font-mono text-[11px] text-faint">
          {url}
        </span>
      </div>

      {/* Abstract site content */}
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${hue} to-transparent`}>
        <div className="absolute inset-0 p-5">
          {/* faux nav */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <span className="h-2 w-14 rounded-full bg-white/25" />
            </div>
            <div className="hidden gap-2 sm:flex">
              <span className="h-2 w-8 rounded-full bg-white/15" />
              <span className="h-2 w-8 rounded-full bg-white/15" />
              <span className="h-2 w-8 rounded-full bg-white/15" />
            </div>
          </div>

          {/* faux hero */}
          <div className="mt-8">
            <span className="block h-3 w-2/3 rounded-full bg-white/35" />
            <span className="mt-2 block h-3 w-1/2 rounded-full bg-white/20" />
            <span className="mt-4 block h-2 w-4/5 rounded-full bg-white/12" />
            <span className="mt-1.5 block h-2 w-3/5 rounded-full bg-white/12" />
            <span
              className="mt-5 inline-block h-6 w-24 rounded-lg"
              style={{ backgroundColor: accent }}
            />
          </div>

          {/* faux cards */}
          <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2">
            <span className="h-10 rounded-lg border border-white/10 bg-white/[0.06]" />
            <span className="h-10 rounded-lg border border-white/10 bg-white/[0.06]" />
            <span className="h-10 rounded-lg border border-white/10 bg-white/[0.06]" />
          </div>
        </div>
      </div>

      {/* Caption */}
      {!hideCaption && (
        <div className="flex items-center justify-between border-t border-white/8 px-4 py-3">
          <span className="font-display text-sm font-semibold text-ink">{label}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
            {kind}
          </span>
        </div>
      )}
    </div>
  );
}
