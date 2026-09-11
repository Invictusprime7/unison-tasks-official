/**
 * Topology → VFS Scaffolder
 *
 * Ensures every page declared in the site topology has a corresponding
 * .tsx file in the VFS. Generates starter React components for missing pages
 * based on their role/type from the topology plan.
 *
 * **Template-driven scaffolding (Phase 1):**
 * When the active site plan carries a `selectedTemplateId` (set by the Wizard
 * Launcher chip selection), sub-pages are scaffolded as **role-filtered subsets
 * of the template's section pool** — not generic spinners. This makes the chip
 * selection the single authority over CSS layouts, navigation structure, and
 * page scaffolding direction.
 */

import type { GeneratedSitePlan, PageRouteNode, PageRole } from '@/platform/core/siteTopologyPlanner';
import { generateCanonicalRouter, generateCanonicalRouterFromPlan } from './topologyRouterGenerator';
import type { PageRegistry } from '@/types/pageRegistry';
import type { SectionEntry, SectionType, TemplateComposition, TemplatePageRole } from '@/sections/types';
import { ALL_COMPOSITIONS, getCompositionById, getCompositionsByIndustry } from '@/sections/templates';
import { compositionToReactCode } from '@/sections/PageRenderer';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import { PreviewPipelineError } from '@/services/previewPipelineError';
import type { WizardDesignIntervention } from '@/services/wizardDesignIntervention';
import type { VariantId } from '@/sections/variants/types';
import { getVariantsForSection } from '@/sections/variants/registry';
import type { SiteConfiguration } from '@/platform/core/resolvedComposition';
import { getIndustryProfile, getIndustryRoleSections, getIndustrySectionVocabulary } from '@/platform/core/industryMatrix';
import type { WizardGenerationBrief, WizardHeroContract } from '@/services/wizardGenerationBrief';

/**
 * Options shared by the scaffolding entry points.
 *
 * Spinner / minimal placeholder scaffolds have been REMOVED from Unison.
 * Every page MUST render from the site/page topology + SiteBundleSnapshot
 * composition (industry template + theme preset). If a topology page has no
 * resolvable composition, the scaffolder throws PreviewPipelineError so the
 * runtime surfaces the drift via PreviewRuntimeError instead of emitting a
 * loading/minimal placeholder.
 *
 * `strictWizardComposition` is retained for callsite compatibility but is now
 * effectively always-on — there is no legacy spinner path to opt out to.
 */
export interface ScaffoldOptions {
  /** @deprecated Strict composition is now the only supported mode. */
  strictWizardComposition?: boolean;
  /** Canonical, opt-in visual recipes projected into generated page modules. */
  designIntervention?: Pick<WizardDesignIntervention, 'motionRecipes' | 'sectionVariants' | 'activeVariants'> & Partial<Pick<WizardDesignIntervention, 'industry' | 'themePresetId' | 'layoutRecipe' | 'interactionRecipes' | 'seed'>>;
  siteConfiguration?: SiteConfiguration;
  generationBrief?: WizardGenerationBrief;
}


// ============================================================================
// Default per-role section pool — used when a template doesn't define its own.
// Keeps every chip-selected industry getting consistent sub-page structure.
// ============================================================================

const DEFAULT_ROLE_SECTION_POOL: Record<PageRole, SectionType[]> = {
  home:      ['navbar', 'hero', 'services', 'features', 'testimonials', 'cta', 'footer'],
  services:  ['navbar', 'hero', 'services', 'features', 'pricing', 'testimonials', 'cta', 'footer'],
  pricing:   ['navbar', 'hero', 'pricing', 'services', 'faq', 'testimonials', 'cta', 'footer'],
  about:     ['navbar', 'hero', 'about', 'team', 'stats', 'testimonials', 'cta', 'footer'],
  contact:   ['navbar', 'hero', 'contact', 'faq', 'testimonials', 'cta', 'footer'],
  gallery:   ['navbar', 'hero', 'gallery', 'testimonials', 'cta', 'footer'],
  faq:       ['navbar', 'hero', 'faq', 'services', 'testimonials', 'cta', 'footer'],
  booking:   ['navbar', 'hero', 'services', 'testimonials', 'contact', 'cta', 'footer'],
  shop:      ['navbar', 'hero', 'services', 'gallery', 'testimonials', 'cta', 'footer'],
  checkout:  ['navbar', 'hero', 'services', 'contact', 'faq', 'cta', 'footer'],
  thank_you: ['navbar', 'hero', 'stats', 'testimonials', 'cta', 'footer'],
  blog:      ['navbar', 'hero', 'blog-preview', 'testimonials', 'cta', 'footer'],
  custom:    ['navbar', 'hero', 'services', 'testimonials', 'faq', 'cta', 'footer'],
};

const MINIMUM_ROUTE_BODY_SECTIONS = 4;

