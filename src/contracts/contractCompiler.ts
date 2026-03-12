/**
 * Contract Compiler — The missing center of gravity
 * 
 * Sits between SystemsAI and Preview/Builder.
 * 
 * Flow:
 *   BusinessBlueprint → ContractCompiler → Validated SiteBundle pieces
 * 
 * The compiler:
 * 1. Validates the blueprint against capability registry
 * 2. Canonicalizes all intents (rejects non-canonical)
 * 3. Resolves section compositions from registry
 * 4. Generates intent bindings from blueprint + section roles
 * 5. Validates page links and cross-references
 * 6. Outputs a ContractValidation result
 * 
 * RULE: Preview launches ONLY if the contract passes.
 */

import {
  CORE_INTENTS,
  isCoreIntent,
  isNavIntent,
  type CoreIntent,
} from '@/coreIntents';
import { normalizeIntent } from '@/runtime/intentAliases';
import type { BusinessBlueprint, BlueprintPage } from './blueprintSchema';
import {
  CAPABILITY_REGISTRY,
  getAllowedIntents,
  getRequiredTables,
  getRequiredWorkflows,
  type CapabilityId,
  type WorkflowSpec,
} from './capabilityRegistry';
import { getIndustryProfile } from './industryMatrix';
import { getCompositionsByIndustry } from '@/sections/templates';

// ============================================================================
// Validation Types
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  code: string;
  severity: ValidationSeverity;
  message: string;
  path?: string;
  autoFix?: () => void;
}

export interface ContractValidation {
  valid: boolean;
  issues: ValidationIssue[];
  /** Summary counts */
  errors: number;
  warnings: number;
  infos: number;
}

export interface CompiledContract {
  /** Did the contract pass validation? */
  validation: ContractValidation;
  /** Canonical intent list (after normalization) */
  canonicalIntents: CoreIntent[];
  /** Required tables from capabilities */
  requiredTables: string[];
  /** Required workflows from capabilities */
  requiredWorkflows: WorkflowSpec[];
  /** Intent bindings derived from blueprint + section roles */
  intentBindings: CompiledBinding[];
  /** Pages validated and enriched */
  pages: CompiledPage[];
  /** CRM pipeline config */
  crm: { name: string; stages: string[]; defaultStage: string };
  /** Automation pack */
  automationPack: string;
}

export interface CompiledBinding {
  elementRole: string;
  sectionType: string;
  intent: CoreIntent;
  params: Record<string, unknown>;
  source: 'blueprint' | 'capability-default' | 'section-role';
}

export interface CompiledPage {
  title: string;
  path: string;
  purpose: string;
  isHome: boolean;
  sections: string[];
  hasComposition: boolean;
}

// ============================================================================
// Compiler
// ============================================================================

