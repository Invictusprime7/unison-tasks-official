/**
 * Redirect Label Classifier
 * 
 * Intelligently categorizes button/link labels to determine whether a click
 * should trigger AI page generation or simply route/scroll.
 * 
 * Categories:
 * - nav:      Header/footer navigation links → route to existing page or scroll
 * - redirect: Action buttons implying a new destination → generate page if missing
 * - form:     Form/overlay actions → existing overlay/form flow
 * - external: External links → generate in-place page (no new tabs)
 * - ignore:   UI controls (filters, tabs, toggles) → do nothing
 */

// ============================================================================
// Types
// ============================================================================

export type LabelCategory = 'nav' | 'redirect' | 'form' | 'external' | 'ignore';

export interface ClassificationResult {
  category: LabelCategory;
  /** Confidence 0-1 */
  confidence: number;
  /** Suggested page type if redirect (e.g. "products", "checkout") */
  suggestedPageType?: string;
  /** Why this classification was chosen */
  reason: string;
}

// ============================================================================
// Pattern Definitions
// ============================================================================

/** Navigation labels — route/scroll only, never generate */
const NAV_PATTERNS: { re: RegExp; confidence: number }[] = [
  { re: /^home$/i, confidence: 1 },
  { re: /^about(\s+us)?$/i, confidence: 1 },
  { re: /^contact(\s+us)?$/i, confidence: 0.9 },
  { re: /^faq(s)?$/i, confidence: 1 },
  { re: /^blog$/i, confidence: 0.95 },
  { re: /^services?$/i, confidence: 0.9 },
  { re: /^portfolio$/i, confidence: 0.95 },
  { re: /^pricing$/i, confidence: 0.9 },
  { re: /^testimonials?$/i, confidence: 1 },
  { re: /^features?$/i, confidence: 0.95 },
  { re: /^team$/i, confidence: 1 },
  { re: /^careers?$/i, confidence: 1 },
  { re: /^privacy(\s+policy)?$/i, confidence: 1 },
  { re: /^terms(\s+(of\s+service|&\s+conditions))?$/i, confidence: 1 },
  { re: /^menu$/i, confidence: 0.9 },
  { re: /^gallery$/i, confidence: 0.9 },
  { re: /^our\s+(work|story|mission|team|process)$/i, confidence: 1 },
  { re: /^how\s+it\s+works$/i, confidence: 0.95 },
  { re: /^resources?$/i, confidence: 0.9 },
  { re: /^press$/i, confidence: 1 },
  { re: /^news$/i, confidence: 0.95 },
  { re: /^partners?$/i, confidence: 1 },
  { re: /^integrations?$/i, confidence: 0.95 },
  { re: /^docs?(umentation)?$/i, confidence: 1 },
  { re: /^help(\s+center)?$/i, confidence: 1 },
  { re: /^support$/i, confidence: 0.95 },
  { re: /^locations?$/i, confidence: 1 },
  { re: /^reviews?$/i, confidence: 0.95 },
];

