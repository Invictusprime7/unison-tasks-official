/**
 * Global Intent Listener
 * 
 * Provides automatic button-to-intent wiring without requiring custom components.
 * Attaches a single click listener that:
 * 1. Detects clicks on buttons and anchors
 * 2. Reads data-ut-intent (preferred) / data-intent (legacy) OR infers intent from label text
 * 3. Collects payload from data-* attributes and form context
 * 4. Routes to the intent handler
 * 
 * This allows existing templates to work without any modifications.
 */

import { handleIntent, IntentPayload, isValidIntent } from './intentRouter';
import { matchLabelToIntent, TemplateCategory } from './templateIntentConfig';

// ============================================================================
// Types
// ============================================================================

export interface GlobalListenerConfig {
  /** Template category for better intent inference */
  category?: TemplateCategory;
  /** Business ID to include in all payloads */
  businessId?: string;
  /** Template/page ID for analytics */
  templateId?: string;
  /** Workspace ID for context */
  workspaceId?: string;
  /** User ID if authenticated */
  userId?: string;
  /** Callback when intent is triggered */
  onIntentTriggered?: (intent: string, payload: IntentPayload, result: unknown) => void;
  /** Callback when intent fails */
  onIntentError?: (intent: string, error: string) => void;
  /** Show visual feedback (loading states, toasts) */
  showFeedback?: boolean;
  /** Debug mode - logs all clicks */
  debug?: boolean;
}

interface ListenerState {
  active: boolean;
  config: GlobalListenerConfig;
  cleanup: (() => void) | null;
}

// ============================================================================
// Module State
// ============================================================================

const state: ListenerState = {
  active: false,
  config: {},
  cleanup: null,
};

// ============================================================================
// Intent Inference
// ============================================================================

/**
 * Infer intent from button/anchor text
 */
function inferIntentFromText(text: string, category?: TemplateCategory): string | null {
  if (!text || text.trim().length === 0) return null;
  
  const config = matchLabelToIntent(text, category);
  return config?.intent || null;
}

/**
 * Check if element should be ignored (has data-intent="none" or similar)
 */
function shouldIgnoreElement(el: HTMLElement): boolean {
  const intent = el.getAttribute('data-ut-intent') || el.getAttribute('data-intent');
  if (intent === 'none' || intent === 'ignore' || intent === 'false') {
    return true;
  }
  
  // Ignore elements marked as non-interactive
  if (el.hasAttribute('data-no-intent')) {
    return true;
  }
  
  // Ignore navigation links that are external or download
  if (el.tagName === 'A') {
    const href = el.getAttribute('href');
    if (href?.startsWith('http') || href?.startsWith('//') || el.hasAttribute('download')) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// Payload Collection
// ============================================================================

/**
 * Collect payload from element's data-* attributes
 */
function collectDataAttributes(el: HTMLElement): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  
  // Get all data attributes except intent control attributes
  Array.from(el.attributes).forEach(attr => {
    if (
      attr.name.startsWith('data-') &&
      attr.name !== 'data-intent' &&
      attr.name !== 'data-ut-intent' &&
      attr.name !== 'data-no-intent'
    ) {
      // Convert data-product-id to productId
      const key = attr.name
        .replace('data-', '')
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      
      // Try to parse as JSON for complex values
      try {
        payload[key] = JSON.parse(attr.value);
      } catch {
        payload[key] = attr.value;
      }
    }
  });
  
  return payload;
}

/**
 * Collect form data if element is inside a form
 */
function collectFormData(el: HTMLElement): Record<string, unknown> | null {
  const form = el.closest('form');
  if (!form) return null;
  
  const formData = new FormData(form);
  const payload: Record<string, string> = {};
  
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      payload[key] = value;
    }
  });
  
  // Also collect form's data attributes
  const formAttrs = collectDataAttributes(form);
  
  return { ...formAttrs, ...payload };
}

/**
 * Collect complete payload for an element
 */
