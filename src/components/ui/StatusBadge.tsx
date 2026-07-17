import type { Stage } from "@/lib/types";
import { STAGE_LABELS } from "@/lib/types";

const STAGE_STYLES: Record<Stage, { dot: string; text: string }> = {
  todo: { dot: "bg-stage-todo", text: "text-stage-todo" },
  built: { dot: "bg-stage-built shadow-[0_0_8px_rgba(91,157,245,0.6)]", text: "text-stage-built" },
  talks: { dot: "bg-ember shadow-[0_0_8px_rgba(245,158,91,0.6)]", text: "text-ember" },
  sold: { dot: "bg-stage-sold shadow-[0_0_8px_rgba(62,207,142,0.6)]", text: "text-stage-sold" },
  archived: { dot: "bg-faint", text: "text-faint" },
};

export function StatusBadge({ stage }: { stage: Stage }) {
  const style = STAGE_STYLES[stage];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium whitespace-nowrap ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {STAGE_LABELS[stage]}
    </span>
  );
}
