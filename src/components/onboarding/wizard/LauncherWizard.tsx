/**
 * LauncherWizard — the Unison System Launcher.
 *
 * Selection surface only. Three steps: idea, goals and brand style.
 * gather answers; `runLaunchPipeline` owns every deterministic stage. This
 * component never touches the VFS or authors a page. The orchestrator owns
 * deterministic generation and any guarded AI enrichment while this surface
 * renders selections, the resolved design contract, and live pipeline state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  THEME_PRESETS,
  type ThemePreset,
} from "@/components/onboarding/themePresets";
import { StyleTokenCard } from "@/components/onboarding/StyleTokenCard";
import {
  type ArtDirectionPackId,
} from "@/sections/variants/artDirectionPacks";
import {
  getWizardSectionPickers,
  getWizardVisualDirections,
} from "@/services/wizardDesignAvailability";
import {
  createWizardDesignSelection,
  type WizardExperiencePreference,
} from "@/services/wizardDesignSelection";
import type { VariantId } from "@/sections/variants/types";


import { ImportProjectZipButton } from "@/components/onboarding/ImportProjectZipButton";
import { ImportUnisonSiteZipButton } from "@/components/onboarding/ImportUnisonSiteZipButton";
import type { BusinessSystemType } from "@/data/templates/types";

import { useLaunch } from "@/contexts/useLaunchHooks";
import {
  runLaunchPipeline,
  type LaunchOrchestratorInput,
} from "@/services/launch/launchOrchestrator";
import {
  createLaunchFailureReport,
  persistLaunchFailureReport,
  type LaunchFailureReport,
  type LaunchRunSnapshot,
} from "@/services/launch/launchRun";
import { LaunchStageTimeline } from "./LaunchStageTimeline";

import {
  classifyPromptForWizard,
  type WizardPromptAnalysis,
} from "./wizardPromptClassifier";
import {
  getIndustryCustomerNeeds,
  getIndustryDefaultPageChoices,
  getIndustryPageChoiceCards,
  getIndustryPrimaryGoal,
  CUSTOMER_NEEDS,
  INDUSTRY_FOCUS_CARDS,
  PRIMARY_GOALS,
  STEP_META,
  type CustomerNeed,
  type PageChoice,
  type PrimaryGoal,
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

const STEP_ORDER: WizardStep[] = [
  "industry",
  "questions",
  "aesthetic",
];

const PROMPT_PRESETS = [
  {
    label: "🚀 SaaS Platform",
    prompt:
      "Developer SaaS platform named Apex with cloud APIs, tier pricing, and documentation",
  },
  {
    label: "✂️ Salon & Spa",
    prompt:
      "Luxury boutique salon and spa named Studio Glow with online booking and lookbook gallery",
  },
  {
    label: "🍽️ Bistro & Dining",
    prompt:
      "Farm-to-table bistro called Bella Tavola with seasonal dinner menu and reservations",
  },
  {
    label: "🔨 Home Contractor",
    prompt:
      "Residential construction contractor named Forge Builders with project estimates and past work",
  },
  {
    label: "🏠 Real Estate",
    prompt:
      "Modern real estate agency named Horizon Estates with luxury property listings",
  },
  {
    label: "🛍️ E-Commerce Shop",
    prompt:
      "Streetwear fashion store with product catalog, cart, and instant checkout",
  },
];

export const LauncherWizard = ({
  open,
  onOpenChange,
  prefill,
}: LauncherWizardProps) => {
  const navigate = useNavigate();
  const { setLaunch } = useLaunch();

  const [step, setStep] = useState<WizardStep>("industry");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [systemId, setSystemId] = useState<BusinessSystemType | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [customerNeeds, setCustomerNeeds] = useState<CustomerNeed[]>([]);
  const [selectedPages, setSelectedPages] = useState<PageChoice[]>([]);
  const [theme, setTheme] = useState<ThemePreset | null>(
    THEME_PRESETS[0] ?? null,
  );
  const [artDirectionPackId, setArtDirectionPackId] = useState<ArtDirectionPackId | null>(null);
  const [experience, setExperience] = useState<WizardExperiencePreference>("standard");
  const [sectionPins, setSectionPins] = useState<Record<string, VariantId>>({});

  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [visionPrompt, setVisionPrompt] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<WizardPromptAnalysis | null>(
    null,
  );

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState("");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchFailure, setLaunchFailure] =
    useState<LaunchFailureReport | null>(null);
  const [progress, setProgress] = useState<LaunchRunSnapshot | null>(null);
  const latestProgressRef = useRef<LaunchRunSnapshot | null>(null);

  const reset = useCallback(() => {
    setStep("industry");
    setSelectedIndustry(null);
    setSystemId(null);
    setBusinessName("");
    setPrimaryGoal(null);
    setCustomerNeeds([]);
    setSelectedPages([]);
    setTheme(THEME_PRESETS[0] ?? null);
    setArtDirectionPackId(null);
    setExperience("standard");
    setSectionPins({});

    setSocialLinks({});
    setVisionPrompt("");
    setAiAnalysis(null);
    setIsLaunching(false);
    setLaunchStatus("");
    setLaunchError(null);
    setLaunchFailure(null);
    setProgress(null);
    latestProgressRef.current = null;
  }, []);

  const handleVisionPromptChange = (value: string) => {
    setVisionPrompt(value);
    const analysis = classifyPromptForWizard(value);
    setAiAnalysis(analysis);
    if (analysis) {
      setSelectedIndustry(analysis.industry);
      setSystemId(analysis.systemId);
      if (analysis.businessName && !businessName) {
        setBusinessName(analysis.businessName);
      }
      setPrimaryGoal(analysis.primaryGoal);
      setCustomerNeeds(analysis.customerNeeds);
      setSelectedPages(analysis.selectedPages);
      const matchedTheme = THEME_PRESETS.find(
        (p) => p.id === analysis.themePresetId,
      );
      if (matchedTheme) setTheme(matchedTheme);
    }
  };

  const applyAiAnalysisAndContinue = () => {
    if (!aiAnalysis) return;
    setStep("questions");
  };

  useEffect(() => {
    if (open && prefill?.businessName) setBusinessName(prefill.businessName);
  }, [open, prefill?.businessName]);

  const selectIndustry = (industry: string, id: BusinessSystemType) => {
    setSelectedIndustry(industry);
    setSystemId(id);
    setPrimaryGoal(getIndustryPrimaryGoal(industry));
    setCustomerNeeds(getIndustryCustomerNeeds(industry));
    setSelectedPages(getIndustryDefaultPageChoices(industry));
    setStep("questions");
  };

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value)
      ? list.filter((entry) => entry !== value)
      : [...list, value];

  const pageChoices = useMemo(
    () => getIndustryPageChoiceCards(selectedIndustry),
    [selectedIndustry],
  );

  // Design availability is a registry projection: directions and section
  // choices are derived from the certified registry, the coverage gate, the
  // selected pages and the experience preference — never hard-coded here.
  const visualDirections = useMemo(
    () => getWizardVisualDirections({ selectedPages, experience }),
    [selectedPages, experience],
  );
  const sectionPickers = useMemo(
    () => getWizardSectionPickers(artDirectionPackId, experience),
    [artDirectionPackId, experience],
  );

  // A direction or pin that stops being eligible after another change must not
  // survive silently into the launch brief.
  useEffect(() => {
    if (
      artDirectionPackId &&
      !visualDirections.some((option) => option.id === artDirectionPackId && option.available)
    ) {
      setArtDirectionPackId(null);
    }
  }, [artDirectionPackId, visualDirections]);

  useEffect(() => {
    setSectionPins((current) => {
      const allowed = new Set(
        sectionPickers.flatMap((picker) => picker.options.map((option) => option.variantId)),
      );
      const next = Object.fromEntries(
        Object.entries(current).filter(([, variantId]) => allowed.has(variantId)),
      );
      return Object.keys(next).length === Object.keys(current).length ? current : next;
    });
  }, [sectionPickers]);



  const canContinue =
    step === "industry"
      ? Boolean(systemId && selectedIndustry)
      : step === "questions"
        ? Boolean(primaryGoal)
        : Boolean(businessName.trim() && theme);

  const goBack = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index > 0) setStep(STEP_ORDER[index - 1]);
  };

  const goNext = () => {
    const index = STEP_ORDER.indexOf(step);
    if (index < STEP_ORDER.length - 1) setStep(STEP_ORDER[index + 1]);
  };

  const handleGenerate = async () => {
    if (isLaunching || !systemId || !theme) return;
    if (!businessName.trim()) {
      setLaunchError("Please enter your business name.");
      return;
    }
    setIsLaunching(true);
    setLaunchError(null);
    setLaunchFailure(null);
    latestProgressRef.current = null;
    setLaunchStatus("Preparing your site…");

    const input: LaunchOrchestratorInput = {
      systemId,
      industry: selectedIndustry || undefined,
      visionPrompt,
      theme,
      designSelection: createWizardDesignSelection({
        mode: artDirectionPackId ? "guided" : "auto",
        artDirectionPackId: artDirectionPackId ?? undefined,
        experience,
        sectionPins,
      }),
      businessName,
      primaryGoal,
      customerNeeds,
      selectedPages,
      socialLinks,
      existingBusinessId: prefill?.businessId ?? null,
    };

    try {
      const result = await runLaunchPipeline(input, {
        onStatus: setLaunchStatus,
        onProgress: (snapshot) => {
          latestProgressRef.current = snapshot;
          setProgress(snapshot);
        },
      });
      setLaunch(result.launchState);
      navigate("/web-builder", {
        replace: true,
        state: result.navigationState,
      });
      onOpenChange(false);
    } catch (error) {
      const report = createLaunchFailureReport(error, latestProgressRef.current);
      const reportText = JSON.stringify(report, null, 2);
      persistLaunchFailureReport(report);
      setLaunchFailure(report);
      setLaunchError(
        `[${report.code}] ${report.message} Your selections are preserved — press Generate to try again.`,
      );
      console.error('[LauncherWizard] Generate Site failed', report, error);
      toast.error(`Generate Site failed in ${report.stage}`, {
        id: "wizard-generate-site-failed",
        description: `${report.code}: ${report.message}`,
        duration: 30_000,
        action: {
          label: 'Copy details',
          onClick: () => void navigator.clipboard?.writeText(reportText),
        },
      });
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
      <DialogContent className="max-h-[94dvh] w-[calc(100%-1rem)] max-w-[1080px] gap-0 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0d14] p-0 text-white shadow-2xl sm:w-[calc(100%-3rem)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Launch your website</DialogTitle>
        </DialogHeader>

        {/* Stepper + top action */}
        <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 pr-12 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:pr-14">
          <ol
            aria-label="Website setup progress"
            className="flex min-w-0 flex-wrap items-center gap-1.5"
          >
            {STEP_META.map((meta) => {
              const index = STEP_ORDER.indexOf(meta.key);
              const current = STEP_ORDER.indexOf(step);
              const state =
                index < current
                  ? "done"
                  : index === current
                    ? "active"
                    : "todo";
              return (
                <li
                  key={meta.key}
                  aria-current={state === "active" ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-1.5 py-1 text-[10px] sm:px-2.5 sm:text-[11px]",
                    state === "active" &&
                      "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
                    state === "done" && "border-white/10 text-white/45",
                    state === "todo" && "border-white/[0.06] text-white/25",
                  )}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.08] text-[9px] font-bold">
                    {state === "done" ? (
                      <Check className="h-2.5 w-2.5" />
                    ) : (
                      meta.num
                    )}
                  </span>
                  {meta.label}
                </li>
              );
            })}
          </ol>

          {step !== "industry" && (
            <div className="flex shrink-0 items-center gap-2">
              {!isLaunching && (
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
                  disabled={!canContinue || isLaunching}
                  onClick={goNext}
                  className="h-8 bg-cyan-500 font-semibold text-[#07080F] hover:bg-cyan-400"
                >
                  Continue
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "grid gap-8 p-5 sm:p-8",
            step !== "industry" &&
              !isLaunching &&
              "lg:grid-cols-[minmax(0,1fr)_280px]",
          )}
        >
          {/* ── Left: selections ─────────────────────────────────────────── */}
          <fieldset
            disabled={isLaunching}
            aria-busy={isLaunching}
            className={cn("min-w-0 space-y-5", isLaunching && "hidden")}
          >
            {step === "industry" && (
              <>
                <div className="mx-auto max-w-2xl space-y-6 py-3 sm:py-8">
                  <div className="space-y-3 text-center">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-cyan-300">
                      <Sparkles className="h-4 w-4" /> Unison AI Studio
                    </span>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                      What would you like to create?
                    </h2>
                    <p className="text-sm leading-6 text-slate-400">
                      Start with your idea. Shape the details. Make it yours.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 shadow-lg focus-within:border-cyan-400/60">
                    <label htmlFor="wizard-vision" className="sr-only">
                      Describe your website
                    </label>
                    <Textarea
                      id="wizard-vision"
                      value={visionPrompt}
                      onChange={(e) => handleVisionPromptChange(e.target.value)}
                      placeholder="A website for Studio Glow, a boutique salon with online booking, a lookbook, and a warm, minimal feel..."
                      className="min-h-32 resize-y border-0 bg-transparent p-1 text-base text-white shadow-none placeholder:text-slate-500 focus-visible:ring-0"
                    />
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
                      <span className="text-xs text-slate-400">
                        Your business, your audience, your style.
                      </span>
                      <Button
                        onClick={applyAiAnalysisAndContinue}
                        disabled={!aiAnalysis}
                        className="rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                      >
                        Shape my idea <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {PROMPT_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleVisionPromptChange(preset.prompt)}
                        className="rounded-full border border-white/10 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-cyan-400/40 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  {aiAnalysis && (
                    <div
                      className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4"
                      role="status"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
                        <Check className="h-4 w-4" /> A starting point for your
                        idea
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {INDUSTRY_FOCUS_CARDS.find(
                          (card) => card.industry === selectedIndustry,
                        )?.label ?? selectedIndustry}{" "}
                        ? {selectedPages.length + 1} pages ? {theme?.label}{" "}
                        style
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Review your goals, choose your pages, and adjust your
                        style before building.
                      </p>
                    </div>
                  )}
                </div>
                <details className="rounded-xl border border-white/10 p-4">
                  <summary className="cursor-pointer text-sm text-slate-300">
                    Or explore by industry
                  </summary>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {INDUSTRY_FOCUS_CARDS.map((card) => {
                      const isAiMatch = aiAnalysis?.industry === card.industry;
                      return (
                        <button
                          key={card.industry}
                          type="button"
                          onClick={() =>
                            selectIndustry(card.industry, card.systemId)
                          }
                          className={cn(
                            "group relative overflow-hidden rounded-xl border p-4 text-left transition-all",
                            selectedIndustry === card.industry
                              ? "border-cyan-400/40 bg-cyan-400/[0.06]"
                              : isAiMatch
                                ? "border-cyan-400/60 bg-cyan-400/[0.08] shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                                : "border-white/[0.06] bg-white/[0.02] hover:border-white/15",
                          )}
                        >
                          <div className="relative">
                            <div className="flex items-center justify-between">
                              <div className="mb-1.5 text-xl">{card.icon}</div>
                              {isAiMatch && (
                                <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300">
                                  ✨ AI Pick
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-semibold">
                              {card.label}
                            </div>
                            <div className="mt-1 text-[11px] leading-4 text-white/35">
                              {card.tagline}
                            </div>
                            {card.defaultTemplateId ? (
                              <div className="mt-2 text-[9px] uppercase tracking-[0.12em] text-cyan-300/60">
                                Ready to personalize
                              </div>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </details>
                <details className="rounded-xl border border-white/10 p-4">
                  <summary className="cursor-pointer text-sm text-slate-300">
                    Bring an existing project
                  </summary>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <ImportProjectZipButton
                      onImported={() => onOpenChange(false)}
                    />
                    {prefill?.businessId && (
                      <ImportUnisonSiteZipButton
                        businessId={prefill.businessId}
                        onImported={() => onOpenChange(false)}
                      />
                    )}
                  </div>
                </details>
              </>
            )}

            {step === "questions" && (
              <>
                <StepHeading
                  title="What should the site do for you?"
                  subtitle="Choose your main goal and how visitors can connect with you."
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
                      onClick={() =>
                        setCustomerNeeds((prev) => toggle(prev, need.id))
                      }
                    >
                      <span className="mr-1.5">{need.icon}</span>
                      {need.label}
                    </Chip>
                  ))}
                </div>

                <FieldLabel>
                  Pages to build (Home is always included)
                </FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {pageChoices.map((page) => (
                    <Chip
                      key={page.id}
                      active={selectedPages.includes(page.id)}
                      onClick={() =>
                        setSelectedPages((prev) => toggle(prev, page.id))
                      }
                    >
                      <span className="mr-1.5">{page.icon}</span>
                      {page.label}
                    </Chip>
                  ))}
                </div>
              </>
            )}

            {step === "aesthetic" && (
              <>
                <StepHeading
                  title="Name it and choose a style"
                  subtitle="Choose the look and feel for your whole site. Your selected style guides the build."
                />
                <div>
                  <FieldLabel>Business name</FieldLabel>
                  <Input
                    aria-label="Business name"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="e.g. Northside Studio"
                    className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/25"
                  />
                </div>
                <div>
                  <FieldLabel>Social profiles</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(
                      ["instagram", "facebook", "linkedin", "youtube"] as const
                    ).map((platform) => (
                      <Input
                        key={platform}
                        value={socialLinks[platform] || ""}
                        onChange={(event) =>
                          setSocialLinks((current) => ({
                            ...current,
                            [platform]: event.target.value,
                          }))
                        }
                        placeholder={`${platform[0].toUpperCase()}${platform.slice(1)} URL`}
                        aria-label={`${platform} profile URL`}
                        className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/25"
                      />
                    ))}
                  </div>
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
                <div>
                  <FieldLabel>Visual direction</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Chip active={artDirectionPackId === null} onClick={() => setArtDirectionPackId(null)}>
                      Auto match
                    </Chip>
                    {visualDirections.map((option) => (
                      <Chip
                        key={option.id}
                        active={artDirectionPackId === option.id}
                        disabled={!option.available}
                        title={option.unavailableReason}
                        onClick={() => option.available && setArtDirectionPackId(option.id)}
                      >
                        <span className="flex flex-col items-start">
                          <span>
                            {option.name}
                            {!option.available && " — unavailable"}
                          </span>
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {option.available ? option.description : option.unavailableReason}
                          </span>
                        </span>
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Experience</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {([
                      ["standard", "Standard"],
                      ["motion-rich", "Motion rich"],
                      ["immersive", "Immersive 3D"],
                    ] as const).map(([value, label]) => (
                      <Chip key={value} active={experience === value} onClick={() => setExperience(value)}>
                        {label}
                      </Chip>
                    ))}
                  </div>
                </div>
                {sectionPickers.length > 0 && (
                  <div>
                    <FieldLabel>Customize sections</FieldLabel>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {sectionPickers.map((picker) => (
                        <label key={picker.sectionType} className="flex flex-col gap-1 text-[11px] text-white/60">
                          <span className="capitalize">{picker.sectionType.replace(/-/g, " ")}</span>
                          <select
                            value={sectionPins[picker.sectionType] ?? ""}
                            onChange={(event) =>
                              setSectionPins((current) => {
                                const next = { ...current };
                                if (!event.target.value) delete next[picker.sectionType];
                                else next[picker.sectionType] = event.target.value as VariantId;
                                return next;
                              })
                            }
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[12px] text-white"
                          >
                            <option value="">Auto</option>
                            {picker.options.map((option) => (
                              <option key={option.variantId} value={option.variantId}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

              </>
            )}

            {launchError && (
              <div className="rounded-xl border border-rose-400/25 bg-rose-500/[0.07] px-4 py-3 text-[12px] text-rose-200">
                <div>{launchError}</div>
                {launchFailure && (
                  <details className="mt-2 text-[11px] text-rose-100/75">
                    <summary className="cursor-pointer font-semibold">
                      Technical details
                    </summary>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-black/25 p-2 font-mono text-[10px]">
                      {JSON.stringify(launchFailure, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </fieldset>

          {/* Right: awareness rail ────────────────────────────────────── */}
          {(step !== "industry" || progress) && (
            <aside
              className={cn(
                "min-w-0 space-y-4",
                isLaunching && "mx-auto w-full max-w-xl",
              )}
            >
              {progress ? (
                <LaunchStageTimeline
                  snapshot={progress}
                  statusText={launchStatus}
                />
              ) : (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="text-xs font-semibold text-white/80">Your site brief</div>
                  <p className="mt-2 text-sm text-slate-400">AI will compose your pages around your business, goals and chosen style.</p>
                  <p className="mt-3 text-sm">{businessName || 'Your business'} ? {selectedIndustry}</p>
                  <p className="mt-2 text-xs text-slate-400">Pages: {['home', ...selectedPages].join(', ')}</p>
                </div>
              )}


            </aside>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StepHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div>
    <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="pt-2 text-xs font-medium text-slate-400">{children}</div>
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
    aria-pressed={active}
    className={cn(
      "rounded-xl border px-4 py-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300",
      active
        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
        : "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/20 hover:text-white",
    )}
  >
    {children}
  </button>
);

export default LauncherWizard;