/** Redirect-worthy labels — trigger AI page generation */
const REDIRECT_PATTERNS: { re: RegExp; confidence: number; pageType: string }[] = [
  // Commerce: browsing
  { re: /^(view|see|browse)\s+all$/i, confidence: 0.95, pageType: 'products' },
  { re: /^shop\s+(now|all|collection)$/i, confidence: 0.95, pageType: 'products' },
  { re: /^browse\s+(collection|catalog|products?|items?)$/i, confidence: 0.95, pageType: 'products' },
  { re: /^explore\s+(collection|catalog|products?|more|all)$/i, confidence: 0.9, pageType: 'products' },
  { re: /^(view|see)\s+(collection|catalog|products?|inventory)$/i, confidence: 0.9, pageType: 'products' },
  { re: /^(all|full)\s+(products?|collection|catalog|menu|services?)$/i, confidence: 0.9, pageType: 'products' },
  { re: /^discover\s+(more|all|our)$/i, confidence: 0.85, pageType: 'products' },
  
  // Conversion: checkout/payment
  { re: /^(go\s+to\s+)?checkout$/i, confidence: 1, pageType: 'checkout' },
  { re: /^(proceed\s+to\s+)?checkout$/i, confidence: 1, pageType: 'checkout' },
  { re: /^pay\s+now$/i, confidence: 1, pageType: 'checkout' },
  { re: /^complete\s+(order|purchase)$/i, confidence: 1, pageType: 'checkout' },
  { re: /^place\s+order$/i, confidence: 1, pageType: 'checkout' },
  { re: /^(view|go\s+to)\s+cart$/i, confidence: 0.95, pageType: 'cart' },
  { re: /^(my\s+)?cart$/i, confidence: 0.85, pageType: 'cart' },
  { re: /^buy\s+now$/i, confidence: 0.9, pageType: 'checkout' },
  
  // Content: expansion
  { re: /^learn\s+more$/i, confidence: 0.85, pageType: 'details' },
  { re: /^read\s+more$/i, confidence: 0.85, pageType: 'article' },
  { re: /^see\s+(more\s+)?details$/i, confidence: 0.9, pageType: 'details' },
  { re: /^view\s+details$/i, confidence: 0.9, pageType: 'details' },
  { re: /^(full|more)\s+details$/i, confidence: 0.9, pageType: 'details' },
  { re: /^(view|see)\s+case\s+stud(y|ies)$/i, confidence: 0.9, pageType: 'gallery' },
  { re: /^(view|see)\s+(our\s+)?work$/i, confidence: 0.85, pageType: 'gallery' },
  { re: /^(view|see)\s+project$/i, confidence: 0.85, pageType: 'gallery' },
  { re: /^(view|see)\s+profile$/i, confidence: 0.85, pageType: 'about' },
  
  // Auth-driven pages
  { re: /^(sign\s+up|create\s+account|register)$/i, confidence: 0.9, pageType: 'signup' },
  { re: /^(sign\s+in|log\s*in)$/i, confidence: 0.9, pageType: 'login' },
  { re: /^(my\s+)?account$/i, confidence: 0.85, pageType: 'login' },
  { re: /^(my\s+)?dashboard$/i, confidence: 0.85, pageType: 'login' },
  
  // Generic expansion
  { re: /^get\s+started$/i, confidence: 0.8, pageType: 'signup' },
  { re: /^start\s+(free\s+)?trial$/i, confidence: 0.85, pageType: 'signup' },
  { re: /^join\s+(now|us|waitlist)$/i, confidence: 0.8, pageType: 'signup' },
  { re: /^view\s+plans?$/i, confidence: 0.85, pageType: 'pricing' },
  { re: /^compare\s+plans?$/i, confidence: 0.85, pageType: 'pricing' },
  { re: /^see\s+pricing$/i, confidence: 0.85, pageType: 'pricing' },
];

/** Form/overlay actions — handled by existing intent pipeline */
const FORM_PATTERNS: RegExp[] = [
  /^(book|reserve)\s+(now|a?\s*(table|call|session|appointment|demo))/i,
  /^(get|request)\s+(a?\s*)?(free\s+)?(quote|estimate|consultation)/i,
  /^(subscribe|sign\s+up\s+for)/i,
  /^(send|submit)\s+(message|inquiry|request|form)/i,
  /^(contact|reach)\s+(us|out)/i,
  /^(download|get)\s+(guide|ebook|whitepaper|brochure)/i,
  /^(schedule|set\s+up)\s+(a?\s*)?(call|meeting|consultation|demo)/i,
  /^add\s+to\s+cart$/i,
  /^(notify|alert)\s+(me|when)/i,
];

/** External link patterns */
const EXTERNAL_PATTERNS: RegExp[] = [
  /^(follow|connect)\s+(us\s+)?(on|@)/i,
  /^(visit|open)\s+(our\s+)?(website|site|store|app)/i,
  /^(call|phone|dial)\s+(us|now)/i,
  /^(email|mail)\s+(us|now)/i,
  /^(view\s+on|open\s+in)\s+/i,
];

/** Ignore patterns — UI controls that should never trigger anything */
const IGNORE_PATTERNS: RegExp[] = [
  /^(sort|filter|show|hide|toggle|clear|reset|close|cancel|dismiss|back|next|prev)/i,
  /^(select|choose|pick)\s+(a?\s*)?(size|color|option|variant|quantity)/i,
  /^\d+$/,  // Pure numbers (pagination)
  /^[<>←→↑↓•·×✕✖]/,  // Arrow/bullet/close icons
];

// ============================================================================
// Structural Detection
// ============================================================================

export interface ElementContext {
  /** The element's parent structure */
  parentTag?: string;
  /** Is the element inside a nav/header? */
  isInNav?: boolean;
  /** Is the element inside a footer? */
  isInFooter?: boolean;
  /** data-ut-intent if present */
  utIntent?: string;
  /** data-no-intent if present */
  noIntent?: boolean;
  /** href value if anchor */
  href?: string;
  /** The resolved intent from globalIntentListener */
  resolvedIntent?: string;
}