function collectPayload(el: HTMLElement, config: GlobalListenerConfig): IntentPayload {
  // Start with data attributes from the element
  const elementData = collectDataAttributes(el);
  
  // Add form data if inside a form
  const formData = collectFormData(el);
  
  // Merge with global context
  const payload: IntentPayload = {
    ...elementData,
    ...(formData || {}),
  };
  
  // Add global context
  if (config.businessId) payload.businessId = config.businessId;
  if (config.templateId) payload.templateId = config.templateId;
  if (config.workspaceId) payload.workspaceId = config.workspaceId;
  if (config.userId) payload.userId = config.userId;
  
  // Add element context
  payload._source = {
    tagName: el.tagName,
    id: el.id || undefined,
    className: el.className || undefined,
    text: el.textContent?.trim().substring(0, 100),
  };
  
  return payload;
}

// ============================================================================
// Visual Feedback
// ============================================================================

/**
 * Show loading state on element
 */
function showLoading(el: HTMLElement): () => void {
  const originalText = el.textContent;
  const originalDisabled = (el as HTMLButtonElement).disabled;
  
  el.classList.add('intent-loading');
  (el as HTMLButtonElement).disabled = true;
  
  // Add spinner if possible
  if (el.tagName === 'BUTTON') {
    const spinner = document.createElement('span');
    spinner.className = 'intent-spinner';
    spinner.innerHTML = '⏳ ';
    el.prepend(spinner);
  }
  
  return () => {
    el.classList.remove('intent-loading');
    (el as HTMLButtonElement).disabled = originalDisabled;
    const spinner = el.querySelector('.intent-spinner');
    if (spinner) spinner.remove();
  };
}

/**
 * Show success feedback
 */
function showSuccess(el: HTMLElement): void {
  el.classList.add('intent-success');
  setTimeout(() => el.classList.remove('intent-success'), 2000);
}

/**
 * Show error feedback
 */
function showError(el: HTMLElement): void {
  el.classList.add('intent-error');
  setTimeout(() => el.classList.remove('intent-error'), 2000);
}

// ============================================================================
// Click Handler
// ============================================================================

/**
 * Main click handler - processes all clicks and routes to intents
 */
async function handleClick(e: MouseEvent, config: GlobalListenerConfig): Promise<void> {
  // Find the nearest button or anchor
  const el = (e.target as HTMLElement).closest('button, a, [role="button"], [data-ut-intent], [data-intent]') as HTMLElement | null;
  
  if (!el) return;
  
  // Check if should be ignored
  if (shouldIgnoreElement(el)) {
    if (config.debug) {
      console.log('[GlobalIntent] Ignoring element:', el);
    }
    return;
  }
  
  // Get intent - prefer explicit data-ut-intent, fallback to legacy data-intent, then inference
  let intent = el.getAttribute('data-ut-intent') || el.getAttribute('data-intent');
  
  if (!intent) {
    const text = el.textContent || el.getAttribute('aria-label') || '';
    intent = inferIntentFromText(text, config.category);
  }
  
  if (!intent) {
    if (config.debug) {
      console.log('[GlobalIntent] No intent found for:', el.textContent?.trim());
    }
    return;
  }
  
  // Validate intent exists
  if (!isValidIntent(intent)) {
    if (config.debug) {
      console.log('[GlobalIntent] Invalid intent:', intent);
    }
    // Still emit custom event for potential local handling
    window.dispatchEvent(new CustomEvent(`intent:${intent}`, { 
      detail: collectPayload(el, config) 
    }));
    return;
  }
  
  // Prevent default behavior for handled intents
  e.preventDefault();
  e.stopPropagation();
  
  if (config.debug) {
    console.log('[GlobalIntent] Handling intent:', intent);
  }
  
  // Collect payload
  const payload = collectPayload(el, config);
  
  // Show loading feedback
  let clearLoading: (() => void) | null = null;
  if (config.showFeedback !== false) {
    clearLoading = showLoading(el);
  }
  
  try {
    // Handle the intent
    const result = await handleIntent(intent, payload);
    
    // Clear loading
    if (clearLoading) clearLoading();
    
    if (result.success) {
      if (config.showFeedback !== false) {
        showSuccess(el);
      }
      config.onIntentTriggered?.(intent, payload, result.data);
    } else {
      if (config.showFeedback !== false) {
        showError(el);
      }
      config.onIntentError?.(intent, result.error || 'Unknown error');
    }
  } catch (error) {
    // Clear loading
    if (clearLoading) clearLoading();
    
    if (config.showFeedback !== false) {
      showError(el);
    }
    config.onIntentError?.(intent, error instanceof Error ? error.message : 'Unknown error');
  }
}

