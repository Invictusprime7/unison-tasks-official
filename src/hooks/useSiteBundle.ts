/**
 * useSiteBundle Hook
 * 
 * React hook for managing SiteBundle state with React context and hooks.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type {
  SiteBundle,
  PageBundle,
  AssetBundle,
  IntentBinding,
  IntentDefinition,
  BrandPrimitives,
  SiteIdentity,
  SiteBundleValidationResult,
  BuildMode,
  PlanTier,
} from "../types/siteBundle";
import {
  SiteBundleService,
  getSiteBundleService,
  CreateSiteOptions,
} from "../services/siteBundleService";
import {
  getPages,
  getAssets,
  getPageByPath,
  getPageIntentBindings,
  hasFeature,
  isWithinLimit,
  isPublishable,
  hasBuildErrors,
  getSortedNavigation,
} from "../utils/siteBundleUtils";

// ============================================================================
// Types
// ============================================================================

export interface UseSiteBundleState {
  bundle: SiteBundle | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  validation: SiteBundleValidationResult | null;
}

export interface UseSiteBundleActions {
  // Lifecycle
  createSite: (options: CreateSiteOptions) => Promise<SiteBundle>;
  loadSite: (siteId: string) => Promise<SiteBundle>;
  saveSite: () => Promise<void>;
  deleteSite: (siteId: string) => Promise<void>;

  // Pages
  addPage: (path: string, title: string, addToNav?: boolean) => PageBundle;
  updatePage: (pageId: string, updates: Partial<PageBundle>) => void;
  removePage: (pageId: string) => void;

  // Assets
  addAsset: (
    name: string,
    type: AssetBundle["type"],
    storage: AssetBundle["storage"],
    options?: { mimeType?: string; meta?: AssetBundle["meta"] }
  ) => AssetBundle;
  removeAsset: (assetId: string) => void;

  // Intents
  defineIntent: (
    intentId: string,
    category: IntentDefinition["category"],
    description: string,
    handler: IntentDefinition["handler"]
  ) => IntentDefinition;
  bindIntent: (
    pageId: string,
    target: IntentBinding["target"],
    intentId: string,
    params?: Record<string, unknown>
  ) => IntentBinding;
  unbindIntent: (bindingId: string) => void;

  // Brand
  updateBrand: (updates: Partial<BrandPrimitives>) => void;

  // Status
  updateStatus: (status: SiteIdentity["status"]) => void;
  preparePreview: () => void;

  // Build
  startBuild: (mode: BuildMode) => void;
  finalizeBuild: () => void;

  // Validation
  validate: () => SiteBundleValidationResult;

  // Utility
  reset: () => void;
}

export interface UseSiteBundleHelpers {
  // Page queries
  getPage: (pageId: string) => PageBundle | undefined;
  getPageByPath: (path: string) => PageBundle | undefined;
  getAllPages: () => PageBundle[];

  // Asset queries
  getAsset: (assetId: string) => AssetBundle | undefined;
  getAllAssets: () => AssetBundle[];

  // Intent queries
  getPageBindings: (pageId: string) => IntentBinding[];
  getIntentDefinition: (intentId: string) => IntentDefinition | undefined;

  // Navigation
  getNavigation: () => SiteBundle["manifest"]["nav"];

  // Entitlements
  hasFeature: (feature: string) => boolean;
  isWithinLimit: (limitKey: string, currentValue: number) => boolean;

  // Status
  isPublishable: () => boolean;
  hasBuildErrors: () => boolean;
}

export interface UseSiteBundleReturn
  extends UseSiteBundleState,
    UseSiteBundleActions,
    UseSiteBundleHelpers {}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSiteBundle(
  initialSiteId?: string
): UseSiteBundleReturn {
  const serviceRef = useRef<SiteBundleService>(getSiteBundleService());
  
  const [state, setState] = useState<UseSiteBundleState>({
    bundle: null,
    isLoading: false,
    error: null,
    isDirty: false,
    validation: null,
  });

  // Sync bundle state with service
  const syncBundle = useCallback(() => {
    try {
      const bundle = serviceRef.current.getBundle();
      setState((prev) => ({
        ...prev,
        bundle,
        isDirty: true,
        error: null,
      }));
    } catch {
      // No bundle loaded, that's OK
    }
  }, []);

  // Load initial site if provided
  useEffect(() => {
    if (initialSiteId) {
      loadSite(initialSiteId);
    }
  }, [initialSiteId]);

  // --------------------------------------------------------------------------
  // Lifecycle Actions
  // --------------------------------------------------------------------------

  const createSite = useCallback(
    async (options: CreateSiteOptions): Promise<SiteBundle> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const bundle = await serviceRef.current.createSite(options);
        setState({
          bundle,
          isLoading: false,
          error: null,
          isDirty: false,
          validation: null,
        });
        return bundle;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create site";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        throw err;
      }
    },
    []
  );

  const loadSite = useCallback(
    async (siteId: string): Promise<SiteBundle> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const bundle = await serviceRef.current.loadSite(siteId);
        setState({
          bundle,
          isLoading: false,
          error: null,
          isDirty: false,
          validation: null,
        });
        return bundle;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load site";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
        throw err;
      }
    },
    []
  );

  const saveSite = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await serviceRef.current.save();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isDirty: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save site";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const deleteSite = useCallback(async (siteId: string): Promise<void> => {
    await serviceRef.current.deleteSite(siteId);
    if (state.bundle?.site.siteId === siteId) {
      setState({
        bundle: null,
        isLoading: false,
        error: null,
        isDirty: false,
        validation: null,
      });
    }
  }, [state.bundle?.site.siteId]);

  // --------------------------------------------------------------------------
  // Page Actions
  // --------------------------------------------------------------------------

  const addPage = useCallback(
    (path: string, title: string, addToNav = true): PageBundle => {
      const page = serviceRef.current.addPage(path, title, { addToNav });
      syncBundle();
      return page;
    },
    [syncBundle]
  );

  const updatePage = useCallback(
    (pageId: string, updates: Partial<PageBundle>): void => {
      serviceRef.current.updatePage(pageId, updates);
      syncBundle();
    },
    [syncBundle]
  );

  const removePage = useCallback(
    (pageId: string): void => {
      serviceRef.current.removePage(pageId);
      syncBundle();
    },
    [syncBundle]
  );

  // --------------------------------------------------------------------------
  // Asset Actions
  // --------------------------------------------------------------------------

  const addAsset = useCallback(
    (
      name: string,
      type: AssetBundle["type"],
      storage: AssetBundle["storage"],
      options?: { mimeType?: string; meta?: AssetBundle["meta"] }
    ): AssetBundle => {
      const asset = serviceRef.current.addAsset(name, type, storage, options);
      syncBundle();
      return asset;
    },
    [syncBundle]
  );

  const removeAsset = useCallback(
    (assetId: string): void => {
      serviceRef.current.removeAsset(assetId);
      syncBundle();
    },
    [syncBundle]
  );

  // --------------------------------------------------------------------------
  // Intent Actions
  // --------------------------------------------------------------------------

  const defineIntent = useCallback(
    (
      intentId: string,
      category: IntentDefinition["category"],
      description: string,
      handler: IntentDefinition["handler"]
    ): IntentDefinition => {
      const intent = serviceRef.current.defineIntent(intentId, category, description, handler);
      syncBundle();
      return intent;
    },
    [syncBundle]
  );

  const bindIntent = useCallback(
    (
      pageId: string,
      target: IntentBinding["target"],
      intentId: string,
      params: Record<string, unknown> = {}
    ): IntentBinding => {
      const binding = serviceRef.current.bindIntent(
        pageId,
        target,
        intentId,
        params
      );
      syncBundle();
      return binding;
    },
    [syncBundle]
  );

  const unbindIntent = useCallback(
    (bindingId: string): void => {
      serviceRef.current.unbindIntent(bindingId);
      syncBundle();
    },
    [syncBundle]
  );

  // --------------------------------------------------------------------------
  // Brand & Status Actions
  // --------------------------------------------------------------------------

  const updateBrand = useCallback(
    (updates: Partial<BrandPrimitives>): void => {
      serviceRef.current.updateBrand(updates);
      syncBundle();
    },
    [syncBundle]
  );

  const updateStatus = useCallback(
    (status: SiteIdentity["status"]): void => {
      serviceRef.current.updateStatus(status);
      syncBundle();
    },
    [syncBundle]
  );

  const preparePreview = useCallback((): void => {
    serviceRef.current.preparePreview();
    syncBundle();
  }, [syncBundle]);

  // --------------------------------------------------------------------------
  // Build Actions
  // --------------------------------------------------------------------------

  const startBuild = useCallback(
    (mode: BuildMode): void => {
      serviceRef.current.startBuild(mode);
      syncBundle();
    },
    [syncBundle]
  );

  const finalizeBuild = useCallback((): void => {
    serviceRef.current.finalizeBuild();
    syncBundle();
  }, [syncBundle]);

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  const validate = useCallback((): SiteBundleValidationResult => {
    const result = serviceRef.current.validate();
    setState((prev) => ({ ...prev, validation: result }));
    return result;
  }, []);

  // --------------------------------------------------------------------------
  // Utility
  // --------------------------------------------------------------------------

  const reset = useCallback((): void => {
    setState({
      bundle: null,
      isLoading: false,
      error: null,
      isDirty: false,
      validation: null,
    });
  }, []);

  // --------------------------------------------------------------------------
  // Helpers (memoized)
  // --------------------------------------------------------------------------

  const helpers: UseSiteBundleHelpers = useMemo(
    () => ({
      getPage: (pageId: string) => state.bundle?.pages[pageId],
      
      getPageByPath: (path: string) =>
        state.bundle ? getPageByPath(state.bundle, path) : undefined,
      
      getAllPages: () => (state.bundle ? getPages(state.bundle) : []),
      
      getAsset: (assetId: string) => state.bundle?.assets[assetId],
      
      getAllAssets: () => (state.bundle ? getAssets(state.bundle) : []),
      
      getPageBindings: (pageId: string) =>
        state.bundle ? getPageIntentBindings(state.bundle, pageId) : [],
      
      getIntentDefinition: (intentId: string) =>
        state.bundle?.intents.definitions[intentId],
      
      getNavigation: () =>
        state.bundle ? getSortedNavigation(state.bundle) : [],
      
      hasFeature: (feature: string) =>
        state.bundle ? hasFeature(state.bundle, feature) : false,
      
      isWithinLimit: (limitKey: string, currentValue: number) =>
        state.bundle ? isWithinLimit(state.bundle, limitKey, currentValue) : false,
      
      isPublishable: () =>
        state.bundle ? isPublishable(state.bundle) : false,
      
      hasBuildErrors: () =>
        state.bundle ? hasBuildErrors(state.bundle) : false,
    }),
    [state.bundle]
  );

  return {
    // State
    ...state,
    
    // Actions
    createSite,
    loadSite,
    saveSite,
    deleteSite,
    addPage,
    updatePage,
    removePage,
    addAsset,
    removeAsset,
    defineIntent,
    bindIntent,
    unbindIntent,
    updateBrand,
    updateStatus,
    preparePreview,
    startBuild,
    finalizeBuild,
    validate,
    reset,
    
    // Helpers
    ...helpers,
  };
}

export default useSiteBundle;
