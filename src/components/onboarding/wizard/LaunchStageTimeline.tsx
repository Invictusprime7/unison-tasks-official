/**
 * Launch Stage Timeline — the wizard's canonical generation surface.
 *
 * Renders the canonical launch stage model (`launchRun.ts`) live: every stage,
 * its status, how long it took, and every recorded degradation. This is the
 * only place the wizard reports pipeline progress — no toasts, no hidden work.
 */

import { Check, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LaunchRunSnapshot,
  LaunchStageState,
  LaunchStageStatus,
} from "@/services/launch/launchRun";

const STAGE_HINT: Record<string, string> = {
  plan: "Curating your pages, navigation, and customer journey",
  seed: "Setting up your visual theme, custom fonts, and palette",
  enrich: "Writing tailored copy, lookbook imagery, and layout vibes",
  preflight: "Checking every button, form, and animation for perfection",
  commit: "Saving your project so you can edit and share it anytime",
  handoff: "Get ready to see and customize your new website!",
};

function statusIcon(status: LaunchStageStatus) {
  switch (status) {
    case "done":
      return <Check className="h-3 w-3 stroke-[2.5]" />;
    case "active":
      return <Loader2 className="h-3 w-3 animate-spin text-cyan-200" />;
    case "degraded":
      return <Sparkles className="h-3 w-3 text-amber-300" />;
    case "failed":
      return <AlertCircle className="h-3 w-3 text-rose-300" />;
    default:
      return <div className="h-1.5 w-1.5 rounded-full bg-white/20" />;
  }
}

function statusRing(status: LaunchStageStatus) {
  switch (status) {
    case "done":
      return "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.2)]";
    case "active":
      return "bg-gradient-to-r from-cyan-500 to-blue-500 text-[#07080F] ring-2 ring-cyan-300/80 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse";
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
        "relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0c0f1d] to-[#07080f] p-5 shadow-2xl backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-cyan-400">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>AI Design Studio</span>
          </div>
          <div className="text-[11px] text-white/50">
            {statusText || "Crafting your website from your vision"}
          </div>
        </div>
        {snapshot.degradations.length > 0 && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 ring-1 ring-amber-400/20">
            {snapshot.degradations.length} note
            {snapshot.degradations.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <ol className="space-y-3">
        {snapshot.stages.map((stage) => {
          const time = duration(stage);
          const isActive = stage.status === "active";
          const isDone = stage.status === "done";
          return (
            <li
              key={stage.name}
              className={cn(
                "flex items-start gap-3 rounded-xl p-2 transition-all duration-300",
                isActive && "bg-cyan-950/30 ring-1 ring-cyan-500/20",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  statusRing(stage.status),
                )}
              >
                {statusIcon(stage.status)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      "text-[12px] font-medium leading-tight",
                      isActive
                        ? "text-cyan-200 font-semibold"
                        : isDone
                          ? "text-white/90"
                          : "text-white/30",
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
                <div className="mt-0.5 text-[10px] leading-relaxed text-white/40">
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
              <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
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