// ============================================================================
// Form Submit Handler
// ============================================================================

/**
 * Handle form submissions
 */
async function handleFormSubmit(e: SubmitEvent, config: GlobalListenerConfig): Promise<void> {
  const form = e.target as HTMLFormElement;
  if (!form) return;
  
  // Get intent from form
  let intent = form.getAttribute('data-ut-intent') || form.getAttribute('data-intent');
  
  // If no form intent, check submit button
  if (!intent) {
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]') as HTMLElement;
    if (submitButton) {
      intent = submitButton.getAttribute('data-ut-intent') || submitButton.getAttribute('data-intent');
      if (!intent) {
        const text = submitButton.textContent || submitButton.getAttribute('value') || '';
        intent = inferIntentFromText(text, config.category);
      }
    }
  }
  
  // Default form intents based on form patterns
  if (!intent) {
    const formId = form.id?.toLowerCase() || '';
    const formClass = form.className?.toLowerCase() || '';
    const formAction = form.action?.toLowerCase() || '';
    
    if (formId.includes('contact') || formClass.includes('contact')) {
      intent = 'contact.submit';
    } else if (formId.includes('newsletter') || formClass.includes('newsletter') || formClass.includes('subscribe')) {
      intent = 'newsletter.subscribe';
    } else if (formId.includes('waitlist') || formClass.includes('waitlist')) {
      intent = 'join.waitlist';
    } else if (formId.includes('booking') || formClass.includes('booking') || formId.includes('reservation')) {
      intent = 'booking.create';
    } else if (formId.includes('login') || formClass.includes('login') || formId.includes('signin')) {
      intent = 'auth.signin';
    } else if (formId.includes('signup') || formClass.includes('signup') || formId.includes('register')) {
      intent = 'auth.signup';
    } else if (formId.includes('quote') || formClass.includes('quote')) {
      intent = 'quote.request';
    }
  }
  
  if (!intent || !isValidIntent(intent)) {
    if (config.debug) {
      console.log('[GlobalIntent] No valid intent for form:', form);
    }
    return; // Let form submit normally
  }
  
  // Prevent default form submission
  e.preventDefault();
  
  if (config.debug) {
    console.log('[GlobalIntent] Handling form intent:', intent);
  }
  
  // Collect payload from form
  const formData = new FormData(form);
  const payload: IntentPayload = {
    ...collectDataAttributes(form),
  };
  
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      payload[key] = value;
    }
  });
  
  // Add global context
  if (config.businessId) payload.businessId = config.businessId;
  if (config.templateId) payload.templateId = config.templateId;
  
  // Find submit button for feedback
  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]') as HTMLElement;
  
  let clearLoading: (() => void) | null = null;
  if (submitButton && config.showFeedback !== false) {
    clearLoading = showLoading(submitButton);
  }
  
  try {
    const result = await handleIntent(intent, payload);
    
    if (clearLoading) clearLoading();
    
    if (result.success) {
      if (submitButton && config.showFeedback !== false) {
        showSuccess(submitButton);
      }
      // Reset form on success
      form.reset();
      config.onIntentTriggered?.(intent, payload, result.data);
    } else {
      if (submitButton && config.showFeedback !== false) {
        showError(submitButton);
      }
      config.onIntentError?.(intent, result.error || 'Unknown error');
    }
  } catch (error) {
    if (clearLoading) clearLoading();
    if (submitButton && config.showFeedback !== false) {
      showError(submitButton);
    }
    config.onIntentError?.(intent, error instanceof Error ? error.message : 'Unknown error');
  }
}

// ============================================================================
// CSS Injection
// ============================================================================

/**
 * Inject CSS for visual feedback
 */
