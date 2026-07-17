import type { Stage } from "@/lib/types";

// The signature pipeline element: four nodes showing where a company sits
// in the To Build → Built → In Talks → Sold flow, readable at a glance.

const STEPS: { stage: Stage; label: string; node: string }[] = [
  { stage: "todo", label: "To Build", node: "bg-stage-todo" },
  { stage: "built", label: "Built", node: "bg-stage-built shadow-[0_0_10px_rgba(91,157,245,0.6)]" },
  { stage: "talks", label: "In Talks", node: "bg-ember shadow-[0_0_10px_rgba(245,158,91,0.6)]" },
  { stage: "sold", label: "Sold", node: "bg-stage-sold shadow-[0_0_10px_rgba(62,207,142,0.7)]" },
];

const ORDER: Record<Stage, number> = { todo: 0, built: 1, talks: 2, sold: 3, archived: -1 };

export function StageRail({ stage }: { stage: Stage }) {
  const position = ORDER[stage];
  return (
    <div
      className="flex items-center"
      role="img"
      aria-label={`Pipeline stage: ${STEPS[Math.max(position, 0)]?.label ?? "Archived"}`}
    >
      {STEPS.map((step, i) => {
        const reached = position >= i;
        const current = position === i;
        return (
          <div key={step.stage} className="flex items-center">
            {i > 0 && (
              <span
                className={`h-px w-5 ${reached ? "bg-white/30" : "bg-white/10"}`}
                aria-hidden
              />
            )}
            <span
              title={step.label}
              className={`block rounded-full transition-all ${
                current ? "h-2.5 w-2.5" : "h-1.5 w-1.5"
              } ${reached ? step.node : "border border-white/20 bg-transparent"}`}
            />
          </div>
        );
      })}
    </div>
  );
}
