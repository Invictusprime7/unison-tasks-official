/**
 * Launch Stage Timeline — the wizard's canonical generation surface.
 *
 * Renders the canonical launch stage model (`launchRun.ts`) live: every stage,
 * its status, how long it took, and every recorded degradation. This is the
 * only place the wizard reports pipeline progress — no toasts, no hidden work.
 */

import { useEffect, useState } from "react";
import { Check, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LaunchRunSnapshot,
  LaunchStageState,
  LaunchStageStatus,
} from "@/services/launch/launchRun";

const STAGE_HINT: Record<string, string> = {
  plan: "Planning pages",
  contract: "Planning the application",
  "app-build": "Designing each page",
  enrich: "Finalizing the design",
  preflight: "Checking every page",
  commit: "Saving your project",
  handoff: "Opening the builder",
};

function statusIcon(status: LaunchStageStatus) {
  switch (status) {
    case "done":
      return <Check className="h-3 w-3 stroke-[2.5]" />;
    case "active":
      return (
        <Loader2 className="h-3 w-3 motion-safe:animate-spin text-cyan-200" />
      );
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
      return "bg-gradient-to-r from-cyan-500 to-blue-500 text-[#07080F] ring-2 ring-cyan-300/80 shadow-[0_0_20px_rgba(34,211,238,0.4)] motion-safe:animate-pulse";
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
  // Re-render every second so running-stage timers advance between backend events.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const activeStage = snapshot.stages.find(
    (stage) => stage.status === "active",
  );
  const failedStage = snapshot.stages.find(
    (stage) => stage.status === "failed",
  );
  const finished = snapshot.stages.every(
    (stage) => stage.status === "done" || stage.status === "degraded",
  );
  return (
    <div className={cn("space-y-8", className)}>
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-primary"><Sparkles className="h-3.5 w-3.5 motion-safe:animate-pulse" />Creating your site</div>
        <h2 role="status" className="mt-3 text-2xl font-semibold">
          {failedStage ? "Creation paused" : finished ? "Ready to review" : activeStage ? STAGE_HINT[activeStage.name] : "Preparing your project"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{failedStage ? "Review the message and try again." : statusText || "Each step appears as it completes."}</p>
      </div>
      <ol className="relative space-y-1 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-border">
        {snapshot.stages.map((stage, index) => {
          const time = duration(stage);
          const visible = stage.status !== "pending" || index <= Math.max(0, snapshot.stages.findIndex((entry) => entry.status === "active") + 1);
          if (!visible) return null;
          return (
            <li key={stage.name} className={cn("relative flex items-center gap-3 rounded-md px-1 py-3 transition-all duration-300", stage.status === "active" && "translate-x-1 bg-muted/50")}>
              <span className={cn("z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background", statusRing(stage.status))}>{statusIcon(stage.status)}</span>
              <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className={cn("text-sm", stage.status === "active" ? "font-semibold text-foreground" : stage.status === "done" ? "text-foreground/70" : "text-muted-foreground")}>{STAGE_HINT[stage.name] ?? stage.label}</span>{time && <span className="text-[10px] tabular-nums text-muted-foreground">{time}</span>}</div></div>
            </li>
          );
        })}
      </ol>
      {(snapshot.degradations.length > 0 || statusText) && <details className="border-t border-border pt-4 text-xs text-muted-foreground"><summary className="cursor-pointer font-medium">Launch details{snapshot.degradations.length ? ` · ${snapshot.degradations.length} notes` : ''}</summary>{statusText && <p className="mt-3">{statusText}</p>}{snapshot.degradations.length > 0 && <ul className="mt-3 space-y-2">{snapshot.degradations.map((degradation,index) => <li key={`${degradation.code}-${index}`}>{degradation.message}{degradation.detail && <span className="mt-1 block whitespace-pre-line text-muted-foreground/80">{degradation.detail.split('; ').join('\n')}</span>}</li>)}</ul>}</details>}
    </div>
  );
};

export default LaunchStageTimeline;