const ROLE_SUPPLEMENT_PRIORITY: Record<PageRole, SectionType[]> = {
  home: ['services', 'features', 'testimonials', 'cta'],
  services: ['features', 'pricing', 'testimonials', 'faq', 'cta'],
  pricing: ['services', 'faq', 'testimonials', 'cta'],
  about: ['team', 'stats', 'testimonials', 'cta'],
  contact: ['faq', 'testimonials', 'services', 'cta'],
  gallery: ['testimonials', 'services', 'cta', 'faq'],
  faq: ['services', 'testimonials', 'cta', 'contact'],
  booking: ['services', 'testimonials', 'contact', 'cta'],
  shop: ['services', 'gallery', 'testimonials', 'cta'],
  checkout: ['services', 'contact', 'faq', 'cta'],
  thank_you: ['stats', 'testimonials', 'cta', 'services'],
  blog: ['blog-preview', 'testimonials', 'services', 'cta'],
  custom: ['services', 'testimonials', 'faq', 'cta'],
};

// ============================================================================
// Template resolution — chip → composition
// ============================================================================

/**
 * Resolve which TemplateComposition drives this site plan.
 * Priority: explicit selectedTemplateId → industry-matched composition → null.
 */
/**
 * Explicit composition aliases for shipped industries that do not yet own a
 * first-class composition file. This is a *declared* mapping, reviewable in one
 * place — it replaces the old silent fallback ladder (industry → first layout
 * category → first system type → fuzzy lexical scan) which let an industry
 * inherit an unrelated industry's entire site without anyone noticing.
 */
const INDUSTRY_COMPOSITION_ALIAS: Record<string, string> = {
  contractor: 'local-service',
  'local-service': 'local-service',
  'real-estate': 'agency',
  portfolio: 'photography',
  fitness: 'coaching',
  photography: 'portfolio',
};

function resolveActiveTemplate(plan: GeneratedSitePlan): TemplateComposition | null {
  // The plan carries selectedTemplateId via planSiteTopology options (see planner).
  const selectedId = (plan as GeneratedSitePlan & { selectedTemplateId?: string }).selectedTemplateId;
  if (selectedId) {
    const direct = getCompositionById(selectedId);
    if (direct) return direct;
  }

  const byIndustry = getCompositionsByIndustry(plan.industry);
  if (byIndustry.length > 0) return byIndustry[0];

  const aliased = INDUSTRY_COMPOSITION_ALIAS[plan.industry];
  if (aliased) {
    const byAlias = getCompositionsByIndustry(aliased);
    if (byAlias.length > 0) return byAlias[0];
  }

  // No registered composition. Returning another industry's template here is
  // what produced look-alike sites; the caller raises a named failure instead.
  return null;
}


function applyPlanThemeToTemplate(
  template: TemplateComposition | null,
  plan: GeneratedSitePlan,
): TemplateComposition | null {
  if (!template) return null;
  const presetId = (plan as GeneratedSitePlan & { selectedThemePresetId?: string }).selectedThemePresetId;
  if (!presetId) return template;
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return template;
  return {
    ...template,
    theme: themePresetToThemeTokens(preset),
  };
}

// ============================================================================
// Wizard-seed → composition brand/content injection
//
// The WizardSeed (persisted at `/.unison/wizard-seed.json`) is the durable
// record of every wizard selection (business name, industry, tagline, social
// links, intents). Template compositions ship with neutral sample copy —
// without this overlay, sub-pages render generic "Brand" / "Welcome" content
// even though the seed file is present in the VFS. This helper threads seed
// values into a TemplateComposition immediately before it is split into per-
// section files, so every page hash route reflects the wizard selections.
//
// Substitution rules (conservative — never clobber rich AI/user content):
//   • navbar/footer `brand`              → always overwritten with seed.business.name
//   • hero `headline` (empty/placeholder)→ filled from seed.business.tagline
//   • hero `subheadline` (empty)         → filled from seed.business.tagline
//   • contact email / phone (empty)      → filled from seed.socials
//   • footer copyright (empty)           → filled with `© <year> <brand>`
//   • any string field containing the literal `{{businessName}}` is replaced
// ============================================================================

const BRAND_PLACEHOLDER_RE = /\{\{\s*businessName\s*\}\}/gi;
const TEMPLATE_BRAND_LITERALS = new Set([
  'Brand', 'BRAND', 'Your Brand', 'Your Business', 'Acme', 'Acme Inc.',
  'Company', 'Your Company', 'Lorem', 'Lorem Ipsum',
]);

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

function looksLikePlaceholder(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0) return true;
  return TEMPLATE_BRAND_LITERALS.has(trimmed);
}

function substituteBrandTokens<T>(value: T, brand: string): T {
  if (typeof value === 'string') {
    return value.replace(BRAND_PLACEHOLDER_RE, brand) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => substituteBrandTokens(item, brand)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = substituteBrandTokens(v, brand);
    }
    return out as T;
  }
  return value;
}

function collectTemplateBrandLiterals(composition: TemplateComposition): string[] {
  return [...new Set(composition.sections.flatMap((section) => {
    if (section.type !== 'navbar' && section.type !== 'footer') return [];
    const value = (section.props as Record<string, unknown> | undefined)?.brand;
    return typeof value === 'string' && value.trim() ? [value.trim()] : [];
  }))];
}

