/**
 * LauncherWizard — the Unison System Launcher.
 *
 * Selection surface only. Four steps (industry → goals → template → launch)
 * gather answers; `runLaunchPipeline` owns every deterministic stage. This
 * component never touches the VFS or authors a page. The orchestrator owns
 * deterministic generation and any guarded AI enrichment while this surface
 * renders selections, the resolved design contract, and live pipeline state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { THEME_PRESETS, type ThemePreset } from "@/components/onboarding/themePresets";
import { StyleTokenCard } from "@/components/onboarding/StyleTokenCard";
import { TemplateLivePreview } from "@/components/onboarding/TemplateLivePreview";
import { ImportProjectZipButton } from "@/components/onboarding/ImportProjectZipButton";
import { ImportUnisonSiteZipButton } from "@/components/onboarding/ImportUnisonSiteZipButton";
import type { BusinessSystemType } from "@/data/templates/types";
import { deriveGenerationSeed } from "@/platform/core/generationSeed";
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
import { DesignContractInspector } from "./DesignContractInspector";
import {
  buildCompositionCards,
  capabilityDisplay,
  getDefaultTemplateCardFor,
  resolveIndustryProfileForSystem,
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
  uniqueValues,
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

const STEP_ORDER: WizardStep[] = ["industry", "business", "structure", "design"];


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
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [profileAnswers, setProfileAnswers] = useState<Record<string, string>>({});
  const [capabilities, setCapabilities] = useState<string[]>([]);

  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStatus, setLaunchStatus] = useState("");
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [launchFailure, setLaunchFailure] = useState<LaunchFailureReport | null>(null);
  const [progress, setProgress] = useState<LaunchRunSnapshot | null>(null);
  const latestProgressRef = useRef<LaunchRunSnapshot | null>(null);

  const reset = useCallback(() => {
    setStep("industry");
    setSystemId(null);
    setBusinessName("");
    setPrimaryGoal(null);
    setCustomerNeeds([]);
    setSelectedPages([]);
    setTemplate(null);
    setTheme(THEME_PRESETS[0] ?? null);
    setSocialLinks({});
    setProfileAnswers({});
    setCapabilities([]);
    setIsLaunching(false);
    setLaunchStatus("");
    setLaunchError(null);
    setLaunchFailure(null);
    setProgress(null);
    latestProgressRef.current = null;
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
    setCapabilities([...(resolveIndustryProfileForSystem(id)?.defaultCapabilities ?? [])]);
    setProfileAnswers({});
    setStep("profile");
  };

  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  const industryProfile = useMemo(
    () => resolveIndustryProfileForSystem(systemId, effectiveTemplate?.industry ?? null),
    [systemId, effectiveTemplate?.industry],
  );

  // Industry questions are always skippable: anything left blank can be filled in
  // later inline from the live preview. Only the business name is needed to launch.
  const profileFields = industryProfile?.profileFields ?? [];

  const capabilityChoices = useMemo(() => {
    const anchor = industryProfile?.anchorCapability;
    const base = industryProfile?.defaultCapabilities ?? [];
    return Array.from(new Set([...(anchor ? [anchor] : []), ...base, ...capabilities]));
  }, [industryProfile, capabilities]);

  const canContinue =
    step === "industry"
      ? Boolean(systemId)
      : step === "profile"
        ? Boolean(businessName.trim())
        : step === "goals"
          ? Boolean(primaryGoal)
          : step === "pages"
            ? true
            : step === "capabilities"
              ? capabilities.length > 0
              : step === "templates"
                ? Boolean(effectiveTemplate)
                : step === "aesthetic"
                  ? Boolean(theme)
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
    setLaunchFailure(null);
    latestProgressRef.current = null;
    setLaunchStatus("Preparing your site…");

    const input: LaunchOrchestratorInput = {
      systemId,
      template: effectiveTemplate,
      theme,
      businessName,
      primaryGoal,
      customerNeeds,
      selectedPages,
      socialLinks,
      profileAnswers,
      selectedCapabilities: capabilities,
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
      navigate("/web-builder", { replace: true, state: result.navigationState });
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
        id: 'wizard-generate-site-failed',
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
            {step === "review" ? (
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
                <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                  <ImportProjectZipButton onImported={() => onOpenChange(false)} />
                  {prefill?.businessId && (
                    <ImportUnisonSiteZipButton
                      businessId={prefill.businessId}
                      onImported={() => onOpenChange(false)}
                    />
                  )}
                </div>
              </>
            )}

            {step === "profile" && (
              <>
                <StepHeading
                  title="Tell us about your business"
                  subtitle="Only the business name is needed. Skip anything you don't have yet — you can fill it in later, directly on your live preview."
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
                {profileFields.map((field) => (
                  <div key={field.key}>
                    <FieldLabel>
                      {field.label}
                      <span className="ml-1 text-white/35">(optional)</span>
                    </FieldLabel>
                    <Input
                      value={profileAnswers[field.key] || ""}
                      onChange={(event) =>
                        setProfileAnswers((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                      placeholder={field.placeholder || field.label}
                      aria-label={field.label}
                      className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/25"
                    />
                  </div>
                ))}
                <div>
                  <FieldLabel>Social profiles</FieldLabel>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["instagram", "facebook", "linkedin", "youtube"] as const).map((platform) => (
                      <Input
                        key={platform}
                        value={socialLinks[platform] || ""}
                        onChange={(event) => setSocialLinks((current) => ({
                          ...current,
                          [platform]: event.target.value,
                        }))}
                        placeholder={`${platform[0].toUpperCase()}${platform.slice(1)} URL`}
                        aria-label={`${platform} profile URL`}
                        className="border-white/10 bg-white/[0.03] text-white placeholder:text-white/25"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === "goals" && (
              <>
                <StepHeading
                  title="What should the site do for you?"
                  subtitle="Goals are contracts — they decide intents and conversion flow."
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
                {industryProfile?.conversionJourney?.length ? (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] text-white/40">
                    Your industry journey:{" "}
                    <span className="text-cyan-300/80">
                      {industryProfile.conversionJourney.join(" → ")}
                    </span>
                  </div>
                ) : null}
              </>
            )}

            {step === "pages" && (
              <>
                <StepHeading
                  title="Which pages should we build?"
                  subtitle="Home is always included. Everything you pick is what compiles."
                />
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

            {step === "capabilities" && (
              <>
                <StepHeading
                  title="What should your site be able to do?"
                  subtitle="Each capability wires real backend behaviour, not just a section."
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  {capabilityChoices.map((capabilityId) => {
                    const display = capabilityDisplay(capabilityId);
                    const isAnchor = industryProfile?.anchorCapability === capabilityId;
                    const active = capabilities.includes(capabilityId);
                    return (
                      <button
                        key={capabilityId}
                        type="button"
                        onClick={() =>
                          setCapabilities((prev) =>
                            isAnchor ? uniqueValues([...prev, capabilityId]) : toggle(prev, capabilityId),
                          )
                        }
                        className={cn(
                          "rounded-xl border p-3 text-left transition-all",
                          active
                            ? "border-cyan-400/40 bg-cyan-400/[0.06]"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/15",
                        )}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {display.label}
                          {isAnchor && (
                            <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-cyan-300">
                              Core
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-white/35">{display.description}</div>
                      </button>
                    );
                  })}
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
                  title="Choose your brand direction"
                  subtitle="Style resolves to theme tokens — the same tokens the compiler writes."
                />
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

            {step === "review" && (
              <>
                <StepHeading
                  title="Review and launch"
                  subtitle="This is exactly what will be generated — no surprises after the build."
                />
                <dl className="grid gap-2 text-[12px] sm:grid-cols-2">
                  <ReviewRow label="Business" value={businessName || "—"} />
                  <ReviewRow label="Industry" value={industryProfile?.name || systemId || "—"} />
                  <ReviewRow
                    label="Core capability"
                    value={capabilityDisplay(industryProfile?.anchorCapability || "").label}
                  />
                  <ReviewRow label="Template" value={effectiveTemplate?.label || "—"} />
                  <ReviewRow label="Style" value={theme?.label || "—"} />
                  <ReviewRow
                    label="Pages"
                    value={["home", ...selectedPages].join(", ")}
                  />
                  <ReviewRow
                    label="Capabilities"
                    value={capabilities.map((id) => capabilityDisplay(id).label).join(", ") || "—"}
                  />
                  <ReviewRow
                    label="Journey"
                    value={(industryProfile?.conversionJourney ?? []).join(" → ") || "—"}
                  />
                </dl>
              </>
            )}

            {launchError && (
              <div className="rounded-xl border border-rose-400/25 bg-rose-500/[0.07] px-4 py-3 text-[12px] text-rose-200">
                <div>{launchError}</div>
                {launchFailure && (
                  <details className="mt-2 text-[11px] text-rose-100/75">
                    <summary className="cursor-pointer font-semibold">Technical details</summary>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-black/25 p-2 font-mono text-[10px]">
                      {JSON.stringify(launchFailure, null, 2)}
                    </pre>
                  </details>
                )}
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

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
    <dt className="text-[10px] uppercase tracking-wide text-white/25">{label}</dt>
    <dd className="truncate text-white/75">{value}</dd>
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
