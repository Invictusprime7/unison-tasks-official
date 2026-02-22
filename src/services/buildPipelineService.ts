/**
 * Build Pipeline Orchestrator
 *
 * Implements the 8-stage server-side build pipeline:
 * Stage 0: Init (create site + build record, skeleton bundle)
 * Stage 1: Blueprint (Systems AI only)
 * Stage 2: Brand kit
 * Stage 3: Pages + manifest
 * Stage 4: Intent wiring (deterministic first, AI fallback)
 * Stage 5: Automations install
 * Stage 6: Entitlements + gating
 * Stage 7: Persist bundle
 */

import { nanoid } from "nanoid";
import type {
  SiteBundle,
  SiteBundleVersion,
  BuildMode,
  BuildStage,
  BuildWarning,
  BuildError,
  BusinessBlueprint,
  BrandPrimitives,
  PageBundle,
  IntentBinding,
  IntentDefinition,
  IntentId,
  BuildPipelineStage,
  BuildPipelineStatus,
  BuildStageResult,
  BuildPipelineState,
  BuildPipelineContext,
  IntentWiringRule,
  IntentWiringResult,
  SiteRow,
  SiteBuildRow,
  SiteBundleRow,
  RouteDef,
  NavItem,
  AutomationInstall,
  SecretRequirement,
  BlueprintPage,
  BindingTarget,
} from "../types/siteBundle";

// ============================================================================
// Constants
// ============================================================================

const CURRENT_VERSION: SiteBundleVersion = "1.0.0";

const PIPELINE_STAGES: BuildPipelineStage[] = [
  "init",
  "blueprint",
  "brand",
  "pages",
  "intents",
  "automations",
  "entitlements",
  "persist",
];

// ============================================================================
// Intent Wiring Rules (Deterministic)
// ============================================================================

const DETERMINISTIC_INTENT_RULES: IntentWiringRule[] = [
  // Contact/Lead forms
  { pattern: /contact|get\s*in\s*touch|reach\s*out/i, intentId: "lead.submit", priority: 100, source: "deterministic" },
  { pattern: /request\s*quote|get\s*quote|free\s*quote/i, intentId: "lead.submit", priority: 100, source: "deterministic" },
  { pattern: /schedule|book|appointment/i, intentId: "booking.request", priority: 100, source: "deterministic" },
  
  // Navigation
  { pattern: /learn\s*more|read\s*more|see\s*more/i, intentId: "nav.go", priority: 80, source: "deterministic" },
  { pattern: /view\s*services|our\s*services/i, intentId: "nav.go", priority: 80, source: "deterministic" },
  { pattern: /about\s*us|who\s*we\s*are/i, intentId: "nav.go", priority: 80, source: "deterministic" },
  
  // Call to action
  { pattern: /call\s*now|call\s*us|phone/i, intentId: "cta.call", priority: 90, source: "deterministic" },
  { pattern: /email\s*us|send\s*email/i, intentId: "cta.email", priority: 90, source: "deterministic" },
  { pattern: /get\s*directions|find\s*us|map/i, intentId: "cta.directions", priority: 90, source: "deterministic" },
  
  // E-commerce
  { pattern: /add\s*to\s*cart|buy\s*now|purchase/i, intentId: "cart.add", priority: 100, source: "deterministic" },
  { pattern: /checkout|pay\s*now/i, intentId: "checkout.start", priority: 100, source: "deterministic" },
  
  // Social
  { pattern: /share|facebook|twitter|linkedin/i, intentId: "social.share", priority: 70, source: "deterministic" },
  
  // Subscribe
  { pattern: /subscribe|newsletter|sign\s*up/i, intentId: "subscribe.email", priority: 90, source: "deterministic" },
];

// ============================================================================
// Storage Interface (to be implemented by consumer)
// ============================================================================

export interface BuildPipelineStorage {
  // Site operations
  createSite(site: SiteRow): Promise<SiteRow>;
  getSite(siteId: string): Promise<SiteRow | null>;
  updateSite(siteId: string, updates: Partial<SiteRow>): Promise<SiteRow>;
  
  // Build operations
  createBuild(build: SiteBuildRow): Promise<SiteBuildRow>;
  getBuild(buildId: string): Promise<SiteBuildRow | null>;
  updateBuild(buildId: string, updates: Partial<SiteBuildRow>): Promise<SiteBuildRow>;
  