function replaceTemplateBrandLiterals<T>(value: T, templateBrands: readonly string[], brand: string): T {
  if (typeof value === 'string') {
    return templateBrands.reduce(
      (result, templateBrand) => result.split(templateBrand).join(brand),
      value,
    ) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => replaceTemplateBrandLiterals(item, templateBrands, brand)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      out[key] = replaceTemplateBrandLiterals(nestedValue, templateBrands, brand);
    }
    return out as T;
  }
  return value;
}

interface NormalizedSeed {
  brand?: string;
  tagline?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  socials?: Array<{ platform?: string; href?: string }>;
}

function normalizeWizardSeed(seed: Record<string, unknown> | undefined): NormalizedSeed {
  if (!seed || typeof seed !== 'object') return {};
  const business = (seed.business as Record<string, unknown> | undefined) || {};
  const generation = (seed.generation as Record<string, unknown> | undefined) || {};
  const topLevelSocials = Array.isArray(seed.socials) ? seed.socials : [];
  const legacySocials = Array.isArray(generation.socials) ? generation.socials : [];
  const socials = (topLevelSocials.length > 0 ? topLevelSocials : legacySocials) as Array<{
    platform?: string;
    href?: string;
    email?: string;
    phone?: string;
  }>;
  const findSocial = (kind: string) =>
    socials.find((s) => String(s?.platform || '').toLowerCase() === kind)?.href;
  return {
    brand: typeof business.name === 'string' ? business.name : undefined,
    tagline: typeof business.tagline === 'string' ? business.tagline : undefined,
    industry: typeof business.industry === 'string' ? business.industry : undefined,
    email: findSocial('email') || (socials.find((s) => s.email)?.email as string | undefined),
    phone: findSocial('phone') || (socials.find((s) => s.phone)?.phone as string | undefined),
    address: findSocial('address'),
    socials,
  };
}

function applyWizardSeedToComposition(
  composition: TemplateComposition,
  plan: GeneratedSitePlan,
): TemplateComposition {
  const seed = normalizeWizardSeed(
    (plan as GeneratedSitePlan & { wizardSeed?: Record<string, unknown> }).wizardSeed,
  );
  const brand = seed.brand?.trim() || plan.businessName.trim();
  if (!brand && !seed.tagline && !seed.email && !seed.phone) return composition;

  // Template brand copy is sample data. Replace it across the full composition
  // before deriving route-specific pages so Wizard identity remains canonical.
  const templateBrands = collectTemplateBrandLiterals(composition);
  let nextSections = brand
    ? composition.sections.map((section) => replaceTemplateBrandLiterals(
        substituteBrandTokens(section, brand),
        templateBrands,
        brand,
      ))
    : composition.sections.slice();

  // 2. Per-section structural overrides for brand-critical fields.
  nextSections = nextSections.map((section) => {
    const props = { ...(section.props as Record<string, unknown> | undefined) } as Record<string, unknown>;
    switch (section.type) {
      case 'navbar':
      case 'footer': {
        if (brand) props.brand = brand;
        if (section.type === 'footer') {
          if (isBlank(props.copyright) && brand) {
            props.copyright = `© ${new Date().getFullYear()} ${brand}. All rights reserved.`;
          }
          if (isBlank(props.tagline) && seed.tagline) {
            props.tagline = seed.tagline;
          }
          // Merge wizard-seed socials into footer.socials so that the runtime
          // Footer renders lucide icons even when the composition step was
          // bypassed. Seed uses `href`; Footer runtime uses `url`.
          if (Array.isArray(seed.socials) && seed.socials.length > 0) {
            const byPlatform = new Map<string, { platform: string; url: string }>();
            for (const s of seed.socials) {
              const p = String(s?.platform || '').toLowerCase();
              if (!p) continue;
              const url = s.href || (s as { url?: string }).url;
              if (!url) continue;
              byPlatform.set(p, { platform: p, url });
            }
            props.socials = Array.from(byPlatform.values());
          }
        }
        break;
      }
      case 'hero': {
        if (looksLikePlaceholder(props.headline) && seed.tagline) {
          props.headline = seed.tagline;
        }
        if (isBlank(props.subheadline) && seed.tagline) {
          props.subheadline = seed.tagline;
        }
        break;
      }
      case 'contact': {
        if (isBlank(props.email) && seed.email) props.email = seed.email;
        if (isBlank(props.phone) && seed.phone) props.phone = seed.phone;
        if (isBlank(props.address) && seed.address) props.address = seed.address;
        if (isBlank(props.headline) && brand) {
          props.headline = `Contact ${brand}`;
        }
        break;
      }
      default:
        break;
    }
    return { ...section, props } as SectionEntry;
  });

  return { ...composition, name: brand || composition.name, sections: nextSections };
}


/**
 * Build a synthetic sub-composition for a given page role by filtering the
 * template's source sections through the per-role pool.
 *
 * **Authority rule (Execution Hierarchy):** SiteBundle / template composition
 * owns section *presence* and *count*. The role pool is used **only as a filter
 * set** — we iterate every section in `template.sections` in source order and
 * keep it if its type is allowed for this role. This preserves repeated
 * sections (e.g. multiple feature-card grids, product collections, gallery
 * tiles) and their full `items` / `cards` / `products` / `layout` payloads.
 *
 * Previously this function used a `Map<SectionType, SectionEntry>` with
 * "first match wins", collapsing every duplicate into a single section and
 * producing sparse skeleton pages regardless of bundle richness. Do not
 * reintroduce that pattern.
 *
 * Returns null if no usable sections can be assembled (caller falls back to spinner).
 */
