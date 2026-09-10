import type { GeneratedUiManifest } from '@/platform/core/generatedUiFoundation';
import type { PageRegistry } from '@/types/pageRegistry';
import { normalizeWizardPageRole } from '@/services/wizardPageQuality';
import { resolveGeometryTokens } from '@/components/onboarding/themePresetToIndexCss';
import { resolveArtDirectionPack } from '@/sections/variants/artDirectionPacks';
import { childSeed, seededPick, seededRotate } from '@/platform/core/generationSeed';
import { getIndustryProfile } from '@/platform/core/industryMatrix';


export interface WizardHeroGeometry {
  layout: string;
  variantId?: string;
  mediaTreatment: 'full-bleed-overlay' | 'split-frame' | 'centered-frame' | 'edge-anchored' | 'text-only';
  source: 'selected-home-template' | 'seeded-role-archetype';
}

export type HeroArchetypeId =
  | 'immersive-full-bleed'
  | 'editorial-split'
  | 'anchored-portrait'
  | 'centered-statement'
  | 'utility-intro-proof';

/**
 * A hero is a composition, not a headline. Every route declares the archetype
 * it must build, the parts that make it complete, and how its media is framed
 * so an image is never sliced into a band above the copy.
 */
export interface WizardHeroContract extends WizardHeroGeometry {
  archetype: HeroArchetypeId;
  /** object-position anchor for the hero image. */
  mediaFocal: 'center' | 'top' | 'bottom' | 'left' | 'right';
  mediaDirection: string;
  requiredParts: string[];
  rule: string;
}

export interface WizardGenerationBrief {
  version: '1.0';
  research: {
    mode: 'connected-gateway';
    enabled: true;
    mayInform: readonly ['audience-language', 'category-patterns', 'content-angles', 'image-direction'];
    mustNotInvent: readonly ['business-facts', 'prices', 'availability', 'tenant-identity', 'capabilities', 'endpoints'];
  };
  routes: Array<{
    pageId: string;
    path: string;
    role: string;
    title: string;
    hero: {
      required: true;
      headline: string;
      contentAngle: string;
      mustDifferFromHome: boolean;
      geometry: WizardHeroContract;
    };
    /**
     * Page-depth floor. A premium multi-page site never ships a two-block
     * page: every route declares how many content sections it must contain.
     */
    depth: { minSections: number; maxSections: number };
    /**
     * Seeded, per-page anti-repetition signature. Derived deterministically
     * from the canonical generation seed so two pages of the same site never
     * repeat the same rhythm, and two launches of the same wizard answers
     * reproduce byte-identically.
     */
    signature: {
      surfaceRhythm: string;
      ctaEmphasis: string;
      sectionOrder: string[];
      /** Narrative arc label per section, in the same order. */
      narrative: string[];
    };
  }>;
  homeHeroGeometry: WizardHeroContract;
  /** Cross-page contract the AI must satisfy for every route. */
  depth: { rule: string };
  /** Hero completeness + media framing contract applied to every route. */
  hero: { rule: string; mediaRule: string; antiPatterns: string[] };

  /**
   * Geometry is delegated to the aesthetic selection: these are the resolved
   * CSS variables for the selected style card. Generated pages must reference
   * them (e.g. min-h-[var(--ut-hero-block)]) and never hardcode px/rem/vh.
   */
  geometry: {
    source: 'selected-style-card';
    themePresetId: string | null;
    tokens: Record<string, string>;
    rule: string;
  };
  /**
   * The named design system the AI authors INSIDE. It is resolved
   * deterministically before any model call and sealed on the snapshot — the
   * AI never picks it and may never deviate from it.
   */
  artDirection: {
    source: 'sealed-art-direction-pack';
    packId: string;
    name: string;
    description: string;
    rhythm: string;
    surface: string;
    accentPolicy: string;
    mediaTreatment: string;
    headingTransform: string;
    motionProfile: string;
    interactionProfile: string;
    /** Theme-led signature the style card owns, not the industry. */
    typography: { displayStack: string; bodyStack: string; displayWeight: number; bodyWeight: number };
    gradient: string;
    density: string;
    hero: { layout: string; align: string; mediaRatio: string };
    pill: string;
    entrance: string;
    classes: string[];
    rule: string;
  };
  /** Chrome authority: the page body is the only place chrome can exist. */
  chrome: {
    owner: 'page-body';
    rule: string;
    routes: { path: string; label: string }[];
  };
  ui: { formFormats: string[]; buttonFormats: string[]; iconFormats: string[] };
}

