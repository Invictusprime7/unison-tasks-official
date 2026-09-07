/**
 * Launch Stage Timeline — the wizard's AI-awareness surface.
 *
 * Renders the canonical launch stage model (`launchRun.ts`) live: every stage,
 * its status, how long it took, and every recorded degradation. This is the
 * only place the wizard reports pipeline progress — no toasts, no hidden work.
 */

import { Check, Loader2, AlertTriangle, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LaunchRunSnapshot,
  LaunchStageState,
  LaunchStageStatus,
} from "@/services/launch/launchRun";

const STAGE_HINT: Record<string, string> = {
  plan: "Resolving topology, pages and business capabilities",
  seed: "Compiling the deterministic themed site from your selections",
  enrich: "AI augments copy, media and SEO inside declared slots",
  preflight: "Type, import, route, intent and presentation gates",
  commit: "Sealing the snapshot and saving a revision",
  handoff: "Opening the builder on the sealed revision",
};

function statusIcon(status: LaunchStageStatus) {
  switch (status) {
    case "done":
      return <Check className="h-3 w-3" />;
    case "active":
      return <Loader2 className="h-3 w-3 animate-spin" />;
    case "degraded":
      return <AlertTriangle className="h-3 w-3" />;
    case "failed":
      return <X className="h-3 w-3" />;
    default:
      return <Circle className="h-2 w-2" />;
  }
}

function statusRing(status: LaunchStageStatus) {
  switch (status) {
    case "done":
      return "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/30";
    case "active":
      return "bg-cyan-500 text-[#07080F] ring-1 ring-cyan-300/60";
    case "degraded":
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30";
    case "failed":
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30";
    default:
      return "bg-white/[0.04] text-white/25 ring-1 ring-white/[0.06]";
  }
}

function duration(stage: LaunchStageState): string | null {
  if (!stage.startedAt) return null;
  const end = stage.endedAt ?? Date.now();
  const seconds = Math.max(0, Math.round((end - stage.startedAt) / 1000));
  if (stage.status === "active") return `${seconds}s…`;
  return `${seconds}s`;
}

export interface LaunchStageTimelineProps {
  snapshot: LaunchRunSnapshot;
  statusText?: string;
  className?: string;
}

export const LaunchStageTimeline = ({
  snapshot,
  statusText,
  className,
}: LaunchStageTimelineProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-tight text-white/80">
            Generation pipeline
          </div>
          <div className="text-[11px] text-white/35">
            {statusText || "Canonical launch stages"}
          </div>
        </div>
        {snapshot.degradations.length > 0 && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-400/20">
            {snapshot.degradations.length} note
            {snapshot.degradations.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <ol className="space-y-1.5">
        {snapshot.stages.map((stage) => {
          const time = duration(stage);
          return (
            <li key={stage.name} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                  statusRing(stage.status),
                )}
              >
                {statusIcon(stage.status)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "truncate text-[12px] leading-tight",
                      stage.status === "pending" ? "text-white/30" : "text-white/80",
                    )}
                  >
                    {stage.label}
                  </span>
                  {time && (
                    <span className="shrink-0 font-mono text-[10px] text-white/25">
                      {time}
                    </span>
                  )}
                </div>
                <div className="truncate text-[10px] text-white/25">
                  {STAGE_HINT[stage.name]}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {snapshot.degradations.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-white/[0.06] pt-3">
          {snapshot.degradations.map((degradation, index) => (
            <li
              key={`${degradation.code}-${index}`}
              className="flex items-start gap-2 text-[11px] text-amber-200/70"
            >
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="min-w-0">
                <span className="font-mono text-[10px] text-amber-300/60">
                  {degradation.code}
                </span>{" "}
                {degradation.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LaunchStageTimeline;
