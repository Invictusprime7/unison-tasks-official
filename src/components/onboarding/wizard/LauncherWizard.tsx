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
  ChevronDown,
  Loader2,
  Monitor,
  Smartphone,
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
import { VFSPreview } from '@/components/VFSPreview';

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
  const [review, setReview] = useState<{ files: Record<string, string>; entryPoint: string } | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewReady, setPreviewReady] = useState(false);
  const reviewDecision = useRef<((accept: boolean) => void) | null>(null);
  const generationRef = useRef(0);
  const handlePreviewReady = useCallback(() => { setPreviewReady(true); setLaunchError(null); }, []);
  const handlePreviewError = useCallback((message: string) => { setPreviewReady(false); setLaunchError(`Preview could not render: ${message}`); }, []);
  useEffect(() => () => { generationRef.current++; reviewDecision.current?.(false); }, []);

  const reset = useCallback(() => {
    generationRef.current++;
    reviewDecision.current?.(false);
    reviewDecision.current = null;
    setReview(null);
    setPreviewReady(false);
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
    reviewDecision.current?.(false);
    reviewDecision.current = null;
    const generation = ++generationRef.current;
    setReview(null);
    setPreviewReady(false);
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
      regenerationNonce: generation > 1 ? `take-${generation}` : null,
    };

    try {
      const result = await runLaunchPipeline(input, {
        onReview: candidate => new Promise<boolean>(resolve => {
          if (generation !== generationRef.current) { resolve(false); return; }
          setReview(candidate);
          setIsLaunching(false);
          reviewDecision.current = resolve;
        }),
        onStatus: status => { if (generation === generationRef.current) setLaunchStatus(status); },
        onProgress: (snapshot) => {
          latestProgressRef.current = snapshot;
          setProgress(snapshot);
        },
      });
      if (generation !== generationRef.current) return;
      setLaunch(result.launchState);
      navigate("/web-builder", {
        replace: true,
        state: result.navigationState,
      });
      onOpenChange(false);
    } catch (error) {
      if (generation !== generationRef.current || (error instanceof Error && error.name === 'LaunchReviewCancelled')) return;
      setReview(null);
      reviewDecision.current = null;
      setPreviewReady(false);
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
      if (generation === generationRef.current) {
        setIsLaunching(false);
        setLaunchStatus("");
      }
    }
  };

  const currentStepIndex = STEP_ORDER.indexOf(step);
  const selectedThemeIndex = Math.max(0, THEME_PRESETS.findIndex((preset) => preset.id === theme?.id));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isLaunching) return;
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-h-[94dvh] w-[calc(100%-1rem)] max-w-[1040px] gap-0 overflow-hidden rounded-lg border-border bg-background p-0 text-foreground shadow-2xl sm:w-[calc(100%-3rem)]">
        <DialogHeader className="sr-only">
          <DialogTitle>Launch your website</DialogTitle>
        </DialogHeader>

        {!review && (
          <header className="border-b border-border px-5 py-4 pr-14 sm:px-7 sm:pr-16">
            <div className="flex items-center justify-between gap-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Create a website</p>
                  <p className="truncate text-xs text-muted-foreground">{STEP_META[currentStepIndex]?.sublabel}</p>
                </div>
              </div>
              {!isLaunching && (
                <div className="flex items-center gap-2" aria-label="Website setup progress">
                  {STEP_META.map((meta, index) => (
                    <span
                      key={meta.key}
                      aria-current={index === currentStepIndex ? "step" : undefined}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === currentStepIndex ? "w-8 bg-primary" : index < currentStepIndex ? "w-4 bg-primary/45" : "w-4 bg-muted",
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs tabular-nums text-muted-foreground">{currentStepIndex + 1}/3</span>
                </div>
              )}
            </div>
          </header>
        )}

        {review ? (
          <section className="flex max-h-[94dvh] min-h-0 flex-col" data-testid="wizard-generated-review">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 pr-14 sm:px-7 sm:pr-16">
              <div>
                <h2 className="text-lg font-semibold">Your site is ready to review</h2>
                <p className="text-xs text-muted-foreground">Check the result before opening it in the builder.</p>
              </div>
              <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1">
                <Button size="icon" variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'} aria-label="Desktop preview" aria-pressed={previewDevice === 'desktop'} onClick={() => setPreviewDevice('desktop')} className="h-8 w-8"><Monitor /></Button>
                <Button size="icon" variant={previewDevice === 'mobile' ? 'secondary' : 'ghost'} aria-label="Mobile preview" aria-pressed={previewDevice === 'mobile'} onClick={() => setPreviewDevice('mobile')} className="h-8 w-8"><Smartphone /></Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 bg-muted/30 p-3 sm:p-4">
              <div className="h-[64dvh] min-h-96 overflow-hidden rounded-md border border-border bg-background">
                <VFSPreview nodes={[]} files={review.files} activeFile={review.entryPoint} device={previewDevice} forceBackend="sandpack" autoStart={false} showToolbar={false} onReady={handlePreviewReady} onError={handlePreviewError} />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex gap-2">
                <Button variant="ghost" disabled={isLaunching} onClick={() => { reviewDecision.current?.(false); reviewDecision.current = null; setReview(null); }}>Edit details</Button>
                <Button variant="outline" disabled={isLaunching} onClick={handleGenerate}>Try another</Button>
              </div>
              <Button disabled={isLaunching || !previewReady} onClick={() => { setIsLaunching(true); reviewDecision.current?.(true); reviewDecision.current = null; }}>
                {isLaunching ? <Loader2 className="animate-spin" /> : <Sparkle />}
                {isLaunching ? 'Opening…' : 'Open in builder'}
              </Button>
            </div>
            {launchError && <p role="alert" className="px-7 pb-4 text-sm text-destructive">{launchError}</p>}
          </section>
        ) : (
          <div className="max-h-[calc(94dvh-65px)] overflow-y-auto">
            {isLaunching && progress ? (
              <div className="mx-auto flex min-h-[560px] max-w-xl items-center px-6 py-12">
                <LaunchStageTimeline snapshot={progress} statusText={launchStatus} className="w-full" />
              </div>
            ) : (
              <fieldset disabled={isLaunching} aria-busy={isLaunching} className="mx-auto max-w-4xl px-5 py-7 sm:px-8 sm:py-10">
                <div key={step} className="animate-fade-in">
                  {step === "industry" && (
                    <div className="mx-auto max-w-2xl space-y-7">
                      <StepHeading title="What are you creating?" subtitle="Describe the business and the outcome you want. We’ll shape the starting point." />
                      <div className="rounded-lg border border-border bg-card p-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
                        <label htmlFor="wizard-vision" className="sr-only">Describe your website</label>
                        <Textarea id="wizard-vision" value={visionPrompt} onChange={(event) => handleVisionPromptChange(event.target.value)} placeholder="A boutique salon with online booking, a lookbook, and a warm, minimal feel…" className="min-h-36 resize-none border-0 bg-transparent p-2 text-base shadow-none focus-visible:ring-0" />
                        <div className="flex justify-end border-t border-border pt-3">
                          <Button onClick={applyAiAnalysisAndContinue} disabled={!aiAnalysis}>Continue <ArrowRight /></Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PROMPT_PRESETS.map((preset) => (
                          <Button key={preset.label} type="button" variant="outline" size="sm" onClick={() => handleVisionPromptChange(preset.prompt)} className="rounded-full text-xs font-normal">{preset.label}</Button>
                        ))}
                      </div>
                      {aiAnalysis && (
                        <div className="flex items-start gap-3 border-l-2 border-primary pl-4" role="status">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div><p className="text-sm font-medium">Starting point found</p><p className="mt-1 text-xs text-muted-foreground">{INDUSTRY_FOCUS_CARDS.find((card) => card.industry === selectedIndustry)?.label ?? selectedIndustry} · {selectedPages.length + 1} pages · {theme?.label}</p></div>
                        </div>
                      )}
                      <details className="group border-t border-border pt-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">Choose an industry instead <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {INDUSTRY_FOCUS_CARDS.map((card) => (
                            <Button key={card.industry} type="button" variant="outline" onClick={() => selectIndustry(card.industry, card.systemId)} className="h-auto min-h-20 justify-start whitespace-normal p-3 text-left">
                              <span className="text-lg">{card.icon}</span><span><span className="block text-sm font-medium">{card.label}</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{card.tagline}</span></span>
                            </Button>
                          ))}
                        </div>
                      </details>
                      <details className="group border-t border-border pt-4">
                        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">Import an existing project <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
                        <div className="mt-4 flex flex-wrap gap-2"><ImportProjectZipButton onImported={() => onOpenChange(false)} />{prefill?.businessId && <ImportUnisonSiteZipButton businessId={prefill.businessId} onImported={() => onOpenChange(false)} />}</div>
                      </details>
                    </div>
                  )}

                  {step === "questions" && (
                    <div className="mx-auto max-w-3xl space-y-8">
                      <StepHeading title="What should the site accomplish?" subtitle="Choose the main outcome first. Related choices appear as you go." />
                      <section className="space-y-3">
                        <FieldLabel>Primary goal</FieldLabel>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {PRIMARY_GOALS.map((goal) => <ChoiceCard key={goal.id} active={primaryGoal === goal.id} onClick={() => setPrimaryGoal(goal.id)} icon={goal.icon} title={goal.label} description={goal.description} />)}
                        </div>
                      </section>
                      {primaryGoal && (
                        <div className="animate-fade-in space-y-7 border-t border-border pt-7">
                          <section className="space-y-3"><FieldLabel>Visitor actions</FieldLabel><div className="flex flex-wrap gap-2">{CUSTOMER_NEEDS.map((need) => <Chip key={need.id} active={customerNeeds.includes(need.id)} onClick={() => setCustomerNeeds((current) => toggle(current, need.id))}><span>{need.icon}</span>{need.label}</Chip>)}</div></section>
                          <section className="space-y-3"><FieldLabel>Pages to include</FieldLabel><div className="flex flex-wrap gap-2"><span className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"><Check className="mr-2 h-3.5 w-3.5" />Home</span>{pageChoices.map((page) => <Chip key={page.id} active={selectedPages.includes(page.id)} onClick={() => setSelectedPages((current) => toggle(current, page.id))}><span>{page.icon}</span>{page.label}</Chip>)}</div></section>
                        </div>
                      )}
                    </div>
                  )}

                  {step === "aesthetic" && (
                    <div className="space-y-7">
                      <StepHeading title="Choose the visual direction" subtitle="Preview each style as a real interface, then fine-tune only if you need to." />
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
                        <div className="relative min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                          <StyleTokenCard theme={theme} businessName={businessName} showTokenLedger={false} className="rounded-none border-0" />
                          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 overflow-x-auto rounded-lg border border-border/70 bg-background/90 p-2 shadow-xl backdrop-blur-md">
                            {THEME_PRESETS.map((preset, index) => (
                              <Button key={preset.id} type="button" variant="ghost" onClick={() => setTheme(preset)} aria-label={`Select ${preset.label} style`} aria-pressed={theme?.id === preset.id} className={cn("h-auto min-w-24 flex-1 flex-col items-stretch gap-2 rounded-md p-2", theme?.id === preset.id && "bg-accent ring-1 ring-ring")}>
                                <span className="flex h-8 overflow-hidden rounded-sm border border-border" aria-hidden="true"><span className="flex-1" style={{ backgroundColor: preset.palette.bg }} /><span className="w-3" style={{ backgroundColor: preset.palette.accent }} /><span className="w-3" style={{ backgroundColor: preset.palette.accent2 ?? preset.palette.fg }} /></span>
                                <span className="truncate text-center text-[11px]">{preset.label}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                        <aside className="space-y-5">
                          <div><FieldLabel>Business name</FieldLabel><Input aria-label="Business name" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Northside Studio" className="mt-2" /></div>
                          <div className="space-y-2"><FieldLabel>Selected style</FieldLabel><div><p className="text-base font-semibold">{theme?.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{theme?.description}</p></div></div>
                          <div><FieldLabel>Experience</FieldLabel><div className="mt-2 grid gap-2">{([['standard','Standard'],['motion-rich','Motion rich'],['immersive','Immersive 3D']] as const).map(([value,label]) => <Chip key={value} active={experience === value} onClick={() => setExperience(value)}>{label}</Chip>)}</div></div>
                        </aside>
                      </div>
                      <details className="group rounded-lg border border-border bg-card px-4 py-3">
                        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">Fine-tune direction and sections <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
                        <div className="mt-5 grid gap-6 border-t border-border pt-5 sm:grid-cols-2">
                          <div><FieldLabel>Visual direction</FieldLabel><div className="mt-2 grid gap-2"><Chip active={artDirectionPackId === null} onClick={() => setArtDirectionPackId(null)}>Auto match</Chip>{visualDirections.map((option) => <Chip key={option.id} active={artDirectionPackId === option.id} disabled={!option.available} title={option.unavailableReason} onClick={() => option.available && setArtDirectionPackId(option.id)}><span className="text-left"><span className="block">{option.name}</span><span className="block text-xs font-normal text-muted-foreground">{option.available ? option.description : option.unavailableReason}</span></span></Chip>)}</div></div>
                          <div><FieldLabel>Section treatment</FieldLabel><div className="mt-2 grid gap-3">{sectionPickers.length === 0 ? <p className="text-xs text-muted-foreground">Automatic choices will follow the selected style.</p> : sectionPickers.map((picker) => <label key={picker.sectionType} className="grid gap-1 text-xs text-muted-foreground"><span className="capitalize">{picker.sectionType.replace(/-/g, ' ')}</span><select value={sectionPins[picker.sectionType] ?? ''} onChange={(event) => setSectionPins((current) => { const next = {...current}; if (!event.target.value) delete next[picker.sectionType]; else next[picker.sectionType] = event.target.value as VariantId; return next; })} className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"><option value="">Auto</option>{picker.options.map((option) => <option key={option.variantId} value={option.variantId}>{option.name}</option>)}</select></label>)}</div></div>
                          <div className="sm:col-span-2"><FieldLabel>Social profiles</FieldLabel><div className="mt-2 grid gap-2 sm:grid-cols-2">{(['instagram','facebook','linkedin','youtube'] as const).map((platform) => <Input key={platform} value={socialLinks[platform] || ''} onChange={(event) => setSocialLinks((current) => ({...current,[platform]:event.target.value}))} placeholder={`${platform[0].toUpperCase()}${platform.slice(1)} URL`} aria-label={`${platform} profile URL`} />)}</div></div>
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                {launchError && <div role="alert" className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{launchError}{launchFailure && <details className="mt-2"><summary className="cursor-pointer text-xs font-medium">Technical details</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-[10px]">{JSON.stringify(launchFailure, null, 2)}</pre></details>}</div>}

                {step !== "industry" && (
                  <footer className="mt-8 flex items-center justify-between border-t border-border pt-5">
                    <Button variant="ghost" onClick={goBack}><ArrowLeft />Back</Button>
                    {step === "aesthetic" ? <Button disabled={!canContinue || isLaunching} onClick={handleGenerate}>{isLaunching ? <Loader2 className="animate-spin" /> : <Sparkle />}{isLaunching ? 'Creating…' : 'Create site'}</Button> : <Button disabled={!canContinue || isLaunching} onClick={goNext}>Continue<ArrowRight /></Button>}
                  </footer>
                )}
              </fieldset>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const StepHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="max-w-2xl">
    <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs font-medium text-muted-foreground">{children}</div>
);

const ChoiceCard = ({ active, onClick, icon, title, description }: { active: boolean; onClick: () => void; icon: string; title: string; description: string }) => (
  <Button type="button" variant="outline" onClick={onClick} aria-pressed={active} className={cn("h-auto min-h-24 items-start justify-start whitespace-normal p-4 text-left", active && "border-primary bg-primary/5 ring-1 ring-primary")}>
    <span className="text-lg">{icon}</span><span><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">{description}</span></span>
  </Button>
);

const Chip = ({ active, onClick, children, disabled = false, title }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; title?: string }) => (
  <Button type="button" variant="outline" onClick={onClick} disabled={disabled} title={title} aria-pressed={active} className={cn("h-auto min-h-10 whitespace-normal rounded-md px-3 py-2 text-sm", active && "border-primary bg-primary/10 text-primary ring-1 ring-primary/30")}>
    {children}
  </Button>
);

export default LauncherWizard;