// ============================================================================
// Classifier
// ============================================================================

/**
 * Classify a button/link label to determine the appropriate action.
 * Uses a priority cascade: explicit intent > structural context > label pattern matching.
 */
export function classifyLabel(
  label: string,
  context?: ElementContext
): ClassificationResult {
  const trimmed = label.trim();
  
  // 0. Explicit overrides
  if (context?.noIntent) {
    return { category: 'ignore', confidence: 1, reason: 'data-no-intent attribute present' };
  }
  
  if (context?.utIntent) {
    // If there's an explicit intent, defer to the intent system
    if (context.utIntent.startsWith('nav.')) {
      return { category: 'nav', confidence: 1, reason: `Explicit nav intent: ${context.utIntent}` };
    }
    if (['contact.submit', 'newsletter.subscribe', 'booking.create', 'quote.request', 'lead.capture'].includes(context.utIntent)) {
      return { category: 'form', confidence: 1, reason: `Explicit form intent: ${context.utIntent}` };
    }
    if (context.utIntent.startsWith('pay.') || context.utIntent === 'cart.checkout') {
      return { category: 'redirect', confidence: 1, suggestedPageType: 'checkout', reason: `Payment intent: ${context.utIntent}` };
    }
  }
  
  // 1. Structural context: nav/header links are always "nav"
  if (context?.isInNav || context?.isInFooter) {
    // Even in nav, some labels still mean "redirect" (e.g., "Shop Now" in header)
    for (const { re, confidence, pageType } of REDIRECT_PATTERNS) {
      if (re.test(trimmed) && confidence >= 0.9) {
        return { category: 'redirect', confidence: confidence * 0.95, suggestedPageType: pageType, reason: `High-confidence redirect label in nav: "${trimmed}"` };
      }
    }
    return { category: 'nav', confidence: 0.9, reason: `Element is inside nav/header/footer` };
  }
  
  // 2. Ignore patterns
  for (const re of IGNORE_PATTERNS) {
    if (re.test(trimmed)) {
      return { category: 'ignore', confidence: 0.95, reason: `Matches ignore pattern` };
    }
  }
  
  // 3. External patterns — treat as redirect (generate in-place, no new tabs)
  for (const re of EXTERNAL_PATTERNS) {
    if (re.test(trimmed)) {
      return { category: 'redirect', confidence: 0.9, suggestedPageType: 'details', reason: `External pattern → in-place redirect` };
    }
  }
  
  // 4. Form patterns (before redirect to avoid "Book Now" triggering redirect)
  for (const re of FORM_PATTERNS) {
    if (re.test(trimmed)) {
      return { category: 'form', confidence: 0.9, reason: `Matches form/overlay pattern` };
    }
  }
  
  // 5. Redirect patterns
  for (const { re, confidence, pageType } of REDIRECT_PATTERNS) {
    if (re.test(trimmed)) {
      return { category: 'redirect', confidence, suggestedPageType: pageType, reason: `Matches redirect pattern: "${trimmed}"` };
    }
  }
  
  // 6. Nav patterns
  for (const { re, confidence } of NAV_PATTERNS) {
    if (re.test(trimmed)) {
      return { category: 'nav', confidence, reason: `Matches nav pattern: "${trimmed}"` };
    }
  }
  
  // 7. Fallback: if href contains an internal .html path, treat as nav
  if (context?.href) {
    const href = context.href;
    if (href.startsWith('#')) return { category: 'nav', confidence: 0.9, reason: 'Anchor link' };
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return { category: 'redirect', confidence: 0.85, suggestedPageType: 'details', reason: 'External URL → in-place redirect' };
    }
    if (href.endsWith('.html') || href.startsWith('/')) {
      return { category: 'nav', confidence: 0.8, reason: 'Internal path link' };
    }
  }
  
  // 8. Default: treat as nav (safe - won't generate unwanted pages)
  return { category: 'nav', confidence: 0.5, reason: `No pattern match, defaulting to nav` };
}

/**
 * Quick check: is this label redirect-worthy?
 */
export function isRedirectWorthy(label: string, context?: ElementContext): boolean {
  const result = classifyLabel(label, context);
  return result.category === 'redirect';
}

/**
 * Get the suggested page type for a redirect-worthy label.
 * Returns null if label is not redirect-worthy.
 */
export function getRedirectPageType(label: string, context?: ElementContext): string | null {
  const result = classifyLabel(label, context);
  return result.category === 'redirect' ? (result.suggestedPageType || 'details') : null;
}
