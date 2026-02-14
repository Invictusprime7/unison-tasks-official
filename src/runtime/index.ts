/**
 * Unison Tasks Runtime Module
 * 
 * Universal Intent System - "Lovable-level" no-config click handling
 * 
 * Architecture:
 * 1. CORE_INTENTS - Canonical intent namespace (single source of truth)
 * 2. INTENT_ALIASES - Normalizes legacy/alternate intents to canonical
 * 3. Intent Executor - Unified execution with UI directives + context hydration
 * 4. AutoBinder - Build-time intent assignment (buttons just work)
 * 5. ACTION_CATALOG - Legacy execution layer (being deprecated)
 * 
 * The "Lovable feeling" formula:
 * Intent System + AutoBinder + Default Provisioning + UI Directives
 */

// ============ NEW: Unified Intent System ============

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

// Template Runtime Provider - Pre-wired context for previews
export {
  TemplateRuntimeProvider,
  useTemplateRuntime,
  generateRuntimeInjectionScript,
  type TemplateRuntimeConfig,
  type TemplateRuntimeContextValue,
} from './TemplateRuntimeProvider';

// Subscription Enforcement - Limit checking for intents
export {
  getSubscriptionStatus,
  checkIntentAllowed,
  incrementUsage,
  withSubscriptionCheck,
  clearSubscriptionCache,
  type SubscriptionStatus,
} from './subscriptionEnforcement';

// AutoBinder - Build-time intent assignment
export {
  bindIntent,
  bindAllIntents,
  autoBindElement,
  extractBindableNodes,
  type BindableNode,
  type BindingResult,
  type TemplateContext,
} from './autoBinder';

// ============ LEGACY: Action Catalog (use executeIntent instead) ============

// Action Catalog - The deterministic execution layer
export {
  ACTION_CATALOG,
  executeAction,
  isValidIntent,
  getAvailableIntents,
  configureActionCatalog,
  type ActionCatalogEntry,
  type ActionContext,
  type OverlayManager,
  type NavigationManager,
  type CommunicationManager,
} from './actionCatalog';

// Intent Resolver - The resolution layer (build-time)
export {
  resolveIntent,
  extractButtonContext,
  type ButtonContext,
  type ResolvedIntent,
} from './intentResolver';

// Universal Intent Router - The orchestration layer
export {
  UniversalIntentRouter,
  createIntentRouter,
  getActiveRouter,
  setupPreviewRouter,
  setupProductionRouter,
  type IntentRouterConfig,
} from './universalIntentRouter';

/**
 * Quick reference for intent values:
 * 
 * NAVIGATION
 * - nav.goto_page      Navigate to internal page
 * - nav.scroll_to      Scroll to anchor
 * - nav.external       Open external URL
 * - nav.back           Go back in history
 * 
 * COMMERCE
 * - shop.open_cart     Open cart overlay
 * - shop.add_to_cart   Add product to cart
 * - shop.remove_from_cart  Remove product from cart
 * - shop.checkout      Navigate to checkout
 * - shop.apply_coupon  Apply discount code
 * 
 * BOOKING
 * - booking.open       Open booking modal
 * - booking.submit     Submit booking form
 * - booking.cancel     Cancel booking
 * 
 * LEAD/CONTACT
 * - lead.open_form     Open contact/lead form
 * - lead.submit_form   Submit lead form
 * - quote.request      Request a quote
 * 
 * COMMUNICATION
 * - call.now           Initiate phone call
 * - email.now          Open email client
 * 
 * AUTHENTICATION
 * - auth.sign_in       Open sign in
 * - auth.sign_up       Open sign up
 * - auth.sign_out      Sign out user
 * 
 * NEWSLETTER/WAITLIST
 * - newsletter.submit  Subscribe to newsletter
 * - waitlist.join      Join waitlist
 * 
 * SOCIAL
 * - social.share       Share on social platform
 * - social.follow      Follow on social platform
 * - social.copy_link   Copy link to clipboard
 */
