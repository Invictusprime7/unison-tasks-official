/**
 * LauncherWizard — the Unison System Launcher.
 *
 * Selection surface only. Four steps (industry → goals → template → launch)
 * gather answers; `runLaunchPipeline` owns every deterministic stage. This
 * component never touches the VFS, never calls a model, and never authors a
 * page — it renders selections, the resolved design contract, and live
 * pipeline state.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { THEME_PRESETS, type ThemePreset } from "@/components/onboarding/themePresets";
import { StyleTokenCard } from "@/components/onboarding/StyleTokenCard";
import { TemplateLivePreview } from "@/components/onboarding/TemplateLivePreview";
import type { BusinessSystemType } from "@/data/templates/types";
import { deriveGenerationSeed } from "@/platform/core/generationSeed";
import { useLaunch } from "@/contexts/useLaunchHooks";
import {
  runLaunchPipeline,
  type LaunchOrchestratorInput,
} from "@/services/launch/launchOrchestrator";
import type { LaunchRunSnapshot } from "@/services/launch/launchRun";
import { LaunchStageTimeline } from "./LaunchStageTimeline";
import { DesignContractInspector } from "./DesignContractInspector";
import {
  buildCompositionCards,
  getDefaultTemplateCardFor,
  CUSTOMER_NEEDS,
  INDUSTRY_CARDS,
  LAUNCHER_PRESELECTS,
  PAGE_CHOICES,
  PRIMARY_GOALS,
  STEP_META,
  SYSTEM_TO_BUSINESS_MODEL,
  type CustomerNeed,
  type PageChoice,
  type PrimaryGoal,
  type TemplateCardData,
  type WizardStep,
} from "./wizardCatalog";

export interface LauncherWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: {
    businessId: string;
    businessName: string | null;
    industry: string | null;
    notificationEmail: string | null;
  } | null;
}

const STEP_ORDER: WizardStep[] = ["industry", "questions", "templates", "aesthetic"];

export const LauncherWizard = ({ open, onOpenChange, prefill }: LauncherWizardProps) => {
  const navigate = useNavigate();
  const { setLaunch } = useLaunch();

  const [step, setStep] = useState<WizardStep>("industry");
  const [systemId, setSystemId] = useState<BusinessSystemType | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [customerNeeds, setCustomerNeeds] = useState<CustomerNeed[]>([]);
  const [selectedPages, setSelectedPages] = useState<PageChoice[]>([]);
  const [template, setTemplate] = useState<TemplateCardData | null>(null);
  const [theme, setTheme] = useState<ThemePreset | null>(THEME_PRESETS[0] ?? null);

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState("");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LaunchRunSnapshot | null>(null);

  const reset = useCallback(() => {
    setStep("industry");
    setSystemId(null);
    setBusinessName("");
    setPrimaryGoal(null);
    setCustomerNeeds([]);
    setSelectedPages([]);
    setTemplate(null);
    setTheme(THEME_PRESETS[0] ?? null);
    setIsLaunching(false);
    setLaunchStatus("");
    setLaunchError(null);
    setProgress(null);
  }, []);

  useEffect(() => {
    if (open && prefill?.businessName) setBusinessName(prefill.businessName);
  }, [open, prefill?.businessName]);

  const templates = useMemo(
    () => (systemId ? buildCompositionCards(systemId) : []),
    [systemId],
  );
  const effectiveTemplate = template || getDefaultTemplateCardFor(systemId);

  const previewSeed = useMemo(
    () =>
      deriveGenerationSeed({
        businessName,
        businessModel: systemId ? SYSTEM_TO_BUSINESS_MODEL[systemId] : "general",
        industry: effectiveTemplate?.industry,
        templateId: effectiveTemplate?.id,
        themePresetId: theme?.id,
        primaryGoal,
        secondaryGoals: customerNeeds,
        requestedPages: ["home", ...selectedPages],
      }),
    [businessName, systemId, effectiveTemplate, theme, primaryGoal, customerNeeds, selectedPages],
  );

  const selectSystem = (id: BusinessSystemType) => {
    setSystemId(id);
    const preselect = LAUNCHER_PRESELECTS[id];
    setPrimaryGoal(preselect.primaryGoal);
    setCustomerNeeds(preselect.customerNeeds);
    setSelectedPages(preselect.pages);
    setTemplate(getDefaultTemplateCardFor(id));
    setStep("questions");
  };

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  const canContinue =
    step === "industry"
      ? Boolean(systemId)
      : step === "questions"
        ? Boolean(primaryGoal)
        : step === "templates"
          ? Boolean(effectiveTemplate)
          : Boolean(businessName.trim() && theme && effectiveTemplate);

  const goBack = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) setStep(STEP_ORDER[index - 1]);
  };

  const goNext = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index < STEP_ORDER.length - 1) setStep(STEP_ORDER[index + 1]);
  };

  const handleGenerate = async () => {
    if (isLaunching || !systemId || !effectiveTemplate || !theme) return;
    if (!businessName.trim()) {
      setLaunchError("Please enter your business name.");
      return;
    }
    setIsLaunching(true);
    setLaunchError(null);
    setLaunchStatus("Preparing your site…");

    const input: LaunchOrchestratorInput = {
      systemId,
      template: effectiveTemplate,
      theme,
      businessName,
      primaryGoal,
      customerNeeds,
      selectedPages,
      existingBusinessId: prefill?.businessId ?? null,
    };

    try {
      const result = await runLaunchPipeline(input, {
        onStatus: setLaunchStatus,
        onProgress: setProgress,
      });
      setLaunch(result.launchState);
      navigate("/web-builder", { replace: true, state: result.navigationState });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setLaunchError(`${message} Your selections are preserved — press Generate to try again.`);
    } finally {
      setIsLaunching(false);
      setLaunchStatus("");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isLaunching) return;
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="h-[calc(100dvh-1rem)] w-[calc(100%-1.5rem)] max-w-[360px] content-start gap-0 overflow-y-auto border-0 bg-[#07080F] p-0 text-white shadow-[0_0_100px_rgba(0,200,255,0.06)] sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-[980px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Launch your website</DialogTitle>
        </DialogHeader>

        {/* Stepper + top action */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3">
          <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
            {STEP_META.map((meta) => {
              const index = STEP_ORDER.indexOf(meta.key);
              const current = STEP_ORDER.indexOf(step);
              const state = index < current ? "done" : index === current ? "active" : "todo";
              return (
                <li
                  key={meta.key}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]",
                    state === "active" && "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
                    state === "done" && "border-white/10 text-white/45",
                    state === "todo" && "border-white/[0.06] text-white/25",
                  )}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.08] text-[9px] font-bold">
                    {state === "done" ? <Check className="h-2.5 w-2.5" /> : meta.num}
                  </span>
                  {meta.label}
                </li>
              );
            })}
          </ol>

          <div className="flex shrink-0 items-center gap-2">
            {step !== "industry" && !isLaunching && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="h-8 px-2 text-white/45 hover:text-white"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
            )}
            {step === "aesthetic" ? (
              <Button
                size="sm"
                disabled={!canContinue || isLaunching}
                onClick={handleGenerate}
                className="h-8 bg-cyan-500 font-semibold text-[#07080F] hover:bg-cyan-400"
              >
                {isLaunching ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkle className="mr-1.5 h-3.5 w-3.5" />
                )}
                {isLaunching ? "Generating…" : "Generate site"}
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!canContinue}
                onClick={goNext}
                className="h-8 bg-cyan-500 font-semibold text-[#07080F] hover:bg-cyan-400"
              >
                Continue
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_320px]">
          {/* ── Left: selections ─────────────────────────────────────────── */}
          <div className="min-w-0 space-y-4">
            {step === "industry" && (
              <>
                <StepHeading
                  title="What kind of business is this?"
                  subtitle="This decides your pages, capabilities and intent contracts."
                />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {INDUSTRY_CARDS.map((card) => (
                    <button
                      key={card.systemId}
                      type="button"
                      onClick={() => selectSystem(card.systemId)}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
                        systemId === card.systemId
                          ? "border-cyan-400/40 bg-cyan-400/[0.06]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15",
                      )}
                    >
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
                          card.gradient,
                        )}
                      />
                      <div className="relative">
                        <div className="mb-1.5 text-xl">{card.icon}</div>
                        <div className="text-sm font-semibold">{card.label}</div>
                        <div className="text-[11px] text-white/35">{card.tagline}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "questions" && (
              <>
                <StepHeading
                  title="What should the site do for you?"
                  subtitle="Goals and pages are contracts — they decide topology and intents."
                />
                <FieldLabel>Primary goal</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PRIMARY_GOALS.map((goal) => (
                    <Chip
                      key={goal.id}
                      active={primaryGoal === goal.id}
                      onClick={() => setPrimaryGoal(goal.id)}
                    >
                      <span className="mr-1.5">{goal.icon}</span>
                      {goal.label}
                    </Chip>
                  ))}
                </div>

                <FieldLabel>What customers need to do</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {CUSTOMER_NEEDS.map((need) => (
                    <Chip
                      key={need.id}
                      active={customerNeeds.includes(need.id)}
                      onClick={() => setCustomerNeeds((prev) => toggle(prev, need.id))}
                    >
                      <span className="mr-1.5">{need.icon}</span>
                      {need.label}
                    </Chip>
                  ))}
                </div>

                <FieldLabel>Pages to build (Home is always included)</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {PAGE_CHOICES.map((page) => (
                    <Chip
                      key={page.id}
                      active={selectedPages.includes(page.id)}
                      onClick={() => setSelectedPages((prev) => toggle(prev, page.id))}
                    >
                      <span className="mr-1.5">{page.icon}</span>
                      {page.label}
                    </Chip>
                  ))}
                </div>
              </>
            )}

            {step === "templates" && (
              <>
                <StepHeading
                  title="Pick your base composition"
                  subtitle="Every card is a registered composition — what you pick is what compiles."
                />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {templates.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setTemplate(card)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all",
                        effectiveTemplate?.id === card.id
                          ? "border-cyan-400/40 bg-cyan-400/[0.06]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15",
                      )}
                    >
                      <div className="text-sm font-semibold">{card.label}</div>
                      <div className="mb-2 line-clamp-2 text-[11px] text-white/35">
                        {card.description}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {card.sectionTypes.slice(0, 6).map((section, index) => (
                          <span
                            key={`${card.id}-${section}-${index}`}
                            className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] text-white/40"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === "aesthetic" && (
              <>
                <StepHeading
                  title="Name it and choose a style"
                  subtitle="Style resolves to theme tokens — the same tokens the compiler writes."
                />
                <div>
                  <FieldLabel>Business name</FieldLabel>
                  <Input
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="e.g. Northside Studio"
                    className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/25"
                  />
                </div>
                <FieldLabel>Visual style</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {THEME_PRESETS.map((preset) => (
                    <Chip
                      key={preset.id}
                      active={theme?.id === preset.id}
                      onClick={() => setTheme(preset)}
                    >
                      <span className="mr-1.5">{preset.icon}</span>
                      {preset.label}
                    </Chip>
                  ))}
                </div>
                <StyleTokenCard theme={theme} businessName={businessName} />
              </>
            )}

            {launchError && (
              <div className="rounded-xl border border-rose-400/25 bg-rose-500/[0.07] px-4 py-3 text-[12px] text-rose-200">
                {launchError}
              </div>
            )}
          </div>

          {/* ── Right: awareness rail ────────────────────────────────────── */}
          <aside className="min-w-0 space-y-3">
            {progress ? (
              <LaunchStageTimeline snapshot={progress} statusText={launchStatus} />
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-xs font-semibold text-white/80">Live preview</div>
                <div className="mb-2 text-[10px] text-white/30">
                  The section flow your selections compile to.
                </div>
                <TemplateLivePreview
                  template={effectiveTemplate}
                  businessName={businessName || "Your business"}
                />
              </div>
            )}

            <DesignContractInspector
              templateId={effectiveTemplate?.id ?? null}
              seed={previewSeed}
              selectedPages={selectedPages}
            />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StepHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div>
    <h2 className="text-base font-semibold tracking-tight">{title}</h2>
    <p className="text-[11px] text-white/35">{subtitle}</p>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="pt-1 text-[10px] uppercase tracking-wide text-white/25">{children}</div>
);

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
      active
        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
        : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80",
    )}
  >
    {children}
  </button>
);

export default LauncherWizard;