/** Role → page-depth floor. Never below 4 content sections. */
const ROLE_DEPTH: Record<string, { minSections: number; maxSections: number }> = {
  home: { minSections: 6, maxSections: 9 },
  services: { minSections: 5, maxSections: 8 },
  products: { minSections: 5, maxSections: 8 },
  shop: { minSections: 5, maxSections: 8 },
  pricing: { minSections: 5, maxSections: 8 },
  portfolio: { minSections: 5, maxSections: 8 },
  gallery: { minSections: 5, maxSections: 8 },
  about: { minSections: 5, maxSections: 7 },
  booking: { minSections: 5, maxSections: 7 },
  contact: { minSections: 4, maxSections: 7 },
  faq: { minSections: 4, maxSections: 7 },
};

const SURFACE_RHYTHMS = [
  'base → raised → base → accent-wash → base',
  'accent-wash → base → raised → base → raised',
  'raised → base → accent-wash → raised → base',
  'base → accent-wash → raised → base → accent-wash',
];

const CTA_EMPHASIS = [
  'inline text CTA inside the narrative block',
  'full-width accent CTA band before the footer',
  'paired CTA card sitting beside supporting proof',
  'sticky-feeling CTA strip after the primary proof section',
];

// ---------------------------------------------------------------------------
// Hero architecture
// ---------------------------------------------------------------------------

interface HeroArchetypeSpec {
  layout: string;
  mediaTreatment: WizardHeroGeometry['mediaTreatment'];
  mediaFocal: WizardHeroContract['mediaFocal'];
  mediaDirection: string;
  requiredParts: string[];
}

const HERO_ARCHETYPES: Record<HeroArchetypeId, HeroArchetypeSpec> = {
  'immersive-full-bleed': {
    layout: 'full-bleed',
    mediaTreatment: 'full-bleed-overlay',
    mediaFocal: 'center',
    mediaDirection:
      'The photograph is the hero background itself (absolute inset-0, object-cover, object-center) under a legibility scrim, with the copy layered on top. It is never a cropped image band stacked above the text.',
    requiredParts: ['eyebrow', 'h1 headline', 'supporting lead paragraph', 'primary action', 'secondary action', 'full-bleed background image with scrim'],
  },
  'editorial-split': {
    layout: 'split',
    mediaTreatment: 'split-frame',
    mediaFocal: 'center',
    mediaDirection:
      'Two-column hero: copy column and a framed media column using ut-hero-media so the whole subject stays visible. The media column fills its own height — no letterboxed strip.',
    requiredParts: ['eyebrow', 'h1 headline', 'supporting lead paragraph', 'primary action', 'secondary action', 'framed hero media'],
  },
  'anchored-portrait': {
    layout: 'anchored',
    mediaTreatment: 'edge-anchored',
    mediaFocal: 'top',
    mediaDirection:
      'Portrait/tall media anchored to one edge of the hero, top-focused so faces and subjects are never cut. Copy sits in the opposite column with generous breathing room.',
    requiredParts: ['eyebrow', 'h1 headline', 'supporting lead paragraph', 'primary action', 'secondary action', 'edge-anchored portrait media'],
  },
  'centered-statement': {
    layout: 'centered',
    mediaTreatment: 'centered-frame',
    mediaFocal: 'center',
    mediaDirection:
      'Centered statement typography with one framed media object beneath it, sized by ut-hero-media so it reads as a complete picture rather than a sliced band.',
    requiredParts: ['eyebrow', 'h1 headline', 'supporting lead paragraph', 'primary action', 'secondary action', 'centered framed media'],
  },
  'utility-intro-proof': {
    layout: 'intro',
    mediaTreatment: 'text-only',
    mediaFocal: 'center',
    mediaDirection:
      'No large hero photograph. The hero carries a compact proof strip instead (three factual signals such as response time, location, hours, or credentials) so the opening screen still feels complete.',
    requiredParts: ['eyebrow', 'h1 headline', 'supporting lead paragraph', 'primary action', 'secondary action', 'inline proof strip of three signals'],
  },
};