function injectStyles(doc: Document): void {
  const styleId = 'global-intent-styles';
  if (doc.getElementById(styleId)) return;
  
  const style = doc.createElement('style');
  style.id = styleId;
  style.textContent = `
    .intent-loading {
      opacity: 0.7;
      pointer-events: none;
      position: relative;
    }
    .intent-loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin: -8px 0 0 -8px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: intent-spin 0.6s linear infinite;
    }
    .intent-spinner {
      display: inline-block;
      animation: intent-spin 0.6s linear infinite;
    }
    .intent-success {
      animation: intent-pulse-success 0.3s ease-out;
    }
    .intent-error {
      animation: intent-shake 0.3s ease-out;
    }
    @keyframes intent-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes intent-pulse-success {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    @keyframes intent-shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
  `;
  doc.head.appendChild(style);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Install the global intent listener on a document
 * Can be used on main document or iframe contentDocument
 */
export function installGlobalIntentListener(
  doc: Document = document,
  config: GlobalListenerConfig = {}
): () => void {
  // Store config
  state.config = config;
  
  // Inject styles
  injectStyles(doc);
  
  // Create handlers bound to config
  const clickHandler = (e: MouseEvent) => handleClick(e, config);
  const submitHandler = (e: SubmitEvent) => handleFormSubmit(e, config);
  
  // Add listeners with capture to intercept before other handlers
  doc.addEventListener('click', clickHandler, { capture: true });
  doc.addEventListener('submit', submitHandler as EventListener, { capture: true });
  
  if (config.debug) {
    console.log('[GlobalIntent] Listener installed on document');
  }
  
  state.active = true;
  
  // Return cleanup function
  const cleanup = () => {
    doc.removeEventListener('click', clickHandler, { capture: true });
    doc.removeEventListener('submit', submitHandler as EventListener, { capture: true });
    state.active = false;
    if (config.debug) {
      console.log('[GlobalIntent] Listener removed from document');
    }
  };
  
  state.cleanup = cleanup;
  return cleanup;
}

/**
 * Update listener configuration without reinstalling
 */
export function updateListenerConfig(updates: Partial<GlobalListenerConfig>): void {
  state.config = { ...state.config, ...updates };
}

/**
 * Check if listener is currently active
 */
export function isListenerActive(): boolean {
  return state.active;
}

/**
 * Remove the global listener
 */
export function removeGlobalIntentListener(): void {
  if (state.cleanup) {
    state.cleanup();
    state.cleanup = null;
  }
}

/**
 * Generate script content for injection into iframes/previews
 * This creates a standalone script that can work without imports
 */
export function generateIntentListenerScript(config: GlobalListenerConfig = {}): string {
  return `
<script>
(function() {
  // Intent Listener - Auto-wires buttons to backend
  const CONFIG = ${JSON.stringify(config)};
  
  // Label to intent mapping
  const LABEL_INTENTS = {
    'sign in': 'auth.signin', 'log in': 'auth.signin', 'login': 'auth.signin',
    'sign up': 'auth.signup', 'register': 'auth.signup', 'get started': 'auth.signup', 'create account': 'auth.signup',
    'sign out': 'auth.signout', 'log out': 'auth.signout', 'logout': 'auth.signout',
    'start free trial': 'trial.start', 'start trial': 'trial.start', 'free trial': 'trial.start', 'try free': 'trial.start',
    'join waitlist': 'join.waitlist', 'join the waitlist': 'join.waitlist',
    'subscribe': 'newsletter.subscribe', 'get updates': 'newsletter.subscribe',
    'contact': 'contact.submit', 'contact us': 'contact.submit', 'get in touch': 'contact.submit', 'send message': 'contact.submit',
    'add to cart': 'cart.add', 'buy now': 'checkout.start', 'shop now': 'shop.browse', 'checkout': 'checkout.start', 'view cart': 'cart.view',
    'book now': 'booking.create', 'reserve': 'booking.create', 'reserve table': 'booking.create', 'book service': 'booking.create',
    'get quote': 'quote.request', 'get free quote': 'quote.request', 'request quote': 'quote.request', 'free estimate': 'quote.request',
    'watch demo': 'demo.request', 'request demo': 'demo.request',
    'hire me': 'project.inquire', 'start a project': 'project.start', 'view work': 'portfolio.view',
    'order online': 'order.online', 'order now': 'order.online', 'view menu': 'menu.view',
    'read more': 'content.read', 'call now': 'call.now', 'emergency': 'emergency.service'
  };
  
  function inferIntent(text) {
    if (!text) return null;
    const lower = text.toLowerCase().trim();
    if (LABEL_INTENTS[lower]) return LABEL_INTENTS[lower];
    for (const [key, intent] of Object.entries(LABEL_INTENTS)) {
      if (lower.includes(key) || key.includes(lower)) return intent;
    }
    return null;
  }
  
  function collectPayload(el) {
    const payload = {};
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== 'data-intent' && attr.name !== 'data-ut-intent') {
        const key = attr.name.replace('data-', '').replace(/-([a-z])/g, (_, l) => l.toUpperCase());
        try { payload[key] = JSON.parse(attr.value); } catch { payload[key] = attr.value; }
      }
    });
    const form = el.closest('form');
    if (form) {
      new FormData(form).forEach((v, k) => { if (typeof v === 'string') payload[k] = v; });
    }
    if (CONFIG.businessId) payload.businessId = CONFIG.businessId;
    if (CONFIG.templateId) payload.templateId = CONFIG.templateId;
    return payload;
  }
  
  async function handleIntent(intent, payload) {
    console.log('[Intent] Triggering:', intent, payload);
    
    // Post message to parent window for handling
    window.parent.postMessage({
      type: 'INTENT_TRIGGER',
      intent: intent,
      payload: payload
    }, '*');
    
    return { success: true };
  }
  
  document.addEventListener('click', async function(e) {
    const el = e.target.closest('button, a, [role="button"], [data-ut-intent], [data-intent]');
    if (!el) return;
    
    const intentAttr = el.getAttribute('data-ut-intent') || el.getAttribute('data-intent');
    if (intentAttr === 'none' || intentAttr === 'ignore') return;
    
    let intent = intentAttr || inferIntent(el.textContent || el.getAttribute('aria-label'));
    if (!intent) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    el.classList.add('intent-loading');
    el.disabled = true;
    
    try {
      await handleIntent(intent, collectPayload(el));
      el.classList.remove('intent-loading');
      el.classList.add('intent-success');
      el.disabled = false;
      setTimeout(() => el.classList.remove('intent-success'), 2000);
    } catch (err) {
      el.classList.remove('intent-loading');
      el.classList.add('intent-error');
      el.disabled = false;
      setTimeout(() => el.classList.remove('intent-error'), 2000);
    }
  }, { capture: true });
  
  document.addEventListener('submit', async function(e) {
    const form = e.target;
    if (!form) return;
    
    let intent = form.getAttribute('data-ut-intent') || form.getAttribute('data-intent');
    if (!intent) {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) intent = btn.getAttribute('data-ut-intent') || btn.getAttribute('data-intent') || inferIntent(btn.textContent);
    }
    if (!intent) {
      const id = (form.id || '').toLowerCase();
      const cls = (form.className || '').toLowerCase();
      if (id.includes('contact') || cls.includes('contact')) intent = 'contact.submit';
      else if (id.includes('newsletter') || cls.includes('subscribe')) intent = 'newsletter.subscribe';
      else if (id.includes('waitlist')) intent = 'join.waitlist';
      else if (id.includes('booking') || id.includes('reservation')) intent = 'booking.create';
    }
    
    if (!intent) return;
    
    e.preventDefault();
    
    const payload = {};
    new FormData(form).forEach((v, k) => { if (typeof v === 'string') payload[k] = v; });
    if (CONFIG.businessId) payload.businessId = CONFIG.businessId;
    if (CONFIG.templateId) payload.templateId = CONFIG.templateId;
    
    try {
      await handleIntent(intent, payload);
      form.reset();
    } catch (err) {
      console.error('[Intent] Form error:', err);
    }
  }, { capture: true });
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = \`
    .intent-loading { opacity: 0.7; pointer-events: none; }
    .intent-success { animation: intent-pulse 0.3s; }
    .intent-error { animation: intent-shake 0.3s; }
    @keyframes intent-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes intent-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
  \`;
  document.head.appendChild(style);
  
  console.log('[Intent] Global listener installed');
})();
</script>
`;
}

export default {
  installGlobalIntentListener,
  removeGlobalIntentListener,
  updateListenerConfig,
  isListenerActive,
  generateIntentListenerScript,
};
