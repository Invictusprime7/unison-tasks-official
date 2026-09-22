/**
 * Homepage-first visual language contract.
 *
 * Canonical rule: the homepage is authored first and establishes the site's
 * visual language (certified variant identities, Stage 4b token usage and
 * typography tiers). Every remaining page inherits that language instead of
 * inventing its own, so a generated site is visually consistent by
 * construction rather than by review.
 *
 * Like every other Unison AI contract, the rules handed to the model are
 * rendered from the very values the validator asserts — never a prose copy —
 * and mechanical drift (a page picking a different site-chrome design) is
 * repaired deterministically instead of costing that page its design.
 */

/** Section families that are site chrome: identical on every page, always. */
export const SHARED_CHROME_FAMILIES = ['navbar', 'footer'] as const;

export interface HomepageVisualLanguage {
  /** Page that established the language (canonical page id). */
  sourcePageId: string;
  /** Established variant identity per section family (`hero` → `hero:prisma-cinematic`). */
  variants: Record<string, string>;
  /** Stage 4b tokens the homepage uses (`--ut-type-hero`, …). */
  tokens: string[];
  /** Canonical typography/utility classes the homepage established (`ut-hero`, …). */
  typography: string[];
  /** Bounded business/content anchors inherited by later pages without copying a page body. */
  contentModel: {
    headings: string[];
    intents: string[];
    sectionFamilies: string[];
  };
  /** Reusable architecture cues; body ordering and body variants remain page-specific. */
  architecture: {
    spacingClasses: string[];
    surfaceClasses: string[];
    contrastRoles: string[];
    mediaPosture: string[];
  };
  /** Stable fingerprint of the established language. */
  signature: string;
}

const attributeValues = (source: string, attribute: string): string[] =>
  Array.from(new Set(Array.from(
    source.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g')),
    match => match[1],
  )));

const familyOf = (variantId: string): string => variantId.split(':')[0]?.trim() ?? '';

const bounded = (values: Iterable<string>, limit: number): string[] =>
  Array.from(new Set(Array.from(values).map(value => value.trim()).filter(Boolean))).slice(0, limit);

const textValues = (source: string, tag: string): string[] => bounded(
  Array.from(source.matchAll(new RegExp(`<${tag}\\b[^>]*>([^<]{1,240})<\\/${tag}>`, 'gi')), match => match[1]),
  8,
);

/** Stable, order-independent fingerprint. FNV-1a over the sorted projection. */
function fingerprint(parts: string[]): string {
  let hash = 2166136261;
  for (const char of parts.slice().sort().join('|')) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash).toString(36);
}

/**
 * Read the visual language the homepage source establishes. Never throws —
 * an unreadable or empty source yields an empty language, which every
 * inheritance check treats as "nothing established yet".
 */