/** Role → hero archetypes that suit the job that page has to do. */
const ROLE_HERO_ARCHETYPES: Record<string, HeroArchetypeId[]> = {
  home: ['immersive-full-bleed', 'editorial-split', 'centered-statement'],
  services: ['editorial-split', 'centered-statement', 'anchored-portrait'],
  products: ['editorial-split', 'immersive-full-bleed', 'centered-statement'],
  shop: ['editorial-split', 'immersive-full-bleed', 'centered-statement'],
  pricing: ['centered-statement', 'utility-intro-proof'],
  portfolio: ['immersive-full-bleed', 'anchored-portrait', 'editorial-split'],
  gallery: ['immersive-full-bleed', 'anchored-portrait', 'editorial-split'],
  about: ['anchored-portrait', 'editorial-split', 'centered-statement'],
  booking: ['editorial-split', 'utility-intro-proof', 'centered-statement'],
  contact: ['utility-intro-proof', 'editorial-split'],
  faq: ['utility-intro-proof', 'centered-statement'],
};

const HERO_RULE =
  'Every page hero is a complete composition, not a title. It must render its declared parts: eyebrow, one h1, a supporting lead paragraph, a primary action carrying the page intent, a secondary action, and its declared media or proof element. A hero with only a heading and a sentence is a rejected page.';

const HERO_MEDIA_RULE =
  'Hero imagery must read as a whole picture. Use ut-hero / ut-hero-media (and the --ut-hero-* tokens) so the media fills its container by height, and set the declared focal anchor with object-top / object-center / object-bottom. Never place an image in a short fixed band above the hero copy, never crop a subject out of frame, and never author px/vh literals for hero sizing.';

const HERO_ANTI_PATTERNS = [
  'title-only hero with no lead paragraph or action',
  'image band stacked above hero copy that slices the subject',
  'inner pages reusing the Home hero composition or headline',
  'hero actions that do not carry a canonical data-ut-intent',
];

function heroArchetypeFor(seed: string, pageId: string, role: string, exclude?: HeroArchetypeId): HeroArchetypeId {
  const pool = ROLE_HERO_ARCHETYPES[role] || ['editorial-split', 'centered-statement', 'utility-intro-proof'];
  const candidates = pool.filter((entry) => entry !== exclude);
  return seededPick(childSeed(seed, 'hero', pageId, role), candidates.length > 0 ? candidates : pool);
}

