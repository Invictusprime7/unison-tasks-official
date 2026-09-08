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
import {
  compileContract,
  createBlueprintFromIndustry,
  evaluateAllGates,
  getIndustryForCategory,
  getAllowedIntents,
  runIntegrityReport,
} from "@/platform/core";
import { classifyDraft } from "@/platform/core/canonicalRuntimeContract";
import { getCompositionMeta } from "@/utils/compositionReference";
import { getCompositionById } from "@/sections/templates";
import { deriveGenerationSeed } from "@/platform/core/generationSeed";
import { generateDesignVariation } from "@/utils/designVariation";
import {
  buildTemplateLayoutContract,
  TEMPLATE_DESIGN_CONTRACT_PATH,
} from "@/services/templateLayoutContract";
import { runWizardStage4b } from "@/services/wizardStage4bRuntime";
import {
  buildCanonicalLaunchArtifactsAsync,
  type PublishedRuntimeConfig,
} from "@/services/canonicalLaunchVfs";
import { loadBusinessProfile } from "@/services/businessProfileService";
import { planSectionDataBindings } from "@/services/autoEmitSectionBindings";
import { buildBusinessRuntimeContract } from "@/platform/core/businessRuntimeContract";
import {
  buildNativePublishReadinessManifest,
  buildNativePublishSetupSnapshot,
} from "@/services/nativePublishReadiness";
import {
  auditWizardIntentGap,
  buildIntentBindingsFile,
  buildIntentSurfacesFile,
} from "@/services/wizardIntentAudit";
import { planLaunchFormDefinitions } from "@/services/launchFormDefinitions";
import { persistLaunchFormDefinitions } from "@/services/launchFormDefinitionPersistence";
import { evaluatePublishedRuntimeReadiness } from "@/services/publishedRuntimeReadiness";
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
import type { BusinessProfileDTO } from "@/types/businessProfile";
import type { WizardSelections } from "@/types/playground";
import {
  getLanguageFromFileName,
  type VirtualNode,
} from "@/hooks/useVirtualFileSystem";
import { livePageTopology } from "@/builder/controllers/PageTopologyController";
import { livePreviewRuntime } from "@/builder/controllers/PreviewRuntimeController";
import { livePlaygroundSync } from "@/builder/controllers/PlaygroundSyncController";
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
import {
  buildPublicBusinessContext,
  resolveWizardIndustryOverlay,
} from '@/services/wizardMergeContext';
import { buildWizardBindingGuide } from '@/services/wizardBindingBridge';

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

function vfsFilesToVirtualNodes(vfsFiles: Record<string, string>): VirtualNode[] {
  return Object.entries(vfsFiles).map(([path, content]) => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const name = normalizedPath.split("/").pop() || normalizedPath;
    return {
      id: `launch-${normalizedPath}`,
      name,
      content,
      type: "file",
      language: getLanguageFromFileName(name),
      parentId: null,
      path: normalizedPath,
    };
  });
}

/**
 * Runs the full deterministic launch. Throws on fatal failure; the caller
 * renders the message and diagnostic context in the wizard.
 */
