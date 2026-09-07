/**
 * Launch Orchestrator — the single, deterministic Wizard → Builder pipeline.
 *
 * Guidebook contract:
 *   selections → canonical seed → registered composition + Design Contract V2
 *   → canonical compiler (Stage 4b theme tokens) → sealed SiteBundleSnapshot
 *   → canonical commit → builder handoff.
 *
 * AI page authorship is retired: nothing in this module calls a model, and no
 * page body is ever authored outside the canonical compiler. Every stage runs
 * through `launchRun` so the UI can render live pipeline awareness.
 */

import { supabase } from "@/integrations/supabase/client";
import {
  businessSystems,
  type BusinessSystemType,
  type LayoutCategory,
} from "@/data/templates/types";
import type { ThemePreset } from "@/components/onboarding/themePresets";
import { themePresetToThemeTokens } from "@/components/onboarding/themePresetToTokens";
import { buildThemedIndexCssFromTokens } from "@/components/onboarding/themePresetToIndexCss";
import { getIndustryForCategory, getAllowedIntents } from "@/platform/core";
import { getCompositionMeta } from "@/utils/compositionReference";
import { getCompositionById } from "@/sections/templates";
import { deriveGenerationSeed } from "@/platform/core/generationSeed";
import { generateDesignVariation } from "@/utils/designVariation";
import {
  buildTemplateLayoutContract,
  TEMPLATE_DESIGN_CONTRACT_PATH,
} from "@/services/templateLayoutContract";
import { runWizardStage4b } from "@/services/wizardStage4bRuntime";
import { runStrictImportContractCheck } from "@/services/strictImportContractRuntime";
import { buildCanonicalLaunchArtifactsAsync } from "@/services/canonicalLaunchVfs";
import {
  createConfirmedLaunchIds,
  provisionConfirmedLaunchSite,
  type ConfirmedLaunchIds,
} from "@/services/confirmedLaunchProvisioner";
import { commitMutation } from "@/services/vfsCommitService";
import { legacyFilesToPatchPlan } from "@/types/patchPlan";
import { createLaunchState, type LaunchState } from "@/types/launchState";
import {
  buildLauncherNavigationState,
  persistLauncherHandoff,
} from "@/services/launcherHandoffPersistence";
import {
  createLaunchRun,
  publishLaunchDegradations,
  LaunchFatalError,
  type LaunchRun,
  type LaunchRunSnapshot,
} from "@/services/launch/launchRun";
import { resolveVerticalLaunchContract } from "@/services/verticalLaunchContract";
import type { BuilderIdentity } from "@/types/builderIdentity";
import type { WizardSelections } from "@/types/playground";
import {
  GOAL_TO_NEEDS,
  LAUNCHER_PRESELECTS,
  SYSTEM_TO_BUSINESS_MODEL,
  SYSTEM_TO_INDUSTRY_OVERLAY,
  TEMPLATE_INDUSTRY_TO_CATEGORY,
  uniqueValues,
  type CustomerNeed,
  type PageChoice,
  type PrimaryGoal,
  type TemplateCardData,
} from "@/components/onboarding/wizard/wizardCatalog";

export interface LaunchOrchestratorInput {
  systemId: BusinessSystemType;
  template: TemplateCardData;
  theme: ThemePreset;
  businessName: string;
  primaryGoal: PrimaryGoal | null;
  customerNeeds: CustomerNeed[];
  selectedPages: PageChoice[];
  socialLinks?: Record<string, string>;
  existingBusinessId?: string | null;
}

export interface LaunchOrchestratorCallbacks {
  onStatus?: (status: string) => void;
  onProgress?: (snapshot: LaunchRunSnapshot) => void;
}

export interface LaunchOrchestratorResult {
  launchState: LaunchState;
  routeState: Record<string, unknown>;
  navigationState: unknown;
  projectId: string;
  draftId: string;
  revisionId: string;
  snapshot: LaunchRunSnapshot;
}