function buildRoleComposition(
  template: TemplateComposition,
  role: PageRole,
  page: PageRouteNode,
  plan: GeneratedSitePlan,
  options?: ScaffoldOptions,
): TemplateComposition | null {
  const routeBrief = options?.generationBrief?.routes.find((route) => route.path === page.filePath);
  const configuredOrder = options?.siteConfiguration?.pages.find((configured) => configured.path === page.route)?.sections
    ?? page.expectedSections
    ?? [];

  if (page.isHome || role === 'home') {
    // Home gets the same media chain as interior pages: it can borrow imagery
    // from its own sibling sections before falling back to the industry pool.
    const homeAlternateMedia = collectAlternateHeroMedia(template)[0];
    const sections = template.sections.map((section) => {
      if (section.type !== 'hero' || !routeBrief) return section;
      const props = { ...(section.props as Record<string, unknown>) };
      applyRouteHeroContract(props, routeBrief.hero.geometry, page, plan, homeAlternateMedia);
      return { ...section, props: props as SectionEntry['props'] };
    });
    if (configuredOrder.length > 0) sortByConfiguredOrder(sections, configuredOrder);
    return sections.length > 0 ? { ...template, sections } : null;
  }

  const definition = template.pageCompositions?.[role as TemplatePageRole];
  let selectedAlternative: import('@/sections/types').TemplatePageAlternative | undefined;
  if (definition) {
    const alternatives = definition.alternatives.filter(alternative =>
      !alternative.themePresetIds || alternative.themePresetIds.includes(plan.selectedThemePresetId || ''));
    if (!alternatives.length) throw new PreviewPipelineError('vfs', `No eligible ${role} composition for ${template.id}.`);
    const seed = options?.designIntervention?.seed || 'default';
    selectedAlternative = alternatives[stableStringHash(`${template.id}:${role}:${plan.selectedThemePresetId || ''}:${seed}`) % alternatives.length];
    const inventorySections = [...template.sections, ...definition.sections];
    const inventory = new Map(inventorySections.map(section => [section.id, section]));
    if (inventory.size !== inventorySections.length || new Set(definition.alternatives.map(alternative => alternative.id)).size !== definition.alternatives.length) {
      throw new PreviewPipelineError('vfs', `Duplicate composition identity in ${template.id}/${role}.`);
    }
    if (selectedAlternative.heroVariantId && !getVariantsForSection('hero').some(variant => variant.id === selectedAlternative!.heroVariantId)) {
      throw new PreviewPipelineError('vfs', `Unknown hero variant in ${selectedAlternative.id}.`);
    }
    const sections = selectedAlternative.sectionIds.map(sectionId => {
      const section = inventory.get(sectionId);
      if (!section) throw new PreviewPipelineError('vfs', `Unknown section ${sectionId} in ${selectedAlternative!.id}.`);
      return section;
    });
    if (!sections.length || new Set(selectedAlternative.sectionIds).size !== sections.length) {
      throw new PreviewPipelineError('vfs', `Invalid ordered sections in ${selectedAlternative.id}.`);
    }
    if ((role === 'pricing' || role === 'faq') && !sections.some(section => section.type === role)) {
      throw new PreviewPipelineError('vfs', `Missing ${role} section in ${selectedAlternative.id}.`);
    }
    template = applyWizardSeedToComposition({ ...template, sections }, plan);
  }

  // --------------------------------------------------------------------
  // Section selection authority (industry contract first)
  //
  // The page's declared section contract — SiteConfiguration, else the page's
  // own expectedSections, else the industry matrix's contract for this role —
  // decides *which* sections appear and *in what order*. The role-generic pool
  // is only the last resort. Previously the contract was used solely to SORT a
  // wholesale copy of Home's sections, which is what produced clone pages and
  // repeated galleries.
  // --------------------------------------------------------------------
  const industryKey =
    options?.siteConfiguration?.industry
    || options?.designIntervention?.industry
    || '';
  const industryRoleSections = industryKey ? getIndustryRoleSections(industryKey, role) : [];
  const industryVocabulary = industryKey ? getIndustrySectionVocabulary(industryKey) : [];
  const declaredSections: SectionType[] = (
    configuredOrder.length > 0 ? configuredOrder : industryRoleSections
  ) as SectionType[];

  // An explicit template `sectionPool` is an authored authority: it is applied
  // as a verbatim filter over the template sections (repeats preserved).
  const explicitPool = template.sectionPool?.[role as TemplatePageRole];
  const poolList: SectionType[] =
    explicitPool ??
    (declaredSections.length > 0
      ? declaredSections
      : (industryVocabulary.length > 0
        ? industryVocabulary as SectionType[]
        : DEFAULT_ROLE_SECTION_POOL[role] ?? DEFAULT_ROLE_SECTION_POOL.custom));
  const allowedTypes = new Set<SectionType>(poolList);
  const alternateMedia = !page.isHome ? collectAlternateHeroMedia(template) : [];
  const alternateHeroMedia = alternateMedia[stableStringHash(page.id) % Math.max(1, alternateMedia.length)];

  /** Source sections grouped by type, in template order. */
  const sourcesByType = new Map<SectionType, SectionEntry[]>();
  for (const source of template.sections) {
    const bucket = sourcesByType.get(source.type);
    if (bucket) bucket.push(source);
    else sourcesByType.set(source.type, [source]);
  }

  const filtered: SectionEntry[] = [];
  const typeCounters = new Map<SectionType, number>();
  const selectedSourceIds = new Set<string>();
  const appendSection = (source: SectionEntry) => {
    const idx = typeCounters.get(source.type) ?? 0;
    typeCounters.set(source.type, idx + 1);
    const props = { ...(source.props as Record<string, unknown>) };
    const routeHeroVariant = source.type === 'hero'
      ? resolveRouteHeroVariant(role, page, selectedAlternative?.heroVariantId, options?.designIntervention?.seed)
      : undefined;
    if (source.type === 'hero' && !page.isHome) {
      // Interior pages are NOT re-skins of Home. Copy is written for the
      // route's own purpose, and the hero presentation is resolved from the
      // route's own contract rather than inherited from the home template.
      const copy = routeHeroCopy(role, page, plan, template);
      props.headline = copy.headline;
      props.subheadline = copy.subheadline;
      props.badge = copy.badge;
      if (alternateHeroMedia) {
        if (typeof props.image === 'string') props.image = alternateHeroMedia;
        else props.backgroundImage = alternateHeroMedia;
      }
    }
    if (source.type === 'hero') {
      const contract = page.isHome
        ? routeBrief?.hero.geometry
        : routeBrief?.hero.geometry ?? deriveRouteHeroContract(role, page, plan);
      if (contract) applyRouteHeroContract(props, contract, page, plan, alternateHeroMedia);
    }

    filtered.push({
      ...source,
      id: definition ? `${page.id}-${source.id}` : `${page.id}-${source.type}-${idx}`,
      sourceSectionId: source.sourceSectionId || source.id,
      ...(routeHeroVariant ? { variantId: routeHeroVariant } : {}),
      props: props as SectionEntry['props'],
    });
    selectedSourceIds.add(source.id);
  };

  if (definition) {
    for (const source of template.sections) appendSection(source);
  } else if (explicitPool) {
    // Authored pool: verbatim filter, repeats preserved.
    for (const source of template.sections) {
      if (allowedTypes.has(source.type)) appendSection(source);
    }
  } else if (declaredSections.length > 0) {
    // One emitted section per declared entry, in declared order. Repeated types
    // rotate through the available source instances (page-seeded) so a page
    // never renders the same instance twice, and adjacent repeats are dropped.
    const usedByType = new Map<SectionType, number>();
    for (const type of declaredSections) {
      const sources = sourcesByType.get(type);
      if (!sources || sources.length === 0) continue;
      const used = usedByType.get(type) ?? 0;
      if (used > 0 && filtered[filtered.length - 1]?.type === type) continue;
      if (used >= sources.length) continue;
      const offset = stableStringHash(`${page.id}:${type}`);
      appendSection(sources[(offset + used) % sources.length]);
      usedByType.set(type, used + 1);
    }
  } else {
    for (const source of template.sections) {
      if (!allowedTypes.has(source.type)) continue;
      if ((typeCounters.get(source.type) ?? 0) > 0) continue; // never duplicate a type implicitly
      appendSection(source);
    }
  }

  if (configuredOrder.length > 0) {
    sortByConfiguredOrder(filtered, configuredOrder);
  }

  const requestedBodyFloor = Math.max(
    MINIMUM_ROUTE_BODY_SECTIONS,
    routeBrief?.depth.minSections ?? MINIMUM_ROUTE_BODY_SECTIONS,
  );
  const bodySectionCount = () => filtered.filter((section) => (
    section.type !== 'navbar' && section.type !== 'footer' && section.type !== 'hero'
  )).length;
  const needsSupplementation = routeBrief
    ? bodySectionCount() < requestedBodyFloor
    : filtered.length < MINIMUM_ROUTE_BODY_SECTIONS;
  if (!definition && !page.isHome && needsSupplementation) {
    // Supplement with section TYPES the page doesn't have yet, drawn from the
    // industry's own vocabulary first. Never re-add an existing type — that is
    // exactly what produced gallery + gallery + gallery.
    const presentTypes = new Set(filtered.map((section) => section.type));
    const priority: SectionType[] = [
      ...(industryVocabulary as SectionType[]),
      ...(ROLE_SUPPLEMENT_PRIORITY[role] || ROLE_SUPPLEMENT_PRIORITY.custom),
    ];
    const candidates = template.sections
      .map((section, index) => ({ section, index, priority: priority.indexOf(section.type) }))
      .filter(({ section }) => (
        section.type !== 'navbar' && section.type !== 'footer' && section.type !== 'hero'
        && !selectedSourceIds.has(section.id)
        && !presentTypes.has(section.type)
      ))
      .sort((left, right) => {
        const leftPriority = left.priority === -1 ? Number.MAX_SAFE_INTEGER : left.priority;
        const rightPriority = right.priority === -1 ? Number.MAX_SAFE_INTEGER : right.priority;
        return leftPriority - rightPriority || left.index - right.index;
      });
    for (const { section } of candidates) {
      appendSection(section);
      presentTypes.add(section.type);
      if (routeBrief
        ? bodySectionCount() >= requestedBodyFloor
        : filtered.length >= MINIMUM_ROUTE_BODY_SECTIONS) break;
    }
  }

  if (filtered.length === 0) return null;

  return {
    ...template,
    id: `${template.id}--${role}`,
    name: `${template.name} · ${page.title}`,
    compositionAlternativeId: selectedAlternative?.id,
    sections: filtered,
  };
}

