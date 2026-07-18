// An editorial "specimen" of a site we'd build — composed like a printed
// design sample (poster + caption), not a browser screenshot. Honest
// placeholder art: clearly a concept, not a claimed live client.
export function SpecimenCard({
  name,
  kind,
  url,
  accent,
  index,
}: {
  name: string;
  kind: string;
  url: string;
  accent: string;
  index?: number;
}) {
  return (
    <figure className="site-card site-hover overflow-hidden">
      {/* Cover — the business name set like a considered book/poster cover */}
      <div
        className="relative flex aspect-[4/3] flex-col justify-between p-6"
        style={{ backgroundColor: accent, color: "#faf7f1" }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
            {typeof index === "number" ? String(index).padStart(2, "0") : "—"} / Sample
          </span>
          <span
            className="h-6 w-6 rounded-full border"
            style={{ borderColor: "rgba(255,255,255,0.5)" }}
          />
        </div>

        <div>
          <h3 className="font-editorial text-3xl font-semibold leading-[1.05]">
            {name}
          </h3>
          <div
            className="mt-3 h-[3px] w-10 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.75)" }}
          />
        </div>

        <div className="flex items-end justify-between gap-3">
          <span className="max-w-[60%] text-[0.8rem] leading-snug">{kind}</span>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
            style={{ backgroundColor: "rgba(0,0,0,0.24)" }}
          >
            View site
          </span>
        </div>
      </div>

      {/* Caption bar */}
      <figcaption className="flex items-center justify-between px-5 py-3.5">
        <span className="font-editorial text-[0.95rem] font-semibold text-graphite">
          {name}
        </span>
        <span className="font-mono text-[11px] text-graphite-muted">{url}</span>
      </figcaption>
    </figure>
  );
}
