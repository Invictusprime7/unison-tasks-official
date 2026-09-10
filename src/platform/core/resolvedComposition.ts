/**
 * ResolvedPageComposition — Stage 4b's structurally self-describing output.
 *
 * Pass 2 of the canonical backbone restoration.
 *
 * Stage 4b already resolves every visual decision for a page (variant identity,
 * layout / motion / media recipe, section order) before Lane B ever runs. Until
 * now that resolution only existed *implicitly*, baked into the emitted TSX, so
 * every downstream consumer had to re-derive it by sniffing the source:
 *
 *   • the Lane B merge regex-tested for `const SECTIONS` + `SECTION_MAP` to
 *     guess whether a page was "canonical composed" — and handed the page to
 *     Lane B wholesale when the guess failed;
 *   • the presentation guard re-inferred hero identity/geometry heuristically.
 *
 * Stage 4b now *declares* the resolution as a first-class artifact, emitted
 * alongside the page module into the snapshot VFS. Declared beats inferred:
 * if a page has a ResolvedPageComposition, Stage 4b owns its design, full stop.
 *
 * These descriptors are pure data — no AI, no runtime behaviour.
 */

import { getIndustryProfile, normalizeIndustryKey, type PageSpec } from './industryMatrix';
import { getIndustryIntentProfile } from './industryIntentProfiles';
import type { ArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import { resolveIndustryArtDirectionPackId } from '@/services/designImplementationRegistry';

export const RESOLVED_COMPOSITION_VERSION = '1.0' as const;


/** Root directory for per-page composition descriptors inside the VFS. */
export const RESOLVED_COMPOSITION_ROOT = '/.unison/compositions';

export interface ResolvedSection {
  /** Stable section instance id — matches `data-ut-section-id` in the DOM. */
  sectionId: string;
  /** Semantic role of the section: hero, services, testimonials, … */
  semanticType: string;
  /** Component primitive Stage 4b compiled this section into (e.g. `Hero`). */
  primitiveId: string | null;
  /** Registry-owned variant id (e.g. `hero:full-bleed`), when one was resolved. */
  variantId?: string;
  /** Layout token executed for this section. */
  layoutRecipe?: string;
  /** Motion recipe executed for this section. */
  motionRecipe?: string;
  /** Media treatment executed for this section. */
  mediaRecipe?: string;
  /** Typography recipe executed for this section (page-wide today). */
  typographyRecipe?: string;
}

export interface ResolvedPageComposition {
  version: typeof RESOLVED_COMPOSITION_VERSION;
  /** Always Stage 4b — no other layer may author this artifact. */
  compiledBy: 'stage-4b';
  /** Canonical VFS path of the page module this composition compiled into. */
  pageFilePath: string;
  /** Template composition name Stage 4b resolved for this page. */
  templateName?: string;
  compositionAlternativeId?: string;
  /** Page-wide layout recipe from the wizard design brief. */
  layoutRecipe?: string;
  sections: ResolvedSection[];
}

export type ResolvedCompositionMap = Record<string, ResolvedPageComposition>;

function normalizePagePath(pageFilePath: string): string {
  const withSlash = pageFilePath.startsWith('/') ? pageFilePath : `/${pageFilePath}`;
  return withSlash.replace(/\/{2,}/g, '/');
}

/**
 * Deterministic descriptor path for a page module.
 * `/src/pages/Home.tsx` → `/.unison/compositions/pages/Home.json`
 */
export function resolvedCompositionPathFor(pageFilePath: string): string {
  const normalized = normalizePagePath(pageFilePath)
    .replace(/^\/src\//, '')
    .replace(/\.(tsx|jsx|ts|js)$/i, '');
  return `${RESOLVED_COMPOSITION_ROOT}/${normalized}.json`;
}

/** Serialize a composition descriptor for VFS emission. */
export function serializeResolvedComposition(composition: ResolvedPageComposition): string {
  return `${JSON.stringify(composition, null, 2)}\n`;
}

function isResolvedPageComposition(value: unknown): value is ResolvedPageComposition {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ResolvedPageComposition>;
  return (
    candidate.compiledBy === 'stage-4b' &&
    typeof candidate.pageFilePath === 'string' &&
    Array.isArray(candidate.sections)
  );
}

/**
 * Collect every Stage 4b composition descriptor present in a VFS, keyed by the
 * normalized page file path it governs.
 */
export function collectResolvedCompositions(
  files: Record<string, string> | null | undefined,
): ResolvedCompositionMap {
  const map: ResolvedCompositionMap = {};
  if (!files) return map;
  for (const [path, content] of Object.entries(files)) {
    if (!path.startsWith(RESOLVED_COMPOSITION_ROOT) || !path.endsWith('.json')) continue;
    if (typeof content !== 'string' || !content.trim()) continue;
    try {
      const parsed = JSON.parse(content) as unknown;
      if (!isResolvedPageComposition(parsed)) continue;
      map[normalizePagePath(parsed.pageFilePath)] = parsed;
    } catch {
      /* A malformed descriptor simply means "not declared" — never throw here. */
    }
  }
  return map;
}

/**
 * Declared authority check: does Stage 4b own the design of this page?
 *
 * This replaces the old `isCanonicalComposedPage(source)` regex guess at every
 * call site that has access to the snapshot VFS.
 */
export function hasResolvedComposition(
  compositions: ResolvedCompositionMap,
  pageFilePath: string,
): boolean {
  return Boolean(compositions[normalizePagePath(pageFilePath)]);
}

export function getResolvedComposition(
  compositions: ResolvedCompositionMap,
  pageFilePath: string,
): ResolvedPageComposition | undefined {
  return compositions[normalizePagePath(pageFilePath)];
}

/** Declared hero identity for a page — replaces heuristic hero-geometry sniffing. */
export function declaredHeroSection(
  composition: ResolvedPageComposition | undefined,
): ResolvedSection | undefined {
  return composition?.sections.find((section) => section.semanticType === 'hero');
}

// ============================================================================
// SiteConfiguration — the curated, deterministic input to Stage 4b
// ============================================================================

/**
 * Upstream of the per-page compositions above sits one curated decision:
 * given the wizard's selections, WHICH pages, sections, capabilities, journey
 * and art direction does this industry get?
 *
 * `resolveSiteConfiguration` is that single seam. It is pure and deterministic
 * and it reads only existing registries — the industry matrix, the industry
 * intent profiles, and the art direction packs. It introduces no new registry
 * and replaces no compiler stage; Stage 4b consumes its output exactly as it
 * consumes the wizard payload today.
 */

export const SITE_CONFIGURATION_VERSION = '1.0' as const;

export interface ResolvedSitePage {
  /** Playground page role. */
  role: string;
  title: string;
  path: string;
  purpose: PageSpec['purpose'];
  /** Semantic section types, in order. */
  sections: string[];
  /** True for the page carrying the industry's anchor conversion. */
  isConversionPage: boolean;
}

export interface SiteConfiguration {
  version: typeof SITE_CONFIGURATION_VERSION;
  industry: string;
  industryName: string;
  systemType: string;
  /** The one capability this site exists to fulfil. */
  anchorCapability: string | null;
  capabilities: string[];
  primaryIntent: string;
  conversionJourney: string[];
  /** Intents this industry must never render. */
  forbiddenIntents: string[];
  artDirectionPackId: ArtDirectionPackId;
  themePresetId: string | null;
  pages: ResolvedSitePage[];
  /** Deterministic fingerprint — identical inputs produce an identical string. */
  signature: string;
}

export interface SiteConfigurationInput {
  industry: string;
  themePresetId?: string | null;
  /** Sealed pack from snapshot meta; wins when present. */
  artDirectionPackId?: string | null;
  /** Deterministic wizard seed. */
  seed?: string | null;
  /** Page roles the creator explicitly selected. Home is always included. */
  requestedPages?: string[] | null;
  /** Capability toggles from the wizard's capability step. */
  requestedCapabilities?: string[] | null;
}

const ROLE_BY_PURPOSE: Record<PageSpec['purpose'], string> = {
  landing: 'home',
  services: 'services',
  portfolio: 'gallery',
  contact: 'contact',
  about: 'about',
  blog: 'blog',
  shop: 'shop',
  checkout: 'checkout',
  booking: 'booking',
  pricing: 'pricing',
  faq: 'faq',
};

function pageRole(page: PageSpec): string {
  if (page.path === '/') return 'home';
  return ROLE_BY_PURPOSE[page.purpose] ?? 'custom';
}

/**
 * Resolve the curated site configuration for a wizard launch.
 * Throws for an unknown industry — silent generic fallbacks are what turned
 * every vertical into the same booking site.
 */
export function resolveSiteConfiguration(input: SiteConfigurationInput): SiteConfiguration {
  const industryKey = normalizeIndustryKey(input.industry || '');
  const profile = getIndustryProfile(industryKey);
  if (!profile) {
    throw new Error(`resolveSiteConfiguration: unknown industry "${input.industry}"`);
  }

  const intentProfile = getIndustryIntentProfile(profile.industry);
  const forbiddenIntents = intentProfile?.forbidden ?? [];

  const requested = new Set((input.requestedPages ?? []).map((role) => role.trim().toLowerCase()));
  const pages: ResolvedSitePage[] = profile.defaultPages
    .filter((page) => page.path === '/' || requested.size === 0 || requested.has(pageRole(page)))
    .map((page) => {
      const role = pageRole(page);
      return {
        role,
        title: page.title,
        path: page.path,
        purpose: page.purpose,
        sections: [...page.expectedSections],
        isConversionPage:
          role === 'home' ||
          (profile.anchorCapability === 'booking' && role === 'booking') ||
          (profile.anchorCapability === 'commerce' && (role === 'shop' || role === 'checkout')) ||
          ((profile.anchorCapability === 'quoting' || profile.anchorCapability === 'lead-capture' ||
            profile.anchorCapability === 'contact' || profile.anchorCapability === 'donation') &&
            role === 'contact'),
      };
    });

  const capabilities = Array.from(
    new Set<string>([
      ...profile.defaultCapabilities,
      ...(profile.anchorCapability ? [profile.anchorCapability] : []),
      ...(input.requestedCapabilities ?? []),
    ]),
  );

  const artDirectionPackId = resolveIndustryArtDirectionPackId({
    industry: profile.industry,
    themePresetId: input.themePresetId ?? null,
    seed: input.seed ?? null,
    sealedPackId: input.artDirectionPackId ?? null,
  });

  const configuration: Omit<SiteConfiguration, 'signature'> = {
    version: SITE_CONFIGURATION_VERSION,
    industry: profile.industry,
    industryName: profile.name,
    systemType: profile.systemType,
    anchorCapability: profile.anchorCapability ?? null,
    capabilities,
    primaryIntent: profile.primaryIntent,
    conversionJourney: profile.conversionJourney ?? [profile.primaryIntent],
    forbiddenIntents,
    artDirectionPackId,
    themePresetId: input.themePresetId ?? null,
    pages,
  };

  return { ...configuration, signature: siteConfigurationSignature(configuration) };
}

/** Stable fingerprint of a configuration — used for drift detection. */
export function siteConfigurationSignature(
  configuration: Omit<SiteConfiguration, 'signature'>,
): string {
  return [
    configuration.version,
    configuration.industry,
    configuration.anchorCapability ?? 'none',
    configuration.artDirectionPackId,
    configuration.capabilities.slice().sort().join(','),
    configuration.conversionJourney.join('>'),
    configuration.pages.map((page) => `${page.role}:${page.sections.join('+')}`).join('|'),
  ].join('::');
}