/**
 * Hero provisioning per page (M4).
 *
 * Home keeps the template/pack statement hero. Interior pages resolve a hero
 * variant from the set declared for their page role, seeded by the page id so
 * two interior pages of the same site don't lead with the same hero. When a
 * template alternative pins a hero variant, that pin always wins.
 */
function resolveRouteHeroVariant(
  role: PageRole,
  page: PageRouteNode,
  pinnedVariantId: string | undefined,
  seed: string | undefined,
): VariantId | undefined {
  const heroVariants = getVariantsForSection('hero');
  if (pinnedVariantId) {
    return heroVariants.some((variant) => variant.id === pinnedVariantId)
      ? (pinnedVariantId as VariantId)
      : undefined;
  }
  if (page.isHome || role === 'home') return undefined;
  const roleVariants = heroVariants.filter((variant) =>
    variant.pageRoles?.includes(role as TemplatePageRole));
  const candidates = roleVariants.length > 0 ? roleVariants : heroVariants;
  if (candidates.length === 0) return undefined;
  return candidates[stableStringHash(`${seed ?? ''}:${page.id}:hero`) % candidates.length].id;
}

function sortByConfiguredOrder(sections: SectionEntry[], configuredOrder: readonly string[]): void {
  const order = new Map(configuredOrder.map((type, index) => [type, index]));
  sections.sort((left, right) => {
    const leftChrome = left.type === 'navbar' ? -2 : left.type === 'hero' ? -1 : left.type === 'footer' ? 10_000 : undefined;
    const rightChrome = right.type === 'navbar' ? -2 : right.type === 'hero' ? -1 : right.type === 'footer' ? 10_000 : undefined;
    const leftIndex = leftChrome ?? order.get(left.type) ?? 5_000;
    const rightIndex = rightChrome ?? order.get(right.type) ?? 5_000;
    return leftIndex - rightIndex;
  });
}

