/**
 * SiteBundle Service
 * 
 * High-level service for managing SiteBundles with persistence,
 * AI integration, and publishing workflows.
 */

import type {
  SiteBundle,
  SiteIdentity,
  BuildProvenance,
  BuildMode,
  BrandPrimitives,
  PageBundle,
  AssetBundle,
  IntentDefinition,
  IntentBinding,
  AutomationInstall,
  ProviderConfig,
  PlanTier,
  PublishInfo,
  SiteBundleValidationResult,
  BuildTraceEvent,
} from "../types/siteBundle";
import {
  createEmptySiteBundle,
  createBuildProvenance,
  createTraceEvent,
  createPageBundle,
  createAssetBundle,
  createIntentDefinition,
  createIntentBinding,
  addPage,
  removePage,
  updatePage,
  addAsset,
  removeAsset,
  addIntentDefinition,
  addIntentBinding,
  removeIntentBinding,
  installAutomation,
  uninstallAutomation,
  addProvider,
  updateSiteStatus,
  updateBrand,
  finalizeBuild,
  addTraceEvent,
  addBuildWarning,
  addBuildError,
  validateBundle,
  validateBundleConsistency,
  serializeBundle,
  parseBundle,
  cloneBundle,
  CURRENT_BUNDLE_VERSION,
} from "../utils/siteBundleUtils";
import { validateSiteBundle } from "../schemas/SiteBundle";

// ============================================================================
// Types
// ============================================================================

export interface CreateSiteOptions {
  businessId: string;
  ownerUserId: string;
  name: string;
  buildMode?: BuildMode;
  plan?: PlanTier;
  prompt?: string;
}

export interface BuildContext {
  bundle: SiteBundle;
  startTime: number;
  stage: BuildTraceEvent["stage"];
}

export interface PublishOptions {
  version?: string;
  changelog?: string;
}

export interface SiteBundleStorage {
  save(bundle: SiteBundle): Promise<void>;
  load(siteId: string): Promise<SiteBundle | null>;
  delete(siteId: string): Promise<void>;
  list(businessId: string): Promise<SiteBundle[]>;
}

// ============================================================================
// In-Memory Storage (for development/testing)
// ============================================================================

export class InMemorySiteBundleStorage implements SiteBundleStorage {
  private bundles: Map<string, string> = new Map();

  async save(bundle: SiteBundle): Promise<void> {
    this.bundles.set(bundle.site.siteId, serializeBundle(bundle));
  }

  async load(siteId: string): Promise<SiteBundle | null> {
    const json = this.bundles.get(siteId);
    if (!json) return null;
    return parseBundle(json);
  }

  async delete(siteId: string): Promise<void> {
    this.bundles.delete(siteId);
  }

  async list(businessId: string): Promise<SiteBundle[]> {
    const result: SiteBundle[] = [];
    for (const json of this.bundles.values()) {
      const bundle = parseBundle(json);
      if (bundle.site.businessId === businessId) {
        result.push(bundle);
      }
    }
    return result;
  }

  clear(): void {
    this.bundles.clear();
  }
}

// ============================================================================
// SiteBundle Service
// ============================================================================

export class SiteBundleService {
  private storage: SiteBundleStorage;
  private currentBundle: SiteBundle | null = null;
  private buildContext: BuildContext | null = null;