  // Bundle operations
  saveBundle(bundle: SiteBundleRow): Promise<SiteBundleRow>;
  getBundle(siteId: string, buildId: string): Promise<SiteBundleRow | null>;
  getLatestBundle(siteId: string): Promise<SiteBundleRow | null>;
}

// ============================================================================
// AI Provider Interface (to be implemented by consumer)
// ============================================================================

export interface BuildPipelineAIProvider {
  // Blueprint generation
  generateBlueprint(context: BuildPipelineContext): Promise<BusinessBlueprint>;
  
  // Brand generation
  generateBrandKit(blueprint: BusinessBlueprint, context: BuildPipelineContext): Promise<BrandPrimitives>;
  
  // Page generation
  generatePage(
    route: { path: string; title: string },
    blueprint: BusinessBlueprint,
    brand: BrandPrimitives,
    context: BuildPipelineContext
  ): Promise<PageBundle>;
  
  // AI intent fallback
  inferIntent(
    elementText: string,
    elementContext: string,
    availableIntents: IntentDefinition[]
  ): Promise<IntentWiringResult | null>;
}

// ============================================================================
// Build Pipeline Orchestrator
// ============================================================================

export class BuildPipelineOrchestrator {
  private storage: BuildPipelineStorage;
  private aiProvider: BuildPipelineAIProvider;

  constructor(storage: BuildPipelineStorage, aiProvider: BuildPipelineAIProvider) {
    this.storage = storage;
    this.aiProvider = aiProvider;
  }

  /**
   * Execute the full build pipeline
   */
  async execute(context: BuildPipelineContext): Promise<BuildPipelineState> {
    const state = this.initializeState(context);

    try {
      // Stage 0: Init
      await this.executeStage(state, "init", () => this.stageInit(state, context));

      // Stage 1: Blueprint (Systems AI only)
      if (state.bundle.build.buildMode === "systems_ai") {
        await this.executeStage(state, "blueprint", () => this.stageBlueprint(state, context));
      } else {
        this.skipStage(state, "blueprint");
      }

      // Stage 2: Brand
      await this.executeStage(state, "brand", () => this.stageBrand(state, context));

      // Stage 3: Pages + Manifest
      await this.executeStage(state, "pages", () => this.stagePages(state, context));

      // Stage 4: Intent Wiring
      await this.executeStage(state, "intents", () => this.stageIntents(state, context));

      // Stage 5: Automations
      await this.executeStage(state, "automations", () => this.stageAutomations(state, context));

      // Stage 6: Entitlements
      await this.executeStage(state, "entitlements", () => this.stageEntitlements(state, context));

      // Stage 7: Persist
      await this.executeStage(state, "persist", () => this.stagePersist(state, context));

      state.completedAt = new Date().toISOString();
      return state;
    } catch (error) {
      // Mark current stage as failed
      const currentStageResult = state.stages[state.currentStage];
      currentStageResult.status = "failed";
      currentStageResult.error = {
        code: "PIPELINE_ERROR",
        message: error instanceof Error ? error.message : String(error),
      };
      throw error;
    }
  }

  /**
   * Initialize pipeline state
   */
  private initializeState(context: BuildPipelineContext): BuildPipelineState {
    const buildId = nanoid();
    const siteId = nanoid();
    const now = new Date().toISOString();

    const stages: Record<BuildPipelineStage, BuildStageResult> = {} as any;
    for (const stage of PIPELINE_STAGES) {
      stages[stage] = { stage, status: "pending" };
    }

    return {
      buildId,
      siteId,
      mode: "systems_ai",
      currentStage: "init",
      stages,
      bundle: this.createSkeletonBundle(siteId, buildId, context),
      startedAt: now,
    };
  }