let lastYieldAt = 0;

/** Cooperative yield — keeps the wizard shell painting during compilation. */
function yieldToBrowser(): Promise<void> {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - lastYieldAt < 12) return Promise.resolve();
  lastYieldAt = now;
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function resolveGenerationCategory(
  system: (typeof businessSystems)[number],
  template: TemplateCardData,
): LayoutCategory {
  return (TEMPLATE_INDUSTRY_TO_CATEGORY[template.industry] ||
    system.templateCategories[0]) as LayoutCategory;
}

/**
 * Runs the full deterministic launch. Throws on fatal failure; the caller
 * renders the message inline in the wizard (never a toast).
 */
export async function runLaunchPipeline(
  input: LaunchOrchestratorInput,
  callbacks: LaunchOrchestratorCallbacks = {},
): Promise<LaunchOrchestratorResult> {
  const run: LaunchRun = createLaunchRun();
  const emit = () => callbacks.onProgress?.(run.snapshot());
  const status = (message: string) => {
    callbacks.onStatus?.(message);
    emit();
  };

  const system = businessSystems.find((s) => s.id === input.systemId);
  if (!system) throw new LaunchFatalError("That business system is no longer available.");

  const brand = input.businessName.trim();
  if (!brand) throw new LaunchFatalError("Please enter your business name.");

  const composition = getCompositionById(input.template.id);
  if (!composition) {
    throw new LaunchFatalError(
      `"${input.template.label}" has no registered composition. Pick another template.`,
    );
  }

  // ── Stage: plan ───────────────────────────────────────────────────────────
  status("Resolving your site plan…");
  const plan = await run.stage("plan", async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new LaunchFatalError("Your session expired. Sign in again to generate your site.");
    }
    const user = sessionData.session.user;
    const ownerEmail = user.email || "";
    const ids = createConfirmedLaunchIds(input.existingBusinessId || undefined);
    const plannedBusinessId = input.existingBusinessId || ids.businessId;

    const generationCategory = resolveGenerationCategory(system, input.template);
    const industryProfile = getIndustryForCategory(generationCategory);
    const compositionMeta = getCompositionMeta(generationCategory);
    const canonicalIntents = uniqueValues<string>([
      ...(industryProfile
        ? getAllowedIntents(industryProfile.defaultCapabilities)
        : system.intents),
      ...(compositionMeta?.intents || []),
    ]);

    const preselect = LAUNCHER_PRESELECTS[input.systemId];
    const launchContract = resolveVerticalLaunchContract(input.systemId);
    const primaryGoal: PrimaryGoal =
      input.primaryGoal || preselect?.primaryGoal || "collect_leads";
    const customerNeeds = uniqueValues<CustomerNeed>([
      ...(preselect?.customerNeeds || []),
      ...input.customerNeeds,
    ]);
    const requestedPages = uniqueValues<string>(["home", ...input.selectedPages]);
    const goalNeeds = GOAL_TO_NEEDS[primaryGoal] || {};

    const wizardSeedId = newId("ws");
    const seed = deriveGenerationSeed({
      businessName: brand,
      businessModel: SYSTEM_TO_BUSINESS_MODEL[input.systemId] || "general",
      industry: industryProfile?.industry || generationCategory,
      templateId: input.template.id,
      themePresetId: input.theme.id,
      primaryGoal,
      secondaryGoals: customerNeeds,
      requestedPages,
      projectId: plannedBusinessId,
      launchNonce: wizardSeedId,
    });

    const themeTokens = themePresetToThemeTokens(input.theme);
    const selections: WizardSelections = {
      businessName: brand,
      businessModel: SYSTEM_TO_BUSINESS_MODEL[input.systemId] || "general",
      industryOverlay: SYSTEM_TO_INDUSTRY_OVERLAY[input.systemId] || "general",
      systemType: input.systemId,
      primaryGoal,
      secondaryGoals: customerNeeds as string[],
      needsBooking:
        launchContract.forcedNeeds.booking ||
        !!goalNeeds.needsBooking ||
        customerNeeds.includes("book_service"),
      sellsProducts:
        launchContract.forcedNeeds.products ||
        !!goalNeeds.sellsProducts ||
        customerNeeds.includes("buy_offer"),
      wantsLeadCapture:
        launchContract.forcedNeeds.leadCapture ||
        !!goalNeeds.wantsLeadCapture ||
        customerNeeds.includes("request_quote") ||
        customerNeeds.includes("fill_form"),
      templateId: input.template.id,
      themeId: input.theme.id,
      themePresetId: input.theme.id,
      themeTokens,
      primaryIntent: industryProfile?.primaryIntent,
      requestedPages,
      scaffoldMode: "selected-pages",
      nativePublishReady: launchContract.nativePublishCapable && Boolean(ownerEmail),
      ownerEmail: ownerEmail || undefined,
      publishMode:
        launchContract.nativePublishCapable && ownerEmail
          ? "native-first-party"
          : "manual-setup",
      wizardSeedId,
      businessId: plannedBusinessId,
    };

    return {
      user,
      ids,
      generationCategory,
      industryProfile,
      canonicalIntents,
      launchContract,
      seed,
      wizardSeedId,
      themeTokens,
      selections,
      requestedPages,
    };
  }, { timeoutMs: 30_000 });

  const design = generateDesignVariation(plan.seed);
  const themedComposition = { ...composition, theme: plan.themeTokens };
  const designContract = buildTemplateLayoutContract(themedComposition, {
    seed: plan.seed,
    styleVariation: design,
    pageRole: "home",
  });

  const wizardSeedFile = {
    version: "2.0",
    id: plan.wizardSeedId,
    source: "launch-orchestrator",
    business: {
      name: brand,
      industry: plan.industryProfile?.industry || plan.generationCategory,
      primaryGoal: plan.selections.primaryGoal,
      systemType: input.systemId,
    },
    template: { id: input.template.id, label: input.template.label },
    theme: { presetId: input.theme.id, label: input.theme.label, tokens: plan.themeTokens },
    design: { seed: plan.seed, contractSignature: designContract.contractSignature },
    socials: Object.entries(input.socialLinks || {})
      .map(([platform, raw]) => {
        const value = (raw || "").trim();
        if (!value) return null;
        return { platform, href: /^https?:\/\//i.test(value) ? value : `https://${value}` };
      })
      .filter((entry): entry is { platform: string; href: string } => !!entry),
  };

  // ── Stage: seed (canonical compile + Stage 4b theme tokens) ───────────────
  status("Compiling your themed site…");
  const stage4b = await run.stage("seed", async () => {
    const result = await runWizardStage4b({
      selections: plan.selections,
      existingVfsFiles: {
        "/.unison/wizard-seed.json": JSON.stringify(wizardSeedFile, null, 2),
        [TEMPLATE_DESIGN_CONTRACT_PATH]: JSON.stringify(designContract, null, 2),
      },
      yieldToHost: yieldToBrowser,
    });
    if (!result.pipelineResult.sitePlan) {
      throw new Error("The canonical pipeline returned no topology plan.");
    }
    return result;
  }, { timeoutMs: 180_000 });

  const {
    playground: materializedPlayground,
    compileResult: compiledPlayground,
    siteBundleSnapshot,
    runtimeManifest: pipelineManifest,
    sitePlan,
  } = stage4b.pipelineResult;

  // Theme tokens are compiler-owned. Repair rather than ship un-themed CSS.
  const expectedCss = buildThemedIndexCssFromTokens(plan.themeTokens, {
    presetId: input.theme.id,
    label: input.theme.id,
    artDirectionPackId: siteBundleSnapshot?.meta?.artDirectionPackId,
  });
  if (compiledPlayground?.vfsFiles && compiledPlayground.vfsFiles["/src/index.css"] !== expectedCss) {
    compiledPlayground.vfsFiles["/src/index.css"] = expectedCss;
  }
  if (siteBundleSnapshot?.vfsFiles && siteBundleSnapshot.vfsFiles["/src/index.css"] !== expectedCss) {
    siteBundleSnapshot.vfsFiles["/src/index.css"] = expectedCss;
  }

  // ── Stage: enrich ─────────────────────────────────────────────────────────
  // AI page authorship is retired by contract. The stage stays in the model so
  // the timeline is honest about what did (and did not) run.
  run.markStage("enrich", "done");
  emit();

  // ── Stage: preflight (merge + seal + strict import contract) ──────────────
  status("Running preview gates…");
  const artifacts = await run.stage("preflight", async (signal) => {
    const built = await buildCanonicalLaunchArtifactsAsync(
      {
        generatedFiles: {},
        preferredEntryPoint: "/src/App.tsx",
        siteBundleSnapshot,
        compiledPlayground,
        canonicalPlayground: materializedPlayground,
        mergeWithCanonicalSnapshot: true,
        businessId: plan.selections.businessId,
        projectId: plan.ids.projectId,
        organizationId: plan.selections.businessId,
        siteId: plan.ids.siteId,
        systemType: input.systemId,
        systemName: system.name,
        templateName: `${brand} Site`,
        templateCategory: plan.generationCategory,
        templateId: input.template.id,
        businessName: brand,
        industry: plan.generationCategory,
        aesthetic: input.theme.id,
        themePresetId: input.theme.id,
        backendRequired: false,
        wizardSelections: plan.selections,
        enabledCapabilities: plan.industryProfile?.defaultCapabilities || [],
        // Deterministic compile owns every page body; canonical pages ARE the
        // authored pages now, so the canonical resolution path is the contract.
        allowCanonicalPageFallback: true,
        strictPreflight: false,
      } as Parameters<typeof buildCanonicalLaunchArtifactsAsync>[0],
      { yieldToHost: yieldToBrowser, signal },
    );
    await runStrictImportContractCheck({
      files: built.files,
      entryPoint: built.entryPoint,
      themePresetId: input.theme.id,
      signal,
    });
    return built;
  }, { timeoutMs: 180_000 });

  const missingPages = artifacts.siteBundleSnapshot?.meta?.seal?.missingPageFiles || [];
  if (missingPages.length > 0) {
    run.degrade(
      "preflight",
      "preflight.sealed_pages_missing",
      `${missingPages.length} page(s) reached the sealed revision without a body.`,
      missingPages.join(", "),
    );
    emit();
  }

  const vfsFiles: Record<string, string> = {
    ...artifacts.files,
    "/.unison/wizard-seed.json": JSON.stringify(wizardSeedFile, null, 2),
    [TEMPLATE_DESIGN_CONTRACT_PATH]: JSON.stringify(designContract, null, 2),
  };

  // ── Stage: commit ─────────────────────────────────────────────────────────
  status("Saving your site workspace…");
  const commit = await run.stage("commit", async () => {
    const confirmed: ConfirmedLaunchIds = await provisionConfirmedLaunchSite({
      ids: plan.ids,
      existingBusinessId: input.existingBusinessId || undefined,
      businessName: brand,
      industry: plan.industryProfile?.industry || plan.generationCategory,
      siteName: `${brand} Site`,
      siteSlug: `${brand}-${plan.ids.siteId.slice(0, 8)}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      systemType: input.systemId,
      templateId: input.template.id,
      themePresetId: input.theme.id,
    });

    try {
      localStorage.setItem("unison:lastBusinessId", confirmed.businessId);
    } catch {
      /* browser storage is best-effort */
    }

    const identity: BuilderIdentity = {
      userId: plan.user.id,
      businessId: confirmed.businessId,
      projectId: confirmed.projectId,
      draftId: confirmed.draftId,
      revisionId: "",
      sessionId: newId("sess"),
    };
    const result = await commitMutation({
      source: "wizard-launch",
      identity,
      current: {
        vfsFiles: {},
        playground: materializedPlayground ?? undefined,
        activePagePath: artifacts.entryPoint,
      },
      patch: legacyFilesToPatchPlan(vfsFiles),
      options: {
        requirePreviewPass: false,
        requireReadinessPass: false,
        businessName: brand,
        industry: String(plan.generationCategory),
        selectedTemplateId: input.template.id,
        themePresetId: input.theme.id,
        selections: plan.selections,
        reviewedArtifact: {
          siteBundleSnapshot: artifacts.siteBundleSnapshot ?? siteBundleSnapshot,
          runtimeManifest: artifacts.runtimeManifest,
          playground: materializedPlayground ?? undefined,
        },
      },
    });
    if (!result.persistedRevisionId) {
      throw new Error("The generated site could not be saved to its project.");
    }
    return { confirmed, revisionId: result.persistedRevisionId };
  }, { timeoutMs: 120_000 });

  // ── Stage: handoff ────────────────────────────────────────────────────────
  status("Opening the builder…");
  const handoff = await run.stage("handoff", async () => {
    const launchState = createLaunchState({
      systemType: input.systemId,
      systemName: system.name,
      businessName: brand,
      templateName: `${brand} Site`,
      templateCategory: plan.generationCategory as never,
      vfsFiles,
      aesthetic: input.theme.id,
      themePresetId: input.theme.id,
      templateId: input.template.id,
      preloadedIntents: plan.canonicalIntents,
      startInPreview: true,
      intentRuntime: true,
      businessId: commit.confirmed.businessId,
      projectId: commit.confirmed.projectId,
      industry: plan.industryProfile?.industry || String(plan.generationCategory),
      runtimeManifest: artifacts.runtimeManifest,
      entryPoint: artifacts.entryPoint,
      sitePlan,
      siteBundleSnapshot: artifacts.siteBundleSnapshot ?? siteBundleSnapshot,
      materializedPlayground,
      compiledPlayground,
      pipelineManifest,
      wizardSelections: plan.selections,
      wizardSeed: wizardSeedFile,
      revisionId: commit.revisionId,
    } as Parameters<typeof createLaunchState>[0]);

    const routeState: Record<string, unknown> = {
      fromLauncher: true,
      businessId: commit.confirmed.businessId,
      projectId: commit.confirmed.projectId,
      siteId: commit.confirmed.siteId,
      draftId: commit.confirmed.draftId,
      revisionId: commit.revisionId,
      entryPoint: artifacts.entryPoint,
      templateId: input.template.id,
      themePresetId: input.theme.id,
      preloadedIntents: plan.canonicalIntents,
      launchContract: plan.launchContract,
    };

    const navigationState = buildLauncherNavigationState(routeState);
    persistLauncherHandoff({ routeState, launchState });

    try {
      await supabase.from("onboarding_state").upsert(
        {
          user_id: plan.user.id,
          completed: true,
          current_step: "launched",
          industry: input.systemId,
          business_name: brand,
          project_id: commit.confirmed.projectId,
        },
        { onConflict: "user_id" },
      );
    } catch (error) {
      console.warn("[launchOrchestrator] onboarding completion not recorded", error);
    }

    return { launchState, routeState, navigationState };
  }, { timeoutMs: 30_000 });

  publishLaunchDegradations(run.snapshot().degradations);
  emit();

  return {
    launchState: handoff.launchState,
    routeState: handoff.routeState,
    navigationState: handoff.navigationState,
    projectId: commit.confirmed.projectId,
    draftId: commit.confirmed.draftId,
    revisionId: commit.revisionId,
    snapshot: run.snapshot(),
  };
}