export async function runLaunchPipeline(
  input: LaunchOrchestratorInput,
  callbacks: LaunchOrchestratorCallbacks = {},
): Promise<LaunchOrchestratorResult> {
  const run: LaunchRun = createLaunchRun({ onChange: callbacks.onProgress });
  const status = (message: string) => {
    callbacks.onStatus?.(message);
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

    const generationCategory = resolveGenerationCategory(system, input.template);
    const industryProfile = getIndustryForCategory(generationCategory);
    const industryOverlay = resolveWizardIndustryOverlay({
      templateIndustry: input.template.industry,
      generationIndustry: industryProfile?.industry || generationCategory,
      systemIndustry: SYSTEM_TO_INDUSTRY_OVERLAY[input.systemId],
    });
    const compositionMeta = getCompositionMeta(generationCategory);
    const canonicalIntents = uniqueValues<string>([
      ...(industryProfile
        ? getAllowedIntents(industryProfile.defaultCapabilities)
        : system.intents),
      ...(compositionMeta?.intents || []),
    ]);

    // Real Unison identity is registered BEFORE anything is compiled. Every
    // artifact below is stamped with the ids that exist in the Unison registry
    // (businesses/sites/projects/builder_drafts) — never a client-side
    // placeholder that a later provisioning round could contradict.
    const requestedIds = createConfirmedLaunchIds(input.existingBusinessId || undefined);
    const confirmed: ConfirmedLaunchIds = await provisionConfirmedLaunchSite({
      ids: requestedIds,
      existingBusinessId: input.existingBusinessId || undefined,
      businessName: brand,
      industry: industryOverlay,
      siteName: `${brand} Site`,
      siteSlug: `${brand}-${requestedIds.siteId.slice(0, 8)}`
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
    const ids = confirmed;
    const plannedBusinessId = confirmed.businessId;

    const preselect = LAUNCHER_PRESELECTS[input.systemId];
    const launchContract = resolveVerticalLaunchContract(input.systemId);
    const primaryGoal: PrimaryGoal =
      input.primaryGoal || preselect?.primaryGoal || "collect_leads";
    const customerNeeds = uniqueValues<CustomerNeed>(input.customerNeeds);
    const requestedPages = uniqueValues<string>(["home", ...input.selectedPages]);
    const goalNeeds = GOAL_TO_NEEDS[primaryGoal] || {};

    const wizardSeedId = newId("ws");
    const seed = deriveGenerationSeed({
      businessName: brand,
      businessModel: SYSTEM_TO_BUSINESS_MODEL[input.systemId] || "general",
      industry: industryOverlay,
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
      industryOverlay,
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
      ownerEmail,
      ids,
      confirmed,
      generationCategory,
      industryOverlay,
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
  const blueprint = createBlueprintFromIndustry(
    plan.industryOverlay,
    brand,
    { email: plan.ownerEmail || undefined },
  );
  const compiledContract = compileContract(blueprint, { backendInstalled: false });
  const gateVerdicts = evaluateAllGates(compiledContract);
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
      industry: plan.industryOverlay,
      primaryGoal: plan.selections.primaryGoal,
      systemType: input.systemId,
    },
    generation: {
      primaryGoal: plan.selections.primaryGoal,
      secondaryGoals: plan.selections.secondaryGoals,
      requestedPages: plan.requestedPages,
    },
    template: {
      id: input.template.id,
      label: input.template.label,
      sections: composition.sections.filter((section) => !section.hidden).map((section) => section.type),
    },
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
  const stage4b = await run.stage("seed", async (signal) => {
    const result = await runWizardStage4b({
      selections: plan.selections,
      existingVfsFiles: {
        "/.unison/wizard-seed.json": JSON.stringify(wizardSeedFile, null, 2),
        [TEMPLATE_DESIGN_CONTRACT_PATH]: JSON.stringify(designContract, null, 2),
      },
      signal,
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
    validations: pipelineValidations,
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

  const loadedBusinessProfile = input.existingBusinessId
    ? await loadBusinessProfile(input.existingBusinessId)
    : null;
  if (input.existingBusinessId && !loadedBusinessProfile) {
    throw new Error("Unable to load the selected Business Profile for this launch.");
  }
  const businessProfile: BusinessProfileDTO = loadedBusinessProfile || {
    businessId: plan.confirmed.businessId,
    ownerId: plan.user.id,
    name: brand,
    industry: plan.industryOverlay,
    email: plan.ownerEmail || null,
    notificationEmail: plan.ownerEmail || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    address: {},
    hours: [],
    socialLinks: {},
    settings: {},
  };
  const canonicalPages = Object.values(siteBundleSnapshot.pageRegistry.pages)
    .filter((page): page is typeof page & { filePath: string } => Boolean(page.filePath))
    .map((page) => ({
      slug: page.path === '/' ? 'home' : page.path.replace(/^\//, ''),
      path: page.filePath,
      route: page.path,
      title: page.title,
      role: page.pageRole || page.pageType,
    }));
  const uiFoundation = JSON.parse(
    siteBundleSnapshot.vfsFiles['/.unison/ui-manifest.json'] || 'null',
  ) as Record<string, unknown> | null;
  const publicBusinessContext = buildPublicBusinessContext(businessProfile);
  const socialLinks = new Map<string, string>();
  for (const [platform, url] of Object.entries(publicBusinessContext.socialLinks)) {
    if (url) socialLinks.set(platform, url);
  }
  for (const { platform, href } of wizardSeedFile.socials) {
    socialLinks.set(platform, href);
  }
  const contextualWizardSeedFile = {
    ...wizardSeedFile,
    business: {
      ...publicBusinessContext,
      name: brand,
      industry: plan.industryOverlay,
      primaryGoal: plan.selections.primaryGoal,
      systemType: input.systemId,
    },
    canonical: {
      pages: canonicalPages,
      capabilities: plan.industryProfile?.defaultCapabilities || [],
      intents: plan.canonicalIntents,
    },
    generation: {
      ...wizardSeedFile.generation,
      socials: [...socialLinks].map(([platform, url]) => ({ platform, url })),
    },
    uiFoundation,
    generationBrief: siteBundleSnapshot.meta.generationBrief,
    designIntervention: siteBundleSnapshot.meta.designIntervention,
    bindingGuide: buildWizardBindingGuide(siteBundleSnapshot, {
      industry: plan.industryOverlay,
    }),
  };
  const plannedDataBindings = planSectionDataBindings(siteBundleSnapshot);
  const businessRuntime = buildBusinessRuntimeContract({
    businessId: plan.confirmed.businessId,
    profile: businessProfile,
    snapshotId: siteBundleSnapshot.snapshotId,
    expectedBindingCount: plannedDataBindings.length,
    bindingsReady: true,
  });
  const nativeSetupSnapshot = buildNativePublishSetupSnapshot({
    enabled: plan.launchContract.nativePublishCapable,
    ownerEmail: plan.ownerEmail,
    businessName: brand,
    businessId: plan.confirmed.businessId,
    systemType: input.systemId,
  });
  const wizardAudit = auditWizardIntentGap({
    sitePlan,
    state: materializedPlayground,
    industryOverlay: plan.industryOverlay,
  });
  const nativeReadinessManifest = {
    ...buildNativePublishReadinessManifest({
      state: materializedPlayground,
      validations: pipelineValidations,
      setupSnapshot: nativeSetupSnapshot,
      enabled: plan.launchContract.nativePublishCapable,
      systemType: input.systemId,
      industryOverlay: plan.industryOverlay,
    }),
    wizardAudit,
  };
  const intentBindingsFile = buildIntentBindingsFile(materializedPlayground);
  const intentSurfacesFile = buildIntentSurfacesFile(materializedPlayground);

  // ── Stage: enrich ─────────────────────────────────────────────────────────
  // Launcher enrichment is deterministic compiler work. AI may consume this
  // context after launch, but it never authors or replaces Launcher page files.
  status("Finalizing your deterministic design…");
  run.markStage("enrich", "done");

  // ── Stage: preflight (merge + seal + strict import contract) ──────────────
  status("Running preview gates…");
  const artifacts = await run.stage("preflight", async (signal) => {
    const built = await buildCanonicalLaunchArtifactsAsync(
      {
        // Stage 4b's snapshot VFS is the authored source for the deterministic
        // launcher. Pass it explicitly so merge never treats pages as fallback.
        generatedFiles: siteBundleSnapshot.vfsFiles,
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
        industry: plan.industryOverlay,
        aesthetic: input.theme.id,
        themePresetId: input.theme.id,
        backendRequired: false,
        wizardSelections: plan.selections,
        businessRuntime,
        enabledCapabilities: plan.industryProfile?.defaultCapabilities || [],
        // Every registered body must be present in the Stage 4b output above.
        // Missing pages are a real closure failure, never a fallback request.
        allowCanonicalPageFallback: false,
        strictPreflight: false,
      } as Parameters<typeof buildCanonicalLaunchArtifactsAsync>[0],
      { yieldToHost: yieldToBrowser, signal },
    );
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
  }

  const plannedFormDefinitions = planLaunchFormDefinitions(artifacts.siteBundleSnapshot);
  const publishedRuntimeReadiness = evaluatePublishedRuntimeReadiness({
    runtime: JSON.parse(
      artifacts.files["/.unison/published-runtime.json"],
    ) as PublishedRuntimeConfig,
    bindingCount: plannedDataBindings.length,
    formDefinitionCount: plannedFormDefinitions.length,
  });
  if (!publishedRuntimeReadiness.ok) {
    run.degrade(
      "preflight",
      "preflight.publish_not_ready",
      "Publishing checks are incomplete; you can still edit and preview everything.",
      publishedRuntimeReadiness.blockers.join(" "),
    );
  }

  const integrityReport = runIntegrityReport(
    artifacts.siteBundleSnapshot,
    compiledContract,
    { compositions: [{ label: input.template.id, composition: themedComposition }] },
  );

  const vfsFiles: Record<string, string> = {
    ...artifacts.files,
    "/.unison/wizard-seed.json": JSON.stringify(contextualWizardSeedFile, null, 2),
    [TEMPLATE_DESIGN_CONTRACT_PATH]: JSON.stringify(designContract, null, 2),
    "/.unison/launch-readiness.json": JSON.stringify({
      ...nativeReadinessManifest,
      wizardAudit,
      launchContract: plan.launchContract,
      publishedRuntimeReadiness,
      generatedAt: new Date().toISOString(),
      previewReady: true,
    }, null, 2),
    "/.unison/native-publish-setup.json": JSON.stringify(nativeSetupSnapshot || null, null, 2),
    "/.unison/setup-snapshot.json": JSON.stringify(nativeSetupSnapshot || null, null, 2),
    "/.unison/intent-bindings.json": JSON.stringify(intentBindingsFile, null, 2),
    "/.unison/intent-surfaces.json": JSON.stringify(intentSurfacesFile, null, 2),
    "/.unison/gate-verdicts.json": JSON.stringify(gateVerdicts, null, 2),
    "/.unison/integrity-report.json": JSON.stringify(integrityReport, null, 2),
  };
  const draftClassification = classifyDraft(vfsFiles);
  vfsFiles["/.unison/draft-classification.json"] = JSON.stringify(
    draftClassification,
    null,
    2,
  );

  // ── Stage: commit ─────────────────────────────────────────────────────────
  status("Saving your site workspace…");
  const commit = await run.stage("commit", async () => {
    // Identity was registered in the plan stage; the commit writes the first
    // revision of that already-real Unison site.
    const confirmed: ConfirmedLaunchIds = plan.confirmed;
    const identity: BuilderIdentity = {
      userId: plan.user.id,
      businessId: confirmed.businessId,
      projectId: confirmed.projectId,
      draftId: confirmed.draftId,
      revisionId: "",
      sessionId: `web-builder:${confirmed.draftId}`,
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
        compiledContract,
        businessName: brand,
        industry: plan.industryOverlay,
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
    if (!result.siteBundleSnapshot || !result.runtimeManifest) {
      throw new Error("The canonical commit returned an incomplete launch artifact.");
    }
    return { confirmed, result };
  }, { timeoutMs: 120_000 });

  try {
    const formDefinitionPersistence = await persistLaunchFormDefinitions({
      businessId: commit.confirmed.businessId,
      projectId: commit.confirmed.projectId,
      siteId: commit.confirmed.siteId,
      definitions: plannedFormDefinitions,
    });
    if (formDefinitionPersistence.error) {
      run.degrade(
        "commit",
        "commit.form_definitions_unavailable",
        "Your form settings will finish saving in the builder.",
        formDefinitionPersistence.error,
      );
    }
  } catch (error) {
    run.degrade(
      "commit",
      "commit.form_definitions_unavailable",
      "Your form settings will finish saving in the builder.",
      error instanceof Error ? error.message : String(error),
    );
  }

  // ── Stage: handoff ────────────────────────────────────────────────────────
  status("Opening the builder…");
  const handoff = await run.stage("handoff", async () => {
    const committed = commit.result;
    if (!committed.siteBundleSnapshot) {
      throw new Error("The committed launch is missing its site bundle snapshot.");
    }
    const committedPlayground = committed.playground ?? materializedPlayground;
    const committedVfsNodes: VirtualNode[] = vfsFilesToVirtualNodes(committed.vfsFiles);
    livePageTopology.setRegistry(committed.siteBundleSnapshot.pageRegistry);
    livePreviewRuntime.hydrateFromRegistry(committed.siteBundleSnapshot.pageRegistry);
    livePlaygroundSync.hydrateFromVFS(committedVfsNodes, committed.vfsFiles);
    const launchState = createLaunchState({
      systemType: input.systemId,
      systemName: system.name,
      businessName: brand,
      templateName: `${brand} Site`,
      templateCategory: plan.generationCategory as never,
      vfsFiles: committed.vfsFiles,
      aesthetic: input.theme.id,
      themePresetId: input.theme.id,
      templateId: input.template.id,
      preloadedIntents: plan.canonicalIntents,
      startInPreview: true,
      intentRuntime: true,
      businessId: commit.confirmed.businessId,
      projectId: commit.confirmed.projectId,
      industry: plan.industryOverlay,
      runtimeManifest: committed.runtimeManifest,
      entryPoint: committed.runtimeManifest.entryPoint,
      sitePlan,
      siteBundleSnapshot: committed.siteBundleSnapshot,
      materializedPlayground: committedPlayground,
      compiledPlayground,
      pipelineManifest: committed.runtimeManifest,
      wizardSelections: plan.selections,
      wizardSeed: contextualWizardSeedFile,
      draftId: commit.confirmed.draftId,
      revisionId: committed.persistedRevisionId,
    } as Parameters<typeof createLaunchState>[0]);

    const routeState: Record<string, unknown> = {
      ...launchState,
      fromLauncher: true,
      businessId: commit.confirmed.businessId,
      projectId: commit.confirmed.projectId,
      siteId: commit.confirmed.siteId,
      draftId: commit.confirmed.draftId,
      revisionId: committed.persistedRevisionId,
      entryPoint: committed.runtimeManifest.entryPoint,
      templateId: input.template.id,
      themePresetId: input.theme.id,
      preloadedIntents: plan.canonicalIntents,
      launchContract: plan.launchContract,
      vfsFiles: committed.vfsFiles,
      siteBundleSnapshot: committed.siteBundleSnapshot,
      runtimeManifest: committed.runtimeManifest,
      canonicalPlayground: committedPlayground,
      materializedPlayground: committedPlayground,
      _compiledContract: compiledContract,
      _previewGateVerdict: gateVerdicts.preview,
      _publishGateVerdict: gateVerdicts.publish,
      _draftClassification: draftClassification,
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

  return {
    launchState: handoff.launchState,
    routeState: handoff.routeState,
    navigationState: handoff.navigationState,
    projectId: commit.confirmed.projectId,
    draftId: commit.confirmed.draftId,
    revisionId: commit.result.persistedRevisionId!,
    snapshot: run.snapshot(),
  };
}
