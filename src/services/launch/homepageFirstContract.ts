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
  /** Stable fingerprint of the established language. */
  signature: string;
}

const attributeValues = (source: string, attribute: string): string[] =>
  Array.from(new Set(Array.from(
    source.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g')),
    match => match[1],
  )));

const familyOf = (variantId: string): string => variantId.split(':')[0]?.trim() ?? '';

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

  return {
    sourcePageId,
    variants,
    tokens,
    typography,
    signature: fingerprint([
      ...Object.entries(variants).map(([family, id]) => `v:${family}=${id}`),
      ...tokens.map(token => `t:${token}`),
      ...typography.map(entry => `y:${entry}`),
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
    `16. Established homepage section designs (reuse them wherever the same family appears): ${
      Object.entries(language!.variants).map(([family, id]) => `${family}=${id}`).join(', ') || 'none'
    }.`,
  ].join('\n');
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
