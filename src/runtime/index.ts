/**
 * Unison Tasks Runtime Module
 * 
 * Universal Intent System - "Lovable-level" no-config click handling
 * 
 * Architecture:
 * 1. CORE_INTENTS - Canonical intent namespace (single source of truth)
 * 2. INTENT_ALIASES - Normalizes legacy/alternate intents to canonical
 * 3. Intent Executor - Unified execution with UI directives + context hydration
 */

// ============ Unified Intent System ============

// Intent Aliases - Normalize everything to CORE_INTENTS
export {
  INTENT_ALIASES,
  normalizeIntent,
  isNormalizedCoreIntent,
  getCanonicalIntent,
  getAliasesFor,
} from './intentAliases';

// Intent Executor - Unified execution with UI directives
export {
  executeIntent,
  configureIntentExecutor,
  canHandleIntent,
  getSupportedIntents,
  type IntentResult,
  type IntentContext,
  type IntentManagers,
  type UIDirective,
  type ToastDirective,
  type MissingFieldsDirective,
  type EmittedEvent,
} from './intentExecutor';

// Intent Failure Bus - AI auto-diagnosis
export {
  emitIntentFailure,
  onIntentFailure,
  type IntentFailureEvent,
} from './intentFailureBus';

// Intent Success Bus - AI auto-continuation
export {
  emitIntentSuccess,
  onIntentSuccess,
  type IntentSuccessEvent,
} from './intentSuccessBus';

// Template Runtime Provider - Pre-wired context for previews
export {
  TemplateRuntimeProvider,
  useTemplateRuntime,
  generateRuntimeInjectionScript,
  type TemplateRuntimeConfig,
  type TemplateRuntimeContextValue,
} from './TemplateRuntimeProvider';

// ============ LEGACY (still used by useIntentRouter → universalIntentRouter chain) ============
// TODO: Consolidate useIntentRouter to use intentExecutor directly, then remove these

// Action Catalog - Legacy types only (execution now routed through intentExecutor)
export {
  type ActionCatalogEntry,
  type ActionContext,
  type OverlayManager,
  type NavigationManager,
  type CommunicationManager,
} from './actionCatalog';

// Intent Resolver - Legacy resolution layer (build-time)
export {
  resolveIntent,
  extractButtonContext,
  type ButtonContext,
  type ResolvedIntent,
} from './intentResolver';

// Universal Intent Router - Legacy orchestration layer
export {
  UniversalIntentRouter,
  createIntentRouter,
  getActiveRouter,
  setupPreviewRouter,
  setupProductionRouter,
  type IntentRouterConfig,
} from './universalIntentRouter';