  constructor(storage?: SiteBundleStorage) {
    this.storage = storage ?? new InMemorySiteBundleStorage();
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  /**
   * Create a new site bundle
   */
  async createSite(options: CreateSiteOptions): Promise<SiteBundle> {
    const bundle = createEmptySiteBundle(
      options.businessId,
      options.ownerUserId,
      options.name,
      {
        buildMode: options.buildMode,
        plan: options.plan,
      }
    );

    // Add prompt if provided
    if (options.prompt) {
      bundle.build.prompt = options.prompt;
    }

    await this.storage.save(bundle);
    this.currentBundle = bundle;

    return bundle;
  }

  /**
   * Load an existing site bundle
   */
  async loadSite(siteId: string): Promise<SiteBundle> {
    const bundle = await this.storage.load(siteId);
    if (!bundle) {
      throw new Error(`Site ${siteId} not found`);
    }
    this.currentBundle = bundle;
    return bundle;
  }

  /**
   * Save the current bundle
   */
  async save(): Promise<void> {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    await this.storage.save(this.currentBundle);
  }

  /**
   * Delete a site
   */
  async deleteSite(siteId: string): Promise<void> {
    await this.storage.delete(siteId);
    if (this.currentBundle?.site.siteId === siteId) {
      this.currentBundle = null;
    }
  }

  /**
   * List sites for a business
   */
  async listSites(businessId: string): Promise<SiteBundle[]> {
    return this.storage.list(businessId);
  }

  /**
   * Get current bundle
   */
  getBundle(): SiteBundle {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    return this.currentBundle;
  }

  /**
   * Set current bundle (for testing/recovery)
   */
  setBundle(bundle: SiteBundle): void {
    this.currentBundle = bundle;
  }

  // --------------------------------------------------------------------------
  // Build Management
  // --------------------------------------------------------------------------

  /**
   * Start a new build
   */
  startBuild(mode: BuildMode): BuildContext {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    this.currentBundle = {
      ...this.currentBundle,
      build: createBuildProvenance(mode, {
        prompt: this.currentBundle.build.prompt,
      }),
    };

    this.buildContext = {
      bundle: this.currentBundle,
      startTime: Date.now(),
      stage: "blueprint",
    };

    return this.buildContext;
  }

  /**
   * Add a trace event to the current build
   */
  trace(
    level: BuildTraceEvent["level"],
    message: string,
    data?: Record<string, unknown>
  ): void {
    if (!this.currentBundle) return;

    const event = createTraceEvent(
      this.buildContext?.stage ?? "blueprint",
      level,
      message,
      data
    );

    this.currentBundle = addTraceEvent(this.currentBundle, event);
  }

  /**
   * Set the current build stage
   */
  setStage(stage: BuildTraceEvent["stage"]): void {
    if (this.buildContext) {
      this.buildContext.stage = stage;
    }
  }

  /**
   * Add a warning to the current build
   */
  warn(code: string, message: string, data?: unknown): void {
    if (!this.currentBundle) return;
    this.currentBundle = addBuildWarning(this.currentBundle, {
      code,
      message,
      data,
    });
  }

  /**
   * Add an error to the current build
   */
  error(code: string, message: string, data?: unknown): void {
    if (!this.currentBundle) return;
    this.currentBundle = addBuildError(this.currentBundle, {
      code,
      message,
      data,
    });
  }

  /**
   * Finalize the current build
   */
  finalizeBuild(): SiteBundle {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    this.currentBundle = finalizeBuild(this.currentBundle);
    this.buildContext = null;

    return this.currentBundle;
  }

  // --------------------------------------------------------------------------
  // Page Management
  // --------------------------------------------------------------------------

  /**
   * Add a new page
   */
  addPage(
    path: string,
    title: string,
    options?: Partial<PageBundle> & { addToNav?: boolean }
  ): PageBundle {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    const { addToNav, ...pageOptions } = options ?? {};
    const page = createPageBundle(path, title, pageOptions);
    this.currentBundle = addPage(this.currentBundle, page, addToNav);

    return page;
  }

  /**
   * Update an existing page
   */
  updatePage(pageId: string, updates: Partial<PageBundle>): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = updatePage(this.currentBundle, pageId, updates);
  }