export function extractHomepageVisualLanguage(
  source: string | undefined,
  sourcePageId: string,
): HomepageVisualLanguage {
  const content = typeof source === 'string' ? source : '';
  const variants: Record<string, string> = {};
  for (const variantId of attributeValues(content, 'data-ut-variant')) {
    const family = familyOf(variantId);
    if (family && !(family in variants)) variants[family] = variantId;
  }
  const tokens = Array.from(new Set(
    Array.from(content.matchAll(/var\(\s*(--ut-[a-z0-9-]+)/g), match => match[1]),
  )).sort();
  const typography = Array.from(new Set(
    Array.from(content.matchAll(/\but-(?:hero|display|title|subtitle|eyebrow|body)\b/g), match => match[0]),
  )).sort();
  const sectionFamilies = bounded(
    attributeValues(content, 'data-ut-variant').map(familyOf),
    20,
  );
  const contentModel = {
    headings: bounded([...textValues(content, 'h1'), ...textValues(content, 'h2')], 8),
    intents: bounded(attributeValues(content, 'data-ut-intent'), 20),
    sectionFamilies,
  };
  const classNames = Array.from(content.matchAll(/className=["']([^"']+)["']/g), match => match[1].split(/\s+/)).flat();
  const architecture = {
    spacingClasses: bounded(classNames.filter(value => /^ut-(?:section|rhythm|grid|stack|block|pad)$/.test(value)), 12),
    surfaceClasses: bounded(classNames.filter(value => /^ut-(?:surface|accent-wash|gradient-panel|divider)$/.test(value)), 12),
    contrastRoles: bounded(classNames.filter(value => /^(?:bg|text)-(?:background|foreground|card|card-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground)$/.test(value)), 16),
    mediaPosture: bounded(classNames.filter(value => /^ut-(?:media|hero-media)$/.test(value)), 8),
  };

  return {
    sourcePageId,
    variants,
    tokens,
    typography,
    contentModel,
    architecture,
    signature: fingerprint([
      ...Object.entries(variants).map(([family, id]) => `v:${family}=${id}`),
      ...tokens.map(token => `t:${token}`),
      ...typography.map(entry => `y:${entry}`),
      ...contentModel.headings.map(entry => `h:${entry}`),
      ...contentModel.intents.map(entry => `i:${entry}`),
      ...architecture.spacingClasses.map(entry => `s:${entry}`),
      ...architecture.surfaceClasses.map(entry => `u:${entry}`),
      ...architecture.contrastRoles.map(entry => `c:${entry}`),
      ...architecture.mediaPosture.map(entry => `m:${entry}`),
    ]),
  };
}

/** True when the homepage has actually established something to inherit. */
export function hasEstablishedVisualLanguage(language: HomepageVisualLanguage | undefined): boolean {
  if (!language) return false;
  return Object.keys(language.variants).length > 0
    || language.tokens.length > 0
    || language.typography.length > 0;
}

/**
 * Order page targets so the homepage is authored first. Everything else keeps
 * its canonical order, so the result is deterministic for a given registry.
 */
export function orderHomepageFirst<T>(items: readonly T[], isHome: (item: T) => boolean): T[] {
  const home = items.filter(isHome);
  const rest = items.filter(item => !isHome(item));
  return [...home, ...rest];
}

/**
 * The machine-checked inheritance rules, rendered with the concrete values a
 * non-home page must honour. Returns an empty string when nothing has been
 * established yet (the homepage batch itself).
 */
export function renderHomepageInheritanceContract(
  language: HomepageVisualLanguage | undefined,
): string {
  if (!hasEstablishedVisualLanguage(language)) return '';
  const chrome = SHARED_CHROME_FAMILIES
    .map(family => (language!.variants[family] ? `${family}: ${language!.variants[family]}` : null))
    .filter((entry): entry is string => Boolean(entry));

  return [
    'HOMEPAGE VISUAL LANGUAGE (established by the homepage, machine-checked; a violation discards that page):',
    chrome.length
      ? `13. Site chrome must reuse the homepage design exactly — ${chrome.join('; ')}. Never select a different data-ut-variant for these families.`
      : '13. Do not introduce site chrome (navbar/footer) designs the homepage did not establish.',
    language!.tokens.length
      ? `14. Inherit the homepage token palette; prefer these established tokens: ${language!.tokens.join(', ')}.`
      : '14. Inherit the homepage token palette; introduce no new theme tokens.',
    language!.typography.length
      ? `15. Inherit the homepage type scale; the established tiers are: ${language!.typography.join(', ')}. Reserve the largest tier for the homepage headline.`
      : '15. Inherit the homepage type scale; do not invent new heading tiers.',
    `16. Ground the page in the homepage business narrative without copying it. Homepage headings: ${listValues(language!.contentModel.headings)}. Canonical actions: ${listValues(language!.contentModel.intents)}.`,
    `17. Reuse the homepage architecture, not its body composition. Spacing: ${listValues(language!.architecture.spacingClasses)}. Surfaces: ${listValues(language!.architecture.surfaceClasses)}. Contrast roles: ${listValues(language!.architecture.contrastRoles)}. Media posture: ${listValues(language!.architecture.mediaPosture)}.`,
    '18. Select a distinct role-appropriate body section order and certified body variants. Only navbar and footer identities must match exactly.',
  ].join('\n');
}

function listValues(values: readonly string[]): string {
  return values.length ? values.join(', ') : 'none established';
}

/**
 * Assert a non-home page inherits the established language. Only site chrome
 * is a hard rule — body sections may legitimately use a different certified
 * design for their own page role.
 */
export function validateHomepageInheritance(options: {
  path: string;
  content: string;
  language: HomepageVisualLanguage | undefined;
}): string[] {
  const { language } = options;
  if (!hasEstablishedVisualLanguage(language)) return [];
  const violations: string[] = [];
  const declared = attributeValues(options.content, 'data-ut-variant');
  for (const family of SHARED_CHROME_FAMILIES) {
    const established = language!.variants[family];
    if (!established) continue;
    for (const variantId of declared) {
      if (familyOf(variantId) !== family) continue;
      if (variantId !== established) {
        violations.push(
          `File ${options.path} uses ${family} design "${variantId}" but the homepage established "${established}". Site chrome must be identical on every page.`,
        );
      }
    }
  }
  return violations;
}

/**
 * Deterministically align site chrome with the homepage. Picking a different
 * navbar or footer is mechanical drift, not a design decision, so it is
 * repaired rather than rejected. Page body content is untouched.
 */
export function alignWithHomepageVisualLanguage(
  content: string,
  language: HomepageVisualLanguage | undefined,
): string {
  if (!hasEstablishedVisualLanguage(language)) return content;
  let out = content;
  for (const family of SHARED_CHROME_FAMILIES) {
    const established = language!.variants[family];
    if (!established) continue;
    out = out.replace(
      new RegExp(`data-ut-variant="${family}:[^"]*"`, 'g'),
      `data-ut-variant="${established}"`,
    );
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * Site-wide enforcement (post-generation)
 *
 * Generation establishes the visual language; every later mutation — AI
 * builder rewrites, property inspector edits, restored artifacts — must keep
 * the site inside it. Same authority, same rules, applied to a whole file set
 * instead of one page: mechanical drift is repaired deterministically, and a
 * real palette escape is a violation the caller can block on.
 * ------------------------------------------------------------------------- */

/** Largest type tier: reserved for the homepage headline. */
const HOMEPAGE_ONLY_TYPE_TIER = 'ut-hero';
const INHERITED_TYPE_TIER = 'ut-display';

/** Hardcoded palette escapes: they bypass the theme and break dark mode. */
const PALETTE_ESCAPES: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(?:bg|text|border|from|via|to)-\[#[0-9a-fA-F]{3,8}\]/g, label: 'hardcoded hex utility' },
  { pattern: /\b(?:bg|text|border)-(?:white|black)\b/g, label: 'hardcoded black/white utility' },
  { pattern: /(?:color|background(?:-color)?)\s*:\s*#[0-9a-fA-F]{3,8}/g, label: 'inline hex style' },
];

export interface SiteDesignContractReport {
  /** Files after deterministic repair (unchanged entries are the same reference). */
  files: Record<string, string>;
  /** Mechanical drift repaired without discarding any authored design. */
  repairs: string[];
  /** Real contract breaches the caller may reject on. */
  violations: string[];
  /** True when nothing has been established yet — nothing to enforce. */
  skipped: boolean;
}

const isPageSource = (path: string): boolean =>
  /^\/src\/pages\/.+\.(?:tsx|jsx)$/.test(path);

/**
 * Enforce the homepage-established language across every page in a file set.
 * Never throws: the caller decides what a violation costs.
 */
export function enforceSiteDesignContract(options: {
  files: Record<string, string>;
  homePath?: string | null;
  language?: HomepageVisualLanguage;
}): SiteDesignContractReport {
  const files = options.files ?? {};
  const homePath = options.homePath && files[options.homePath]
    ? options.homePath
    : ['/src/pages/Index.tsx', '/src/pages/Home.tsx', '/src/pages/index.tsx']
      .find(candidate => typeof files[candidate] === 'string') ?? null;

  const language = options.language
    ?? (homePath ? extractHomepageVisualLanguage(files[homePath], homePath) : undefined);

  if (!hasEstablishedVisualLanguage(language)) {
    return { files, repairs: [], violations: [], skipped: true };
  }

  const next: Record<string, string> = { ...files };
  const repairs: string[] = [];
  const violations: string[] = [];

  for (const [path, source] of Object.entries(files)) {
    if (typeof source !== 'string' || !isPageSource(path) || path === homePath) continue;

    let content = alignWithHomepageVisualLanguage(source, language);
    if (content !== source) repairs.push(`${path}: site chrome realigned with the homepage design.`);

    if (content.includes(HOMEPAGE_ONLY_TYPE_TIER) && language!.typography.includes(HOMEPAGE_ONLY_TYPE_TIER)) {
      const demoted = content.replace(new RegExp(`\\b${HOMEPAGE_ONLY_TYPE_TIER}\\b`, 'g'), INHERITED_TYPE_TIER);
      if (demoted !== content) {
        content = demoted;
        repairs.push(`${path}: headline tier demoted to ${INHERITED_TYPE_TIER}; ${HOMEPAGE_ONLY_TYPE_TIER} is the homepage headline tier.`);
      }
    }

    for (const escape of PALETTE_ESCAPES) {
      const hits = Array.from(new Set(content.match(escape.pattern) ?? []));
      if (hits.length) {
        violations.push(
          `${path} uses ${escape.label} (${hits.slice(0, 4).join(', ')}). Pages must use the site theme tokens the homepage established.`,
        );
      }
    }

    violations.push(...validateHomepageInheritance({ path, content, language }));
    if (content !== source) next[path] = content;
  }

  return { files: next, repairs, violations, skipped: false };
}