  /**
   * Create skeleton SiteBundle
   */
  private createSkeletonBundle(
    siteId: string,
    buildId: string,
    context: BuildPipelineContext
  ): SiteBundle {
    const now = new Date().toISOString();
    const homePageId = "home";

    return {
      version: CURRENT_VERSION,
      site: {
        siteId,
        businessId: context.businessId,
        ownerUserId: context.ownerUserId,
        createdAt: now,
        updatedAt: now,
        status: "draft",
      },
      build: {
        buildId,
        buildMode: "systems_ai",
        prompt: context.prompt,
        startedAt: now,
        trace: [],
        warnings: [],
        errors: [],
      },
      brand: {
        name: "My Business",
        colors: { primary: "#000000", secondary: "#666666", accent: "#0066cc", background: "#ffffff" },
        typography: { headingFont: "Inter", bodyFont: "Inter" },
        tone: "corporate",
      },
      manifest: {
        routes: [{ path: "/", pageId: homePageId, isHome: true }],
        nav: [{ label: "Home", path: "/", pageId: homePageId }],
        layout: { header: "default", footer: "default" },
        metadata: { title: "My Business" },
      },
      pages: {},
      assets: {},
      intents: {
        catalogVersion: "2026-02-18",
        definitions: this.getDefaultIntentDefinitions(),
        bindings: [],
      },
      automations: {
        installed: [],
        secretsRequired: [],
      },
      integrations: {
        providers: [],
      },
      entitlements: {
        plan: "free",
        features: {},
        limits: {},
      },
      runtime: {
        preferredEngine: "simple",
        enginesAllowed: ["simple", "vfs", "worker"],
        entry: { type: "html", pageId: homePageId },
      },
    };
  }