  /**
   * Remove a page
   */
  removePage(pageId: string): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = removePage(this.currentBundle, pageId);
  }

  /**
   * Get a page by ID
   */
  getPage(pageId: string): PageBundle | undefined {
    return this.currentBundle?.pages[pageId];
  }

  // --------------------------------------------------------------------------
  // Asset Management
  // --------------------------------------------------------------------------

  /**
   * Add an asset
   */
  addAsset(
    name: string,
    type: AssetBundle["type"],
    storage: AssetBundle["storage"],
    options?: { mimeType?: string; meta?: AssetBundle["meta"] }
  ): AssetBundle {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    const asset = createAssetBundle(name, type, storage, options);
    this.currentBundle = addAsset(this.currentBundle, asset);

    return asset;
  }

  /**
   * Remove an asset
   */
  removeAsset(assetId: string): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = removeAsset(this.currentBundle, assetId);
  }

  /**
   * Get an asset by ID
   */
  getAsset(assetId: string): AssetBundle | undefined {
    return this.currentBundle?.assets[assetId];
  }

  // --------------------------------------------------------------------------
  // Intent Management
  // --------------------------------------------------------------------------

  /**
   * Define a new intent
   */
  defineIntent(
    intentId: string,
    category: IntentDefinition["category"],
    description: string,
    handler: IntentDefinition["handler"]
  ): IntentDefinition {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    const intent = createIntentDefinition(intentId, category, description, handler);
    this.currentBundle = addIntentDefinition(this.currentBundle, intent);

    return intent;
  }

  /**
   * Bind an intent to a target element
   */
  bindIntent(
    pageId: string,
    target: IntentBinding["target"],
    intentId: string,
    params: Record<string, unknown> = {}
  ): IntentBinding {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    const binding = createIntentBinding(pageId, target, intentId, params);
    this.currentBundle = addIntentBinding(this.currentBundle, binding);

    return binding;
  }

  /**
   * Unbind an intent
   */
  unbindIntent(bindingId: string): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = removeIntentBinding(this.currentBundle, bindingId);
  }

  // --------------------------------------------------------------------------
  // Automation Management
  // --------------------------------------------------------------------------

  /**
   * Install an automation
   */
  installAutomation(automation: AutomationInstall): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = installAutomation(this.currentBundle, automation);
  }

  /**
   * Uninstall an automation
   */
  uninstallAutomation(installId: string): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = uninstallAutomation(this.currentBundle, installId);
  }

  // --------------------------------------------------------------------------
  // Integration Management
  // --------------------------------------------------------------------------

  /**
   * Add a provider
   */
  addProvider(provider: ProviderConfig): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = addProvider(this.currentBundle, provider);
  }

  // --------------------------------------------------------------------------
  // Brand & Status
  // --------------------------------------------------------------------------

  /**
   * Update brand
   */
  updateBrand(updates: Partial<BrandPrimitives>): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = updateBrand(this.currentBundle, updates);
  }

  /**
   * Update site status
   */
  updateStatus(status: SiteIdentity["status"]): void {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    this.currentBundle = updateSiteStatus(this.currentBundle, status);
  }

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  /**
   * Validate the current bundle
   */
  validate(): SiteBundleValidationResult {
    if (!this.currentBundle) {
      return {
        valid: false,
        errors: [{ path: "", message: "No bundle loaded", code: "no_bundle" }],
        warnings: [],
      };
    }

    const schemaResult = validateBundle(this.currentBundle);
    if (!schemaResult.valid) {
      return schemaResult;
    }

    return validateBundleConsistency(this.currentBundle);
  }

  // --------------------------------------------------------------------------
  // Publishing
  // --------------------------------------------------------------------------

  /**
   * Prepare bundle for preview
   */
  preparePreview(): SiteBundle {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    this.currentBundle = updateSiteStatus(this.currentBundle, "preview");
    return this.currentBundle;
  }

  /**
   * Publish the site
   */
  async publish(
    artifact: PublishInfo["artifact"],
    options?: PublishOptions
  ): Promise<SiteBundle> {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(
        `Cannot publish invalid bundle: ${validation.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    this.currentBundle = {
      ...this.currentBundle,
      site: {
        ...this.currentBundle.site,
        status: "published",
        updatedAt: new Date().toISOString(),
      },
      publish: {
        publishedAt: new Date().toISOString(),
        artifact,
        version: options?.version,
        changelog: options?.changelog,
      },
    };

    await this.save();
    return this.currentBundle;
  }

  /**
   * Archive the site
   */
  async archive(): Promise<SiteBundle> {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }

    this.currentBundle = updateSiteStatus(this.currentBundle, "archived");
    await this.save();
    return this.currentBundle;
  }

  // --------------------------------------------------------------------------
  // Utility
  // --------------------------------------------------------------------------

  /**
   * Clone the current bundle
   */
  clone(): SiteBundle {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    return cloneBundle(this.currentBundle);
  }

  /**
   * Export bundle as JSON
   */
  export(): string {
    if (!this.currentBundle) {
      throw new Error("No bundle loaded");
    }
    return serializeBundle(this.currentBundle);
  }

  /**
   * Import bundle from JSON
   */
  import(json: string): SiteBundle {
    const bundle = parseBundle(json);
    this.currentBundle = bundle;
    return bundle;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultService: SiteBundleService | null = null;

export function getSiteBundleService(): SiteBundleService {
  if (!defaultService) {
    defaultService = new SiteBundleService();
  }
  return defaultService;
}

export function resetSiteBundleService(): void {
  defaultService = null;
}