export function compileContract(blueprint: BusinessBlueprint): CompiledContract {
  const issues: ValidationIssue[] = [];

  // ── 1. Validate identity ──────────────────────────────────────────────
  if (!blueprint.identity.businessName?.trim()) {
    issues.push({
      code: 'MISSING_BUSINESS_NAME',
      severity: 'error',
      message: 'Business name is required',
      path: 'identity.businessName',
    });
  }

  const industryProfile = getIndustryProfile(blueprint.identity.industry);
  if (!industryProfile) {
    issues.push({
      code: 'UNKNOWN_INDUSTRY',
      severity: 'error',
      message: `Unknown industry "${blueprint.identity.industry}"`,
      path: 'identity.industry',
    });
  }

  // ── 2. Validate capabilities ──────────────────────────────────────────
  for (const capId of blueprint.capabilities.enabled) {
    if (!CAPABILITY_REGISTRY[capId]) {
      issues.push({
        code: 'UNKNOWN_CAPABILITY',
        severity: 'error',
        message: `Unknown capability "${capId}"`,
        path: `capabilities.enabled`,
      });
    }

    // Check if capability is supported for this industry
    const cap = CAPABILITY_REGISTRY[capId];
    if (cap && !cap.supportedIndustries.includes(blueprint.identity.industry)) {
      issues.push({
        code: 'UNSUPPORTED_CAPABILITY',
        severity: 'warning',
        message: `Capability "${capId}" is not typically used in "${blueprint.identity.industry}" industry`,
        path: `capabilities.enabled`,
      });
    }
  }

  // ── 3. Canonicalize and validate intents ──────────────────────────────
  const allowedIntents = getAllowedIntents(blueprint.capabilities.enabled as CapabilityId[]);
  const canonicalIntents: CoreIntent[] = [];

  for (const intent of blueprint.intents.allowed) {
    const normalized = normalizeIntent(intent);
    if (!isCoreIntent(normalized as string)) {
      issues.push({
        code: 'NON_CANONICAL_INTENT',
        severity: 'error',
        message: `Intent "${intent}" is not a canonical CoreIntent (normalized to "${normalized}")`,
        path: 'intents.allowed',
      });
    } else {
      canonicalIntents.push(normalized as CoreIntent);
    }
  }

  // Check primary CTA is in allowed list
  if (!allowedIntents.includes(blueprint.intents.primaryCta)) {
    issues.push({
      code: 'PRIMARY_CTA_NOT_ALLOWED',
      severity: 'error',
      message: `Primary CTA intent "${blueprint.intents.primaryCta}" is not allowed by enabled capabilities`,
      path: 'intents.primaryCta',
    });
  }

  // ── 4. Validate pages ────────────────────────────────────────────────
  const pagePaths = new Set<string>();
  const compiledPages: CompiledPage[] = [];
  let hasHomePage = false;

  for (const page of blueprint.pages) {
    // Check for duplicate paths
    if (pagePaths.has(page.path)) {
      issues.push({
        code: 'DUPLICATE_PAGE_PATH',
        severity: 'error',
        message: `Duplicate page path: "${page.path}"`,
        path: `pages`,
      });
    }
    pagePaths.add(page.path);

    if (page.isHome || page.path === '/') hasHomePage = true;

    // Check composition availability
    const compositions = industryProfile
      ? getCompositionsByIndustry(industryProfile.industry)
      : [];

    compiledPages.push({
      title: page.title,
      path: page.path,
      purpose: page.purpose,
      isHome: page.isHome || page.path === '/',
      sections: page.expectedSections || [],
      hasComposition: compositions.length > 0,
    });
  }

  if (!hasHomePage) {
    issues.push({
      code: 'MISSING_HOME_PAGE',
      severity: 'error',
      message: 'Blueprint must include a home page (path: "/")',
      path: 'pages',
    });
  }

  // ── 5. Generate intent bindings from section roles ────────────────────
  const intentBindings: CompiledBinding[] = [];

  // Hero primary CTA → blueprint primary intent
  intentBindings.push({
    elementRole: 'hero-primary-cta',
    sectionType: 'hero',
    intent: blueprint.intents.primaryCta,
    params: {},
    source: 'blueprint',
  });

  // Hero secondary CTA → blueprint secondary intent or nav.anchor
  if (blueprint.intents.secondaryCta) {
    intentBindings.push({
      elementRole: 'hero-secondary-cta',
      sectionType: 'hero',
      intent: blueprint.intents.secondaryCta,
      params: {},
      source: 'blueprint',
    });
  }

  // Navbar CTA → primary intent
  intentBindings.push({
    elementRole: 'navbar-cta',
    sectionType: 'navbar',
    intent: blueprint.intents.primaryCta,
    params: {},
    source: 'blueprint',
  });

  // CTA banner → primary intent
  intentBindings.push({
    elementRole: 'cta-banner-primary',
    sectionType: 'cta',
    intent: blueprint.intents.primaryCta,
    params: {},
    source: 'blueprint',
  });

  // Contact section → contact.submit
  if (allowedIntents.includes('contact.submit')) {
    intentBindings.push({
      elementRole: 'contact-form-submit',
      sectionType: 'contact',
      intent: 'contact.submit',
      params: {},
      source: 'capability-default',
    });
  }

  // Newsletter in footer → newsletter.subscribe
  if (allowedIntents.includes('newsletter.subscribe')) {
    intentBindings.push({
      elementRole: 'footer-newsletter',
      sectionType: 'footer',
      intent: 'newsletter.subscribe',
      params: {},
      source: 'capability-default',
    });
  }

  // Service card CTAs → primary intent
  intentBindings.push({
    elementRole: 'service-card-cta',
    sectionType: 'services',
    intent: blueprint.intents.primaryCta,
    params: {},
    source: 'section-role',
  });

  // Pricing tier CTAs → pay.checkout or auth.register
  if (allowedIntents.includes('pay.checkout')) {
    intentBindings.push({
      elementRole: 'pricing-tier-cta',
      sectionType: 'pricing',
      intent: 'pay.checkout',
      params: {},
      source: 'section-role',
    });
  }

  // ── 6. Gather provisioning requirements ───────────────────────────────
  const requiredTables = getRequiredTables(blueprint.capabilities.enabled as CapabilityId[]);
  const requiredWorkflows = getRequiredWorkflows(blueprint.capabilities.enabled as CapabilityId[]);

  // ── 7. Compile result ────────────────────────────────────────────────
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const infos = issues.filter(i => i.severity === 'info').length;

  return {
    validation: {
      valid: errors === 0,
      issues,
      errors,
      warnings,
      infos,
    },
    canonicalIntents: canonicalIntents.length > 0 ? canonicalIntents : allowedIntents,
    requiredTables,
    requiredWorkflows,
    intentBindings,
    pages: compiledPages,
    crm: {
      name: blueprint.crm.pipelineName,
      stages: blueprint.crm.stages,
      defaultStage: blueprint.crm.defaultStage,
    },
    automationPack: blueprint.automationPack,
  };
}

// ============================================================================
// Quick Validation (for linting / CI)
// ============================================================================

/**
 * Validate that a set of intents are all canonical CoreIntents.
 * Returns non-canonical intents (should be empty for valid templates).
 */
export function findNonCanonicalIntents(intents: string[]): string[] {
  return intents.filter(intent => !isCoreIntent(intent));
}

/**
 * Validate that template intents are within the allowed set for a capability profile.
 */
export function validateIntentsAgainstCapabilities(
  intents: string[],
  capabilities: CapabilityId[]
): ValidationIssue[] {
  const allowed = new Set(getAllowedIntents(capabilities).map(String));
  const issues: ValidationIssue[] = [];

  for (const intent of intents) {
    const normalized = normalizeIntent(intent);
    if (!allowed.has(normalized as string) && !isNavIntent(normalized as string)) {
      issues.push({
        code: 'INTENT_NOT_IN_CAPABILITY_SET',
        severity: 'warning',
        message: `Intent "${intent}" (→ "${normalized}") is not covered by capabilities [${capabilities.join(', ')}]`,
      });
    }
  }

  return issues;
}