  /**
   * Get default intent definitions
   */
  private getDefaultIntentDefinitions(): Record<IntentId, IntentDefinition> {
    return {
      "lead.submit": {
        intentId: "lead.submit",
        category: "form",
        description: "Submit contact/lead form",
        paramsSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            message: { type: "string" },
          },
          required: ["email"],
        },
        handler: {
          kind: "edge",
          edgeFunction: { name: "handle-lead", path: "/functions/v1/handle-lead", method: "POST" },
        },
      },
      "nav.go": {
        intentId: "nav.go",
        category: "nav",
        description: "Navigate to a page",
        paramsSchema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
        handler: {
          kind: "client",
          clientAction: { type: "NAVIGATE", to: "" },
        },
      },
      "booking.request": {
        intentId: "booking.request",
        category: "form",
        description: "Request an appointment/booking",
        paramsSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            date: { type: "string" },
            service: { type: "string" },
          },
          required: ["email"],
        },
        handler: {
          kind: "edge",
          edgeFunction: { name: "handle-booking", path: "/functions/v1/handle-booking", method: "POST" },
        },
      },
      "subscribe.email": {
        intentId: "subscribe.email",
        category: "form",
        description: "Subscribe to newsletter",
        paramsSchema: {
          type: "object",
          properties: { email: { type: "string" } },
          required: ["email"],
        },
        handler: {
          kind: "edge",
          edgeFunction: { name: "handle-subscribe", path: "/functions/v1/handle-subscribe", method: "POST" },
        },
      },
    };
  }

  /**
   * Execute a pipeline stage with tracking
   */
  private async executeStage(
    state: BuildPipelineState,
    stage: BuildPipelineStage,
    executor: () => Promise<void>
  ): Promise<void> {
    state.currentStage = stage;
    const stageResult = state.stages[stage];
    stageResult.status = "running";
    stageResult.startedAt = new Date().toISOString();

    this.trace(state, stage, "info", `Starting stage: ${stage}`);

    try {
      await executor();
      stageResult.status = "completed";
      stageResult.completedAt = new Date().toISOString();
      this.trace(state, stage, "info", `Completed stage: ${stage}`);
    } catch (error) {
      stageResult.status = "failed";
      stageResult.completedAt = new Date().toISOString();
      stageResult.error = {
        code: `${stage.toUpperCase()}_FAILED`,
        message: error instanceof Error ? error.message : String(error),
      };
      this.trace(state, stage, "error", `Failed stage: ${stage} - ${stageResult.error.message}`);
      throw error;
    }
  }

  /**
   * Skip a pipeline stage
   */
  private skipStage(state: BuildPipelineState, stage: BuildPipelineStage): void {
    const stageResult = state.stages[stage];
    stageResult.status = "skipped";
    this.trace(state, stage, "info", `Skipped stage: ${stage}`);
  }

  /**
   * Add trace entry - maps pipeline stage to closest build stage
   */
  private trace(
    state: BuildPipelineState,
    pipelineStage: BuildPipelineStage,
    level: "info" | "warn" | "error",
    message: string,
    data?: Record<string, unknown>
  ): void {
    // Map pipeline stages to build stages for trace
    const stageMap: Record<BuildPipelineStage, BuildStage> = {
      init: "blueprint",
      blueprint: "blueprint",
      brand: "layout",
      pages: "pages",
      intents: "intents",
      automations: "automations",
      entitlements: "preview",
      persist: "publish",
    };

    state.bundle.build.trace.push({
      ts: new Date().toISOString(),
      stage: stageMap[pipelineStage],
      level,
      message,
      data,
    });
  }

  // ============================================================================
  // Stage Implementations
  // ============================================================================

  /**
   * Stage 0: Init - Create site + build record, skeleton bundle
   */
  private async stageInit(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    const now = new Date().toISOString();

    // Create site record
    const siteRow: SiteRow = {
      siteId: state.siteId,
      businessId: context.businessId,
      ownerUserId: context.ownerUserId,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };
    await this.storage.createSite(siteRow);

    // Create build record
    const buildRow: SiteBuildRow = {
      buildId: state.buildId,
      siteId: state.siteId,
      mode: state.mode,
      startedAt: now,
      warningsCount: 0,
      errorsCount: 0,
    };
    await this.storage.createBuild(buildRow);

    this.trace(state, "init", "info", "Created site and build records", {
      siteId: state.siteId,
      buildId: state.buildId,
    });
  }

  /**
   * Stage 1: Blueprint - Generate BusinessBlueprint (Systems AI only)
   */
  private async stageBlueprint(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    const blueprint = await this.aiProvider.generateBlueprint(context);
    state.bundle.blueprint = blueprint;

    this.trace(state, "blueprint", "info", "Generated business blueprint", {
      primaryGoal: blueprint.primaryGoal,
      pages: blueprint.pages?.length || 0,
    });
  }

  /**
   * Stage 2: Brand - Produce brand tokens
   */
  private async stageBrand(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    const blueprint = state.bundle.blueprint || this.getDefaultBlueprint(context);
    const brand = await this.aiProvider.generateBrandKit(blueprint, context);
    state.bundle.brand = brand;

    this.trace(state, "brand", "info", "Generated brand kit", {
      primaryColor: brand.colors.primary,
      tone: brand.tone,
    });
  }

  /**
   * Get default blueprint for non-AI builds
   */
  private getDefaultBlueprint(context: BuildPipelineContext): BusinessBlueprint {
    return {
      industry: context.industry || "general",
      businessName: "My Business",
      primaryGoal: "leads",
      pages: [
        { title: "Home", path: "/", purpose: "Main landing page" },
        { title: "About", path: "/about", purpose: "About the business" },
        { title: "Services", path: "/services", purpose: "List of services" },
        { title: "Contact", path: "/contact", purpose: "Contact form" },
      ],
      ctas: [],
    };
  }

  /**
   * Stage 3: Pages + Manifest
   */
  private async stagePages(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    const blueprint = state.bundle.blueprint || this.getDefaultBlueprint(context);
    const blueprintPages = blueprint.pages || this.getDefaultBlueprint(context).pages;

    // Create routes from blueprint pages
    const routes: RouteDef[] = blueprintPages.map((page, index) => ({
      path: page.path,
      pageId: page.title.toLowerCase().replace(/\s+/g, "-"),
      isHome: index === 0,
    }));

    // Create nav items
    const nav: NavItem[] = blueprintPages.map(page => ({
      label: page.title,
      path: page.path,
      pageId: page.title.toLowerCase().replace(/\s+/g, "-"),
    }));

    // Update manifest
    state.bundle.manifest.routes = routes;
    state.bundle.manifest.nav = nav;
    state.bundle.runtime.entry.pageId = routes[0]?.pageId || "home";

    // Generate each page
    for (const page of blueprintPages) {
      const pageId = page.title.toLowerCase().replace(/\s+/g, "-");
      const generatedPage = await this.aiProvider.generatePage(
        { path: page.path, title: page.title },
        blueprint,
        state.bundle.brand,
        context
      );
      state.bundle.pages[pageId] = generatedPage;

      this.trace(state, "pages", "info", `Generated page: ${pageId}`, {
        path: page.path,
        sourceKind: generatedPage.source.kind,
      });
    }
  }

  /**
   * Stage 4: Intent Wiring - Deterministic first, AI fallback
   */
  private async stageIntents(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    const bindings: IntentBinding[] = [];
    let bindingIndex = 0;

    // Convert definitions record to array for AI inference
    const definitionsArray = Object.values(state.bundle.intents.definitions);

    for (const [pageId, page] of Object.entries(state.bundle.pages)) {
      // Extract interactive elements from page HTML
      const elements = this.extractInteractiveElements(page.output?.html || "");

      for (const element of elements) {
        // Try deterministic rules first
        let wiringResult = this.applyDeterministicRules(element.text, element.context);

        // AI fallback if no deterministic match
        if (!wiringResult) {
          wiringResult = await this.aiProvider.inferIntent(
            element.text,
            element.context,
            definitionsArray
          );
        }

        if (wiringResult) {
          const elementId = `ut-${pageId}-${bindingIndex++}`;
          
          // Create binding target using data-attr strategy
          const target: BindingTarget = {
            strategy: "data-attr",
            selector: `[data-ut-id="${elementId}"]`,
          };
          
          bindings.push({
            bindingId: nanoid(),
            pageId,
            target,
            intentId: wiringResult.intentId,
            params: wiringResult.params,
            label: element.text,
          });

          this.trace(state, "intents", "info", `Wired intent: ${wiringResult.intentId}`, {
            elementId,
            source: wiringResult.source,
            confidence: wiringResult.confidence,
          });
        }
      }

      // Update page with intent bindings
      page.intentBindings = bindings.filter(b => b.pageId === pageId);
    }

    state.bundle.intents.bindings = bindings;
  }

  /**
   * Extract interactive elements from HTML
   */
  private extractInteractiveElements(html: string): Array<{ text: string; context: string; tag: string }> {
    const elements: Array<{ text: string; context: string; tag: string }> = [];
    
    // Simple regex-based extraction (in production, use a proper HTML parser)
    const buttonRegex = /<button[^>]*>([^<]+)<\/button>/gi;
    const linkRegex = /<a[^>]*>([^<]+)<\/a>/gi;
    const inputSubmitRegex = /<input[^>]*type=["']submit["'][^>]*value=["']([^"']+)["'][^>]*>/gi;
    const formRegex = /<form[^>]*>[\s\S]*?<\/form>/gi;

    let match;

    while ((match = buttonRegex.exec(html)) !== null) {
      elements.push({ text: match[1].trim(), context: "button", tag: "button" });
    }

    while ((match = linkRegex.exec(html)) !== null) {
      const text = match[1].trim();
      if (text && !text.startsWith("http")) {
        elements.push({ text, context: "link", tag: "a" });
      }
    }

    while ((match = inputSubmitRegex.exec(html)) !== null) {
      elements.push({ text: match[1].trim(), context: "form-submit", tag: "input" });
    }

    return elements;
  }

  /**
   * Apply deterministic intent wiring rules
   */
  private applyDeterministicRules(text: string, context: string): IntentWiringResult | null {
    const sortedRules = [...DETERMINISTIC_INTENT_RULES].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const pattern = typeof rule.pattern === "string" ? new RegExp(rule.pattern, "i") : rule.pattern;
      if (pattern.test(text)) {
        return {
          elementId: "", // Will be assigned later
          intentId: rule.intentId,
          params: {},
          source: "deterministic",
        };
      }
    }

    return null;
  }

  /**
   * Stage 5: Automations Install
   */
  private async stageAutomations(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    const blueprint = state.bundle.blueprint;
    const industry = blueprint?.industry || context.industry || "general";

    // Get applicable recipes based on industry
    const recipes = this.getIndustryRecipes(industry);
    const secretsRequired: SecretRequirement[] = [];

    for (const recipe of recipes) {
      // Check if secrets are required
      const recipeSecrets = this.getRecipeSecrets(recipe.recipeId);
      const needsSecrets = recipeSecrets.length > 0;

      // Create automation install
      const install: AutomationInstall = {
        installId: nanoid(),
        recipeId: recipe.recipeId,
        enabled: !needsSecrets, // Disabled if secrets required
        triggers: [{ type: "intent", intentId: "lead.submit" }],
        runtime: { kind: "inngest", entrypoint: recipe.recipeId },
      };
      
      state.bundle.automations.installed.push(install);

      // Track required secrets
      if (needsSecrets) {
        for (const secretKey of recipeSecrets) {
          if (!secretsRequired.some(s => s.provider === secretKey)) {
            secretsRequired.push({
              provider: secretKey,
              reason: `Required for ${recipe.name}`,
            });
          }
        }
      }

      this.trace(state, "automations", "info", `Installed recipe: ${recipe.recipeId}`, {
        enabled: !needsSecrets,
        secretsNeeded: recipeSecrets,
      });
    }

    state.bundle.automations.secretsRequired = secretsRequired;
  }

  /**
   * Get industry-specific automation recipes
   */
  private getIndustryRecipes(industry: string): Array<{ recipeId: string; name: string }> {
    const baseRecipes = [
      { recipeId: "lead-notification", name: "Lead Email Notification" },
      { recipeId: "lead-crm-sync", name: "CRM Lead Sync" },
    ];

    const industryRecipes: Record<string, Array<{ recipeId: string; name: string }>> = {
      contractor: [
        { recipeId: "estimate-request", name: "Estimate Request Handler" },
        { recipeId: "job-scheduling", name: "Job Scheduling" },
      ],
      restaurant: [
        { recipeId: "reservation-handler", name: "Reservation Handler" },
        { recipeId: "menu-update", name: "Menu Auto-Update" },
      ],
      ecommerce: [
        { recipeId: "cart-abandonment", name: "Cart Abandonment Email" },
        { recipeId: "order-confirmation", name: "Order Confirmation" },
      ],
    };

    return [...baseRecipes, ...(industryRecipes[industry] || [])];
  }

  /**
   * Get secrets required for a recipe
   */
  private getRecipeSecrets(recipeId: string): string[] {
    const secretsMap: Record<string, string[]> = {
      "lead-crm-sync": ["CRM_API_KEY"],
      "cart-abandonment": ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"],
      "order-confirmation": ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"],
    };

    return secretsMap[recipeId] || [];
  }

  /**
   * Stage 6: Entitlements + Gating
   */
  private async stageEntitlements(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    // Set default plan
    state.bundle.entitlements = {
      plan: "free",
      features: {
        customDomain: false,
        removeWatermark: false,
        analytics: false,
        formSubmissions: true,
        automations: false,
        sslCertificate: true,
      },
      limits: {
        pagesMax: 5,
        formsMax: 2,
        submissionsPerMonth: 100,
        storageGb: 0.5,
        bandwidthGb: 10,
      },
    };

    // Apply constraints from context
    if (context.constraints?.pagesMax) {
      state.bundle.entitlements.limits.pagesMax = context.constraints.pagesMax as number;
    }

    this.trace(state, "entitlements", "info", "Set entitlements", {
      plan: state.bundle.entitlements.plan,
      features: Object.keys(state.bundle.entitlements.features).length,
    });

    // Bundle is now "previewable"
    state.bundle.site.status = "preview";
    state.bundle.site.updatedAt = new Date().toISOString();
  }

  /**
   * Stage 7: Persist Bundle
   */
  private async stagePersist(state: BuildPipelineState, context: BuildPipelineContext): Promise<void> {
    state.bundle.build.finishedAt = new Date().toISOString();

    // Update build record
    await this.storage.updateBuild(state.buildId, {
      finishedAt: state.bundle.build.finishedAt,
      warningsCount: state.bundle.build.warnings.length,
      errorsCount: state.bundle.build.errors.length,
    });

    // Save bundle
    const bundleRow: SiteBundleRow = {
      siteId: state.siteId,
      buildId: state.buildId,
      version: CURRENT_VERSION,
      bundleJson: JSON.stringify(state.bundle),
      createdAt: new Date().toISOString(),
    };
    await this.storage.saveBundle(bundleRow);

    this.trace(state, "persist", "info", "Persisted bundle", {
      bundleSize: bundleRow.bundleJson.length,
    });
  }
}

// ============================================================================
// Export Types
// ============================================================================

export type {
  BuildPipelineStage,
  BuildPipelineStatus,
  BuildStageResult,
  BuildPipelineState,
  BuildPipelineContext,
};