/**
 * The fifth hero part — media OR a three-signal proof strip — is what the
 * visual acceptance gate rejects a page for. It used to be resolved
 * opportunistically (only if the template happened to ship an image), which
 * meant an industry template without photography produced an INCOMPLETE_HERO
 * on every single route. Media is now resolved through a fixed chain and
 * text-only archetypes always emit the proof strip their own contract
 * promises, so the part is guaranteed rather than hoped for.
 */
function resolveHeroProofSignals(
  page: PageRouteNode,
  plan: GeneratedSitePlan,
): Array<{ value: string; label: string }> {
  const profile = getIndustryProfile(plan.industry);
  const industryName = profile?.name || plan.industry.replace(/[-_]/g, ' ');
  const pool: Array<{ value: string; label: string }> = [
    { value: 'Same day', label: 'Response time' },
    { value: 'Local', label: 'Serving your area' },
    { value: 'Mon–Sat', label: 'Open hours' },
    { value: 'Licensed', label: 'Qualified team' },
    { value: '5-star', label: 'Client rated' },
    { value: industryName, label: 'Specialists' },
  ];
  const offset = stableStringHash(`${plan.siteId}:${page.id}:proof`) % pool.length;
  return [0, 1, 2].map((index) => pool[(offset + index) % pool.length]);
}

/** Deterministic hero imagery pool drawn from the industry's own compositions. */
function industryHeroMediaPool(plan: GeneratedSitePlan): string[] {
  const media = new Set<string>();
  for (const composition of getCompositionsByIndustry(plan.industry)) {
    for (const section of composition.sections) {
      const props = section.props as Record<string, unknown>;
      for (const key of ['image', 'backgroundImage']) {
        const value = props[key];
        if (typeof value === 'string' && value.trim()) media.add(value);
      }
    }
  }
  return [...media];
}

