/**
 * WizardTopAction — top-right action button for the SystemLauncher wizard.
 *
 * Renders the primary Continue / Generate button in the header (top-right)
 * and, while generating, expands into a live horizontal process rail driven
 * by the statuses emitted from the launcher runtime.
 *
 * The button is fully driven by props; all pipeline state derivation lives
 * here so the launcher shell stays lean.
 */

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WizardStepKey = "industry" | "questions" | "templates" | "aesthetic";

interface WizardTopActionProps {
  step: WizardStepKey;
  isLaunching: boolean;
  launchStatus: string;
  canContinueQuestions: boolean;
  canGenerate: boolean;
  onQuestionsNext: () => void;
  onTemplatesNext: () => void;
  onLaunch: () => void;
}

// These phases mirror the statuses emitted by SystemLauncher.handleLaunch.
const PIPELINE_STAGES: { id: string; label: string; activeLabel: string; keywords: string[] }[] = [
  { id: "prepare", label: "Prepare", activeLabel: "Preparing site", keywords: ["prepar"] },
  { id: "generate", label: "Generate", activeLabel: "Generating pages", keywords: ["generating site"] },
  {
    id: "complete",
    label: "Complete",
    activeLabel: "Completing pages",
    keywords: ["remaining", "completing", "authoring", "applying generated ui", "repair", "missing"],
  },
  { id: "validate", label: "Validate", activeLabel: "Validating site", keywords: ["finalizing preview", "review the generated"] },
  {
    id: "commit",
    label: "Commit",
    activeLabel: "Creating workspace",
    keywords: ["creating the site workspace", "live data contracts", "commit", "handoff"],
  },
];

function deriveStageFromStatus(status: string): number {
  if (!status) return 0;
  const lower = status.toLowerCase();
  for (let i = PIPELINE_STAGES.length - 1; i >= 0; i--) {
    if (PIPELINE_STAGES[i].keywords.some((k) => lower.includes(k))) return i;
  }
  return 0;
}

export function WizardTopAction(props: WizardTopActionProps) {
  const {
    step,
    isLaunching,
    launchStatus,
    canContinueQuestions,
    canGenerate,
    onQuestionsNext,
    onTemplatesNext,
    onLaunch,
  } = props;

  const activeStage = isLaunching ? deriveStageFromStatus(launchStatus) : -1;

  // Which button variant to render based on wizard step.
  const buttonNode = (() => {
    if (step === "industry") return null;

    if (step === "questions") {
      return (
        <Button
          onClick={onQuestionsNext}
          disabled={!canContinueQuestions}
          className={cn(
            "h-8 px-4 text-xs font-semibold",
            "bg-cyan-500/12 text-cyan-400 border border-cyan-500/25",
            "hover:bg-cyan-500/20 hover:shadow-[0_0_16px_rgba(0,200,255,0.12)]",
            "transition-all disabled:opacity-30"
          )}
        >
          Continue
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      );
    }

    if (step === "templates") {
      return (
        <Button
          onClick={onTemplatesNext}
          className={cn(
            "h-8 px-4 text-xs font-semibold",
            "bg-cyan-500/12 text-cyan-400 border border-cyan-500/25",
            "hover:bg-cyan-500/20 hover:shadow-[0_0_16px_rgba(0,200,255,0.12)]",
            "transition-all"
          )}
        >
          Continue
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      );
    }

    // aesthetic (generate)
    return (
      <Button
        onClick={onLaunch}
        disabled={isLaunching || !canGenerate}
        className={cn(
          "h-9 px-5 text-xs font-semibold",
          "bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/15 text-cyan-400",
          "border border-cyan-500/30",
          "hover:from-cyan-500/30 hover:to-fuchsia-500/20",
          "hover:shadow-[0_0_24px_rgba(0,200,255,0.15)]",
          "transition-all duration-300 disabled:opacity-30"
        )}
      >
        {isLaunching ? (
          <>
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            {PIPELINE_STAGES[activeStage]?.activeLabel ?? "Generating…"}
          </>
        ) : (
          <>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Generate Site
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </>
        )}
      </Button>
    );
  })();

  return (
    <div className="relative flex flex-col items-end gap-2">
      {buttonNode}

      {/* Runtime process rail — only while generating */}
      <AnimatePresence>
        {isLaunching && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(720px,calc(100vw-3rem))] overflow-hidden rounded-lg border border-cyan-500/15 bg-[#0b0d18]/95 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/70">
                Generate site
              </span>
              <span className="truncate font-mono text-[10px] text-white/40">
                {launchStatus || PIPELINE_STAGES[activeStage]?.activeLabel}
              </span>
            </div>
            <ol
              aria-label="Site generation progress"
              className="flex min-w-[540px] items-start overflow-x-auto px-3 py-3"
            >
              {PIPELINE_STAGES.map((stage, idx) => {
                const done = idx < activeStage;
                const active = idx === activeStage;
                return (
                  <li
                    key={stage.id}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "relative flex min-w-0 flex-1 flex-col items-center gap-1.5 text-[10px] transition-colors",
                      active && "text-cyan-300",
                      done && "text-cyan-500/60",
                      !active && !done && "text-white/25"
                    )}
                  >
                    {idx > 0 && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute right-1/2 top-2 h-px w-full -translate-y-1/2 transition-colors",
                          idx <= activeStage ? "bg-cyan-500/45" : "bg-white/[0.08]"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-[#0b0d18]",
                        done && "bg-cyan-500/25 text-cyan-300",
                        active && "bg-cyan-500 text-[#07080F]",
                        !active && !done && "bg-white/[0.05] text-white/30"
                      )}
                    >
                      {done ? (
                        <Check className="h-2.5 w-2.5" />
                      ) : active ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <span className="text-[9px]">{idx + 1}</span>
                      )}
                    </span>
                    <span className="w-full truncate px-1 text-center font-medium">{stage.label}</span>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