function heroContract(archetype: HeroArchetypeId, overrides?: Partial<WizardHeroContract>): WizardHeroContract {
  const spec = HERO_ARCHETYPES[archetype];
  return {
    archetype,
    layout: spec.layout,
    mediaTreatment: spec.mediaTreatment,
    mediaFocal: spec.mediaFocal,
    mediaDirection: spec.mediaDirection,
    requiredParts: [...spec.requiredParts],
    source: 'seeded-role-archetype',
    rule: HERO_RULE,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Section narrative
// ---------------------------------------------------------------------------

type NarrativeStage = 'orient' | 'prove' | 'deepen' | 'objection';

const NARRATIVE_STAGES: NarrativeStage[] = ['orient', 'prove', 'deepen', 'objection'];

/** Role → candidate sections per narrative stage (arc: orient → prove → deepen → objection → convert). */
const ROLE_NARRATIVE: Record<string, Record<NarrativeStage, string[]>> = {
  home: {
    orient: ['value-proposition', 'services', 'offer-overview'],
    prove: ['proof', 'testimonials', 'stats'],
    deepen: ['gallery', 'process', 'featured-work'],
    objection: ['faq', 'guarantees', 'pricing-teaser'],
  },
  services: {
    orient: ['services', 'service-detail'],
    prove: ['outcomes', 'testimonials', 'stats'],
    deepen: ['process', 'gallery', 'inclusions'],
    objection: ['faq', 'pricing-teaser'],
  },
  products: {
    orient: ['catalog', 'categories'],
    prove: ['testimonials', 'stats'],
    deepen: ['highlights', 'materials', 'gallery'],
    objection: ['faq', 'shipping-returns'],
  },
  shop: {
    orient: ['catalog', 'categories'],
    prove: ['testimonials', 'stats'],
    deepen: ['highlights', 'materials', 'gallery'],
    objection: ['faq', 'shipping-returns'],
  },
  pricing: {
    orient: ['plans', 'comparison'],
    prove: ['testimonials', 'stats'],
    deepen: ['inclusions', 'process'],
    objection: ['faq', 'guarantees'],
  },
  portfolio: {
    orient: ['featured-project', 'gallery'],
    prove: ['testimonials', 'clients'],
    deepen: ['process', 'case-study'],
    objection: ['faq', 'availability'],
  },
  gallery: {
    orient: ['gallery', 'collections'],
    prove: ['testimonials', 'stats'],
    deepen: ['featured-project', 'process'],
    objection: ['faq', 'availability'],
  },
  about: {
    orient: ['story', 'mission'],
    prove: ['stats', 'testimonials'],
    deepen: ['team', 'timeline', 'values'],
    objection: ['faq', 'credentials'],
  },
  booking: {
    orient: ['offering', 'availability'],
    prove: ['testimonials', 'stats'],
    deepen: ['how-it-works', 'preparation'],
    objection: ['policies', 'faq'],
  },
  contact: {
    orient: ['contact-form', 'contact-channels'],
    prove: ['response-promise', 'testimonials'],
    deepen: ['locations', 'hours'],
    objection: ['faq', 'directions'],
  },
  faq: {
    orient: ['faq', 'categories'],
    prove: ['testimonials', 'stats'],
    deepen: ['support-channels', 'guides'],
    objection: ['contact-form'],
  },
};

const DEFAULT_NARRATIVE: Record<NarrativeStage, string[]> = {
  orient: ['overview', 'highlights'],
  prove: ['testimonials', 'stats'],
  deepen: ['details', 'gallery'],
  objection: ['faq', 'contact-form'],
};

/** Anchor capability → the one industry-specific section its pages must carry. */
const ANCHOR_SECTION: Record<string, string> = {
  booking: 'availability',
  commerce: 'catalog',
  quoting: 'quote-request',
  donation: 'donation-ask',
  'lead-capture': 'lead-form',
  contact: 'contact-form',
  newsletter: 'newsletter',
};

/** Section → structural family, used to prevent two neighbours of the same shape. */
const SECTION_FAMILY: Record<string, string> = {
  hero: 'hero',
  services: 'cards', catalog: 'cards', plans: 'cards', categories: 'cards',
  highlights: 'cards', inclusions: 'cards', collections: 'cards', 'offer-overview': 'cards',
  'service-detail': 'cards', comparison: 'table', guides: 'cards', 'support-channels': 'cards',
  testimonials: 'quotes', clients: 'quotes', 'response-promise': 'quotes',
  stats: 'metrics', credentials: 'metrics', guarantees: 'metrics',
  gallery: 'media', 'featured-project': 'media', 'featured-work': 'media', 'case-study': 'media',
  materials: 'media', team: 'media',
  story: 'narrative', mission: 'narrative', values: 'narrative', process: 'narrative',
  'how-it-works': 'narrative', timeline: 'narrative', preparation: 'narrative',
  'value-proposition': 'narrative', proof: 'narrative', outcomes: 'narrative', details: 'narrative',
  overview: 'narrative', policies: 'narrative', 'shipping-returns': 'narrative',
  faq: 'faq',
  'contact-form': 'form', 'lead-form': 'form', 'quote-request': 'form', newsletter: 'form',
  'contact-channels': 'form', locations: 'form', hours: 'form', directions: 'form',
  availability: 'scheduler', offering: 'cards', 'donation-ask': 'form',
  'pricing-teaser': 'cards',
  cta: 'cta',
};

function familyOf(section: string): string {
  return SECTION_FAMILY[section] || 'narrative';
}

/** Reorder so no two adjacent sections share a structural family. */
function deInterleave(sections: string[]): string[] {
  const ordered: string[] = [];
  const pending = [...sections];
  while (pending.length > 0) {
    const previous = ordered[ordered.length - 1];
    const index = previous
      ? Math.max(0, pending.findIndex((entry) => familyOf(entry) !== familyOf(previous)))
      : 0;
    ordered.push(pending.splice(index, 1)[0]);
  }
  return ordered;
}

function routeDepth(role: string): { minSections: number; maxSections: number } {
  return ROLE_DEPTH[role] || { minSections: 4, maxSections: 7 };
}

function routeSignature(
  seed: string,
  pageId: string,
  role: string,
  minSections: number,
  anchorSection: string | null,
) {
  const pageSeed = childSeed(seed, 'page', pageId, role);
  const stages = ROLE_NARRATIVE[role] || DEFAULT_NARRATIVE;

  // One section per narrative stage, seeded, then top up from the richest
  // stages until the page reaches its declared depth.
  const chosen: Array<{ section: string; stage: string }> = [];
  const used = new Set<string>();
  for (const stage of NARRATIVE_STAGES) {
    const pool = (stages[stage] || []).filter((entry) => !used.has(entry));
    if (pool.length === 0) continue;
    const section = seededPick(childSeed(pageSeed, 'stage', stage), pool);
    used.add(section);
    chosen.push({ section, stage });
  }

  if (anchorSection && !used.has(anchorSection)) {
    used.add(anchorSection);
    chosen.splice(1, 0, { section: anchorSection, stage: 'convert-anchor' });
  }

  const spare = seededRotate(
    childSeed(pageSeed, 'enrichment'),
    NARRATIVE_STAGES.flatMap((stage) => (stages[stage] || []).map((section) => ({ section, stage })))
      .filter((entry) => !used.has(entry.section)),
  );
  while (chosen.length < minSections - 2 && spare.length > 0) {
    const next = spare.shift()!;
    used.add(next.section);
    chosen.push(next);
  }

  const body = deInterleave(chosen.map((entry) => entry.section));
  const stageBySection = new Map(chosen.map((entry) => [entry.section, entry.stage]));
  const sectionOrder = ['hero', ...body, 'cta'];

  return {
    surfaceRhythm: seededPick(childSeed(pageSeed, 'surface'), SURFACE_RHYTHMS),
    ctaEmphasis: seededPick(childSeed(pageSeed, 'cta'), CTA_EMPHASIS),
    sectionOrder,
    narrative: sectionOrder.map((section) =>
      section === 'hero' ? 'open' : section === 'cta' ? 'convert' : (stageBySection.get(section) || 'deepen'),
    ),
  };
}

function generationTitle(role: string, title: string): string {
  const label = title.trim() || role.replace(/[-_]/g, ' ').trim() || 'Explore';
  return label.charAt(0).toUpperCase() + label.slice(1);
}


function generationAngle(role: string, title: string): string {
  const label = generationTitle(role, title).toLowerCase();
  const angles: Record<string, string> = {
    home: 'brand promise and primary customer outcome',
    services: 'service selection and practical outcomes',
    products: 'catalog discovery and product confidence',
    pricing: 'offer comparison and decision confidence',
    booking: 'availability and reservation confidence',
    contact: 'conversation start and response expectations',
    about: 'credibility, people, and point of view',
    portfolio: 'proof through selected work and process',
    gallery: 'visual proof and inspection',
    faq: 'objection handling and clarity',
  };
  return angles[role] || `${label} intent and the next customer decision`;
}

function archetypeForHomeLayout(layout: string, hasMedia: boolean): HeroArchetypeId {
  if (layout === 'full-bleed') return 'immersive-full-bleed';
  if (layout === 'split') return 'editorial-split';
  if (!hasMedia) return 'utility-intro-proof';
  return 'centered-statement';
}

function readWizardHeroGeometry(pageSource: string): WizardHeroContract {
  const match = pageSource.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/);
  let hero: { variantId?: unknown; props?: Record<string, unknown> } | undefined;
  if (match) {
    try {
      const sections = JSON.parse(match[1]) as Array<{
        type?: unknown;
        variantId?: unknown;
        props?: Record<string, unknown>;
      }>;
      hero = sections.find((section) => section.type === 'hero');
    } catch {
      // Legacy snapshots use the explicit centered/text-only geometry below.
    }
  }
  const layout = typeof hero?.props?.layout === 'string' ? hero.props.layout : 'centered';
  const hasMedia = typeof hero?.props?.image === 'string' || typeof hero?.props?.backgroundImage === 'string';
  const archetype = archetypeForHomeLayout(layout, hasMedia);
  return heroContract(archetype, {
    layout,
    variantId: typeof hero?.variantId === 'string' ? hero.variantId : undefined,
    source: 'selected-home-template',
  });
}

export function buildWizardGenerationBrief(input: {
  pageRegistry: PageRegistry;
  vfsFiles: Record<string, string>;
  uiFoundation?: Pick<GeneratedUiManifest, 'formFormats' | 'buttonFormats' | 'iconFormats'>;
  themePresetId?: string | null;
  /** Sealed pack id from meta.artDirectionPackId. Wins over re-derivation. */
  artDirectionPackId?: string | null;
  industry?: string | null;
  seed?: string | null;
}): WizardGenerationBrief {
  const pack = resolveArtDirectionPack({
    sealedPackId: input.artDirectionPackId,
    themePresetId: input.themePresetId,
    industry: input.industry,
    seed: input.seed,
  });
  const seed = input.seed || `${input.themePresetId || 'theme'}|${input.industry || 'general'}`;
  const homePage = Object.values(input.pageRegistry.pages).find((page) => page.isHome);

  const homePath = homePage?.filePath || '';
  const homeSource = homePath
    ? (input.vfsFiles[homePath] || input.vfsFiles[homePath.replace(/^\//, '')] || '')
    : '';
  const homeHeroGeometry = readWizardHeroGeometry(homeSource);
  const industryProfile = input.industry ? getIndustryProfile(input.industry) : undefined;
  const anchorSection = industryProfile?.anchorCapability
    ? ANCHOR_SECTION[industryProfile.anchorCapability] || null
    : null;

  const routes = Object.values(input.pageRegistry.pages)
    .filter((page): page is typeof page & { filePath: string } => Boolean(page.filePath))
    .sort((left, right) => left.navOrder - right.navOrder)
    .map((page) => {
      const role = normalizeWizardPageRole(page.pageRole || page.pageType || (page.isHome ? 'home' : 'custom'));
      const title = generationTitle(role, page.title);
      const depth = routeDepth(role);
      const geometry = page.isHome
        ? homeHeroGeometry
        : heroContract(heroArchetypeFor(seed, page.pageId, role, homeHeroGeometry.archetype));
      // The anchor section belongs on the pages that can act on it, not on FAQ.
      const routeAnchor = anchorSection && ['home', 'services', 'booking', 'products', 'shop', 'pricing', 'contact'].includes(role)
        ? anchorSection
        : null;
      return {
        pageId: page.pageId,
        path: page.filePath,
        role,
        title,
        hero: {
          required: true as const,
          headline: title,
          contentAngle: generationAngle(role, title),
          mustDifferFromHome: !page.isHome,
          geometry,
        },
        depth,
        signature: routeSignature(seed, page.pageId, role, depth.minSections, routeAnchor),
      };
    });

  return {
    version: '1.0',
    research: {
      mode: 'connected-gateway',
      enabled: true,
      mayInform: ['audience-language', 'category-patterns', 'content-angles', 'image-direction'],
      mustNotInvent: ['business-facts', 'prices', 'availability', 'tenant-identity', 'capabilities', 'endpoints'],
    },
    routes,
    homeHeroGeometry,
    depth: {
      rule: 'Every route must render at least its declared minSections content sections (hero excluded from the floor only when the page declares 4). Never ship a page with two or three blocks. Each page follows its own surfaceRhythm and ctaEmphasis so no two pages of this site read the same, and no page reuses another page\'s section order. Build the declared sectionOrder in that order — it encodes the narrative arc open → orient → prove → deepen → handle objections → convert — and never place two sections of the same structural family back to back.',
    },
    hero: {
      rule: HERO_RULE,
      mediaRule: HERO_MEDIA_RULE,
      antiPatterns: HERO_ANTI_PATTERNS,
    },

    geometry: {
      source: 'selected-style-card',
      themePresetId: input.themePresetId || null,
      tokens: resolveGeometryTokens(input.themePresetId || undefined, { sealedPackId: pack.id }),
      rule: 'Style with these tokens only. Never write px/rem/vh/vw/%/clamp()/calc() literals in Tailwind arbitrary values or inline styles, and never author raw CSS or <style> tags.',
    },
    artDirection: {
      source: 'sealed-art-direction-pack',
      packId: pack.id,
      name: pack.name,
      description: pack.description,
      rhythm: pack.design.rhythm,
      surface: pack.design.surface,
      accentPolicy: pack.design.accentPolicy,
      mediaTreatment: pack.design.mediaTreatment,
      headingTransform: pack.design.headingTransform,
      motionProfile: pack.motionProfile,
      interactionProfile: pack.interactionProfile,
      typography: {
        displayStack: pack.signature.typography.displayStack,
        bodyStack: pack.signature.typography.bodyStack,
        displayWeight: pack.signature.typography.displayWeight,
        bodyWeight: pack.signature.typography.bodyWeight,
      },
      gradient: pack.signature.gradient,
      density: pack.signature.density,
      hero: {
        layout: pack.signature.hero.layout,
        align: pack.signature.hero.align,
        mediaRatio: pack.signature.hero.mediaRatio,
      },
      pill: pack.signature.pill,
      entrance: pack.signature.entrance,
      classes: [
        'ut-section', 'ut-rhythm', 'ut-display', 'ut-title', 'ut-lead', 'ut-measure', 'ut-eyebrow',
        'ut-surface', 'ut-accent-wash', 'ut-media', 'ut-reveal', 'ut-reveal-2', 'ut-reveal-3', 'ut-reveal-4',
        'ut-pill', 'ut-gradient-hero', 'ut-gradient-panel', 'ut-gradient-text', 'ut-divider',
        'ut-grid', 'ut-stack', 'ut-block', 'ut-pad', 'ut-hero', 'ut-hero-media', 'ut-hero-full', 'ut-hero-scrim',
      ],
      rule: `Author every page inside the "${pack.name}" design system: ${pack.description} Typography is ${pack.signature.typography.displayStack.split(',')[0]} display at weight ${pack.signature.typography.displayWeight} over ${pack.signature.typography.bodyStack.split(',')[0]} body; gradient language is "${pack.signature.gradient}" (use ut-gradient-hero / ut-gradient-panel / ut-gradient-text, never a hand-written gradient); spacing density is "${pack.signature.density}" (use ut-grid / ut-stack / ut-block / ut-pad, never literal gap or padding values); the hero follows the per-route archetype in this brief and is built with ut-hero + ut-hero-media (or ut-hero-full + ut-hero-scrim for full-bleed), never a hand-rolled hero composition; badges, tags and eyebrows use ut-pill / ut-eyebrow so the "${pack.signature.pill}" shape language stays consistent; entrance motion is "${pack.signature.entrance}" via ut-reveal and ut-reveal-2/3/4 for stagger. Use the ut-* primitives and --ut-* tokens for type scale, surfaces, media framing and motion. Do not invent a competing visual language, and never substitute hardcoded sizes, radii, shadows or gradients for these tokens.`,
    },
    chrome: {
      owner: 'page-body',
      rule: 'The router renders routes only — it never injects a navbar or a footer, and there is no platform-owned chrome module. Whatever navigation or footer a visitor sees must be authored inside the page body itself, so give each page the site navigation it needs (a floating bar, a plain header, a hand-authored <nav>, or the shared <FloatingNavbar brand={...} links={...} ctaLabel={...} /> from "@/unison/ui") and keep its links identical to the registered routes below. Design the chrome to fit the page — no fixed count is imposed — but never render two competing primary nav bars or two footers on the same page, and never emit /src/sections/SiteNavbar.tsx or /src/sections/SiteFooter.tsx.',
      routes: routes.map((route) => ({ path: route.path, label: route.title })),
    },
    ui: {
      formFormats: [...(input.uiFoundation?.formFormats || [])],
      buttonFormats: [...(input.uiFoundation?.buttonFormats || [])],
      iconFormats: [...(input.uiFoundation?.iconFormats || [])],
    },
  };
}