function applyRouteHeroContract(
  props: Record<string, unknown>,
  contract: WizardHeroContract,
  page: PageRouteNode,
  plan: GeneratedSitePlan,
  alternateHeroMedia?: string,
): void {
  const executableLayout = contract.layout === 'anchored'
    ? 'split'
    : contract.layout === 'intro'
      ? 'page-title'
      : contract.layout;
  props.layout = executableLayout;
  props.badge = typeof props.badge === 'string' && props.badge.trim() ? props.badge : page.title;
  // Never overwrite route-authored copy with the page title — that rewrite is
  // what made every interior hero read like a renamed Home hero.
  props.headline = typeof props.headline === 'string' && props.headline.trim() && !page.isHome
    ? props.headline
    : page.isHome ? props.headline : page.title;
  props.subheadline = typeof props.subheadline === 'string' && props.subheadline.trim()
    ? props.subheadline
    : `Discover ${page.title.toLowerCase()} from ${plan.businessName}.`;
  const roleCtas = ROLE_HERO_CTAS[page.role as PageRole] ?? ROLE_HERO_CTAS.custom;
  const ctas = Array.isArray(props.ctas) ? [...props.ctas] as Array<Record<string, unknown>> : [];
  if (ctas.length === 0) ctas.push({ ...roleCtas[0] });
  if (!ctas[0].intent) ctas[0] = { ...ctas[0], intent: roleCtas[0].intent };
  if (ctas.length < 2) ctas.push({ ...roleCtas[1] });
  if (!ctas[1].intent) ctas[1] = { ...ctas[1], intent: roleCtas[1].intent };
  props.ctas = ctas.slice(0, 2);


  if (contract.mediaTreatment === 'text-only') {
    // The utility/intro archetype declares an inline proof strip of three
    // signals in place of a photograph. Emit it — an intro hero with no proof
    // is the unfinished opening screen the gate exists to catch.
    const existing = Array.isArray(props.stats) ? props.stats as Array<Record<string, unknown>> : [];
    props.stats = existing.length >= 3 ? existing.slice(0, 3) : resolveHeroProofSignals(page, plan);
  } else {
    const pool = industryHeroMediaPool(plan);
    const media = (typeof props.image === 'string' && props.image)
      || (typeof props.backgroundImage === 'string' && props.backgroundImage)
      || alternateHeroMedia
      || (pool.length > 0 ? pool[stableStringHash(`${plan.siteId}:${page.id}:hero-media`) % pool.length] : undefined);
    if (media) {
      if (executableLayout === 'full-bleed') props.backgroundImage = media;
      else props.image = media;
      delete props.stats;
    } else {
      // No imagery exists anywhere in this industry's compositions. Rather than
      // ship a four-part hero the gate will reject page by page, fall back to
      // the same proof strip the intro archetype uses.
      const existing = Array.isArray(props.stats) ? props.stats as Array<Record<string, unknown>> : [];
      props.stats = existing.length >= 3 ? existing.slice(0, 3) : resolveHeroProofSignals(page, plan);
    }
  }

  props.mediaFocal = contract.mediaFocal;
  props.heroArchetype = contract.archetype;

  const hasMedia = Boolean(
    (typeof props.image === 'string' && props.image.trim())
    || (typeof props.backgroundImage === 'string' && props.backgroundImage.trim()),
  );
  const hasProof = Array.isArray(props.stats) && props.stats.length >= 3;
  if (!hasMedia && !hasProof) {
    throw new PreviewPipelineError(
      'vfs',
      `Hero for ${page.filePath || page.route} resolved neither media nor a three-signal proof strip.`,
      { blockedFiles: [page.filePath || page.route], recoverableByRelaunch: true },
    );
  }
}

function stableStringHash(value: string): number {
  let hash = 0;
  for (const character of value) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function collectAlternateHeroMedia(template: TemplateComposition): string[] {
  const media = new Set<string>();
  for (const section of template.sections) {
    if (section.type === 'hero') continue;
    const props = section.props as Record<string, unknown>;
    for (const key of ['image', 'backgroundImage']) {
      if (typeof props[key] === 'string' && props[key]) media.add(props[key]);
    }
    if (Array.isArray(props.items)) {
      for (const item of props.items) {
        if (item && typeof item === 'object' && typeof (item as Record<string, unknown>).image === 'string') {
          media.add((item as Record<string, string>).image);
        }
      }
    }
  }
  return [...media];
}


// ============================================================================
// Core: Scaffold missing pages from topology
// ============================================================================

/**
 * Given a site plan and existing VFS files, returns a map of files that
 * need to be created to satisfy the topology.
 *
 * When `template` is provided (or resolvable from the plan), missing pages
 * are scaffolded as role-filtered slices of the template's composition via
 * `buildRoleComposition` + `compositionToReactCode`, so sub-pages added
 * post-wizard inherit the same section vocabulary and styling as the seed
 * `/src/App.tsx`. Without a usable composition, this throws; wizard previews
 * must never render spinner/minimal placeholders that mask a broken SiteBundle.
 */
export function scaffoldMissingTopologyPages(
  plan: GeneratedSitePlan,
  existingFiles: Record<string, string>,
  template?: TemplateComposition | null,
  options?: ScaffoldOptions,
): Record<string, string> {
  const out: Record<string, string> = {};
  const activeTemplate = applyPlanThemeToTemplate(template ?? resolveActiveTemplate(plan), plan);
  const missing = getMissingTopologyPages(plan, existingFiles);

  const blocked: string[] = [];
  for (const page of missing) {
    const compositional = tryComposeTopologyPageFiles(page, plan, activeTemplate, options);
    if (compositional) {
      Object.assign(out, compositional);
      continue;
    }
    blocked.push(page.filePath);
  }

  if (blocked.length > 0) {
    throw new PreviewPipelineError(
      'vfs',
      `SiteBundleSnapshot has no composition for ${blocked.length} wizard page(s); refusing to emit minimal scaffold.`,
      { blockedFiles: blocked, recoverableByRelaunch: true },
    );
  }

  return out;
}


/**
 * Scaffold missing pages AND regenerate the canonical router (App.tsx).
 * This is the preferred entry point — it guarantees every scaffolded
 * page is also routable in the preview.
 */
export function scaffoldMissingTopologyPagesWithRouter(
  plan: GeneratedSitePlan,
  existingFiles: Record<string, string>,
  registry: PageRegistry,
  template?: TemplateComposition | null,
  options?: ScaffoldOptions,
): Record<string, string> {
  const newFiles = scaffoldMissingTopologyPages(plan, existingFiles, template, options);

  const registryPages = Object.values(registry.pages);
  const routerCode = registryPages.length > 0
    ? generateCanonicalRouter(registry, plan.businessName)
    : generateCanonicalRouterFromPlan(plan);

  if (routerCode) {
    newFiles['/src/App.tsx'] = routerCode;
  }

  return newFiles;
}

/**
 * Check which topology pages are missing from the VFS.
 */
export function getMissingTopologyPages(
  plan: GeneratedSitePlan,
  existingFiles: Record<string, string>
): PageRouteNode[] {
  return plan.pages.filter(p => !existingFiles[p.filePath]);
}

// ============================================================================
// Page Generator
// ============================================================================

/**
 * Generate a page file (LEGACY: single self-contained string) for a topology
 * node. Retained for callers that need a single string (Builder reference,
 * sectionSwapper). Wizard scaffolding uses `generateTopologyPlaceholderFiles`
 * to emit per-component files for navigability.
 */
export function generateTopologyPlaceholder(
  page: PageRouteNode,
  plan: GeneratedSitePlan,
  template?: TemplateComposition | null
): string {
  const composed = tryComposeTopologyPage(page, plan, template);
  if (composed) return composed;
  throw new PreviewPipelineError(
    'vfs',
    `SiteBundleSnapshot has no composition for page "${page.title}" (${page.filePath}); refusing to emit minimal scaffold.`,
    { blockedFiles: [page.filePath], recoverableByRelaunch: true },
  );
}

/**
 * Multi-file variant. Returns the page file + extracted section components
 * under `/src/components/`. Throws PreviewPipelineError if no composition.
 */
export function generateTopologyPlaceholderFiles(
  page: PageRouteNode,
  plan: GeneratedSitePlan,
  template?: TemplateComposition | null,
  options?: ScaffoldOptions,
): Record<string, string> {
  const composed = tryComposeTopologyPageFiles(page, plan, template, options);
  if (composed) return composed;
  throw new PreviewPipelineError(
    'vfs',
    `SiteBundleSnapshot has no composition for page "${page.title}" (${page.filePath}); refusing to emit minimal scaffold.`,
    { blockedFiles: [page.filePath], recoverableByRelaunch: true },
  );
}

/**
 * Attempt to compose a page (single-string form) from the active template.
 * Returns null when composition is unavailable.
 */
export function tryComposeTopologyPage(
  page: PageRouteNode,
  plan: GeneratedSitePlan,
  template?: TemplateComposition | null,
  options?: ScaffoldOptions,
): string | null {
  const active = applyPlanThemeToTemplate(template ?? resolveActiveTemplate(plan), plan);
  if (!active) return null;
  const seeded = applyWizardSeedToComposition(active, plan);
  const sub = buildRoleComposition(seeded, page.role, page, plan, options);
  if (!sub) return null;
  try {
    return compositionToReactCode(sub);
  } catch {
    return null;
  }
}

/**
 * Attempt to compose a page (multi-file form). Emits the page module plus
 * the shared `/src/components/*` files. Section component files are
 * idempotent across pages within a generation — safe to merge by Object.assign.
 */
export function tryComposeTopologyPageFiles(
  page: PageRouteNode,
  plan: GeneratedSitePlan,
  template?: TemplateComposition | null,
  options?: ScaffoldOptions,
): Record<string, string> | null {
  const active = applyPlanThemeToTemplate(template ?? resolveActiveTemplate(plan), plan);
  if (!active) return null;
  const seeded = applyWizardSeedToComposition(active, plan);
  const sub = buildRoleComposition(seeded, page.role, page, plan, options);
  if (!sub) return null;
  try {
    return compositionToReactFileSet(sub, page.filePath, {
      designIntervention: options?.designIntervention,
    });
  } catch {
    return null;
  }
}



function extractComponentName(filePath: string): string {
  const fileName = filePath.split('/').pop()?.replace('.tsx', '') || 'Page';
  return fileName.charAt(0).toUpperCase() + fileName.slice(1);
}

/**
 * Returns the list of non-home pages from a topology plan
 * that need AI generation (missing from VFS).
 *
 * Note: when a template-driven scaffold is in play, these pages already have
 * real industry composition content — AI is only needed if the user explicitly
 * asks to enrich them.
 */
export function getTopologyPagesForAIGeneration(
  plan: GeneratedSitePlan,
  existingFiles: Record<string, string>
): PageRouteNode[] {
  return plan.pages.filter(p => !existingFiles[p.filePath] && !p.isHome);
}
