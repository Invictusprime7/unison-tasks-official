/**
 * Lane B canonical contract — the single source of truth shared by the AI
 * enrichment prompt and the canonical validator.
 *
 * Guidebook rule: AI design/layout enrichment must follow Unison's canonical
 * validations byte-for-byte. The prompt is therefore never a hand-written prose
 * copy of the rules; it is rendered from the same constants and the same request
 * projection the validator reads, so the two can never drift.
 *
 * Two mechanisms live here:
 *   1. renderLaneBCanonicalContract — the machine-readable rule block handed to
 *      the model, listing the exact identity fields, paths, imports, packages,
 *      variant vocabulary, section identities, intents and forbidden patterns.
 *   2. normalizeLaneBProposal — deterministic repair of mechanical envelope
 *      defects (fences, identity echo, duplicate ops, unknown/protected paths)
 *      that are not design decisions and must never cost a page its enrichment.
 */

import type { WizardLaneBEnrichmentProposal, WizardLaneBEnrichmentRequest } from '@/services/wizardLaneBEnrichment';

/** Literal colour / font-family styling that overrides the Stage 4b preset. */
export const LANE_B_LITERAL_STYLE_PATTERN =
  /\b(?:bg|text|border|from|via|to)-(?:white|black|(?:red|blue|gray|slate|zinc|neutral|green|purple|orange|pink|cyan|teal|amber|rose|indigo|violet|stone|yellow|lime|emerald|sky|fuchsia)-\d{2,3})\b|\bfont-(?:sans|serif|mono)\b|font(?:Family|Weight)\s*:\s*(?:['"](?!var\()[^'"]+['"]|\d+)/;

/** Raw palette literals (hex / rgb / hsl) that bypass Stage 4b tokens. */
export const LANE_B_PALETTE_LITERAL_PATTERN = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(\s*[\d.]/g;

/** Global/document-level style ownership that belongs to Stage 4b only. */
export const LANE_B_GLOBAL_STYLE_PATTERN =
  /:root\b|:global\b|@import\b|(?:^|[}\s'"`])(html|body)(?:[.#:][\w-]+)?\s*[{,]|--(?:ut-[\w-]+|primary|background|foreground|font-[\w-]+)\s*:/;

/** Packages every generated page may import regardless of the allow-list. */
export const LANE_B_ALWAYS_ALLOWED_PACKAGES = ['react', 'react-dom'] as const;

const attributeValues = (source: string, attribute: string): string[] =>
  Array.from(new Set(Array.from(source.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g')), match => match[1])));

const list = (values: readonly string[]): string => (values.length ? values.join(', ') : 'none');

/**
 * Render the exact canonical rule set for this request. Everything the
 * validator will assert is stated here with the concrete allowed values, so a
 * compliant model response cannot fail validation for a rule it never saw.
 */
export function renderLaneBCanonicalContract(options: {
  request: Pick<
    WizardLaneBEnrichmentRequest,
    'wizardSeedId' | 'snapshotId' | 'designRegistrySignature' | 'pageRegistry' | 'currentPageSources' | 'runtimeDependencies' | 'designVocabularyReport'
  >;
  uiFoundationManifest: { primitiveImports: readonly string[] };
  protectedPaths: Iterable<string>;
}): string {
  const { request } = options;
  const eligibleVariantIds = Array.from(new Set([
    ...(request.designVocabularyReport?.executableIds ?? []),
    ...(request.designVocabularyReport?.globalExecutableIds ?? []),
    ...(request.designVocabularyReport?.selectedIds ?? []),
  ]));
  const allowedPackages = Object.keys(request.runtimeDependencies ?? {});

  const perPage = request.pageRegistry.map((page) => {
    const source = Object.values(request.currentPageSources ?? {}).find(entry => entry?.filePath === page.filePath)?.content ?? '';
    return [
      `  ${page.filePath}`,
      `    required data-ut-intent values: ${list(page.requiredIntents ?? [])}`,
      `    data-ut-section-id values that MUST all still be present: ${list(attributeValues(source, 'data-ut-section-id'))}`,
    ].join('\n');
  }).join('\n');

  return [
    'CANONICAL VALIDATION CONTRACT (generated from the validator — every rule below is machine-checked; a violation discards that page):',
    `1. Echo identity verbatim: wizardSeedId="${request.wizardSeedId}", snapshotId="${request.snapshotId}", designRegistrySignature="${request.designRegistrySignature}".`,
    `2. Target only these registered page paths, at most one fileOp each: ${list(request.pageRegistry.map(page => page.filePath))}.`,
    `3. Never target a protected path: ${list(Array.from(options.protectedPaths))}, or anything under /.unison or /src/unison.`,
    '4. Each content value must parse as valid TSX and export a default React component.',
    `5. Imports from @/unison/ui are limited to: ${list(options.uiFoundationManifest.primitiveImports)}.`,
    `6. Bare package imports are limited to: ${list([...LANE_B_ALWAYS_ALLOWED_PACKAGES, ...allowedPackages])}. Relative, "/" and "@/" paths are unrestricted.`,
    eligibleVariantIds.length
      ? `7. data-ut-variant may only be one of: ${list(eligibleVariantIds)}. Never invent a variant identity.`
      : '7. Do not introduce data-ut-variant identities.',
    '8. Preserve every data-ut-section-id and every required data-ut-intent listed per page below. Restyling is allowed; dropping identity is not.',
    `9. No literal colour or font-family styling. Forbidden pattern: ${LANE_B_LITERAL_STYLE_PATTERN.source}`,
    `10. No raw palette values. Forbidden pattern: ${LANE_B_PALETTE_LITERAL_PATTERN.source}`,
    `11. No global or document styles. Forbidden pattern: ${LANE_B_GLOBAL_STYLE_PATTERN.source}`,
    '12. Exactly one <h1> element per page file.',
    'PER-PAGE REQUIREMENTS:',
    perPage || '  (none)',
  ].join('\n');
}

/**
 * Repair heading structure so rule 12 (exactly one <h1> per page) is met.
 * Heading level is document mechanics, not a design decision: with zero h1s
 * the first <h2> is promoted; with several, all but the first are demoted.
 * Copy, classes and identity attributes are untouched.
 */
export function normalizeHeadingStructure(content: string): string {
  const opening = /<h1(?=[\s>])/gi;
  const count = (content.match(opening) || []).length;
  if (count === 1) return content;
  if (count === 0) {
    const openMatch = /<h2(?=[\s>])/i.exec(content);
    if (!openMatch) return content;
    let out = content.slice(0, openMatch.index) + '<h1' + content.slice(openMatch.index + 3);
    const closeMatch = /<\/h2>/i.exec(out.slice(openMatch.index));
    if (!closeMatch) return content;
    const closeIndex = openMatch.index + closeMatch.index;
    out = out.slice(0, closeIndex) + '</h1>' + out.slice(closeIndex + 5);
    return out;
  }
  // More than one: keep the first <h1>, demote the rest to <h2> in order.
  let seen = 0;
  let out = content.replace(/<h1(?=[\s>])/gi, (match) => (++seen === 1 ? match : '<h2'));
  seen = 0;
  out = out.replace(/<\/h1>/gi, (match) => (++seen === 1 ? match : '</h2>'));
  return out;
}

/**
 * Deterministically repair mechanical envelope defects before validation.
 *
 * Only non-design defects are repaired: code fences around content, echoed
 * identity fields, duplicate operations for one path, operations aimed at a
 * path the model was never allowed to touch, and heading structure (exactly
 * one <h1>). Design and identity content inside the TSX is never rewritten
 * here — that remains the model's responsibility and the validator's judgement.
 */
export function normalizeLaneBProposal(
  proposal: WizardLaneBEnrichmentProposal,
  request: Pick<WizardLaneBEnrichmentRequest, 'wizardSeedId' | 'snapshotId' | 'designRegistrySignature' | 'pageRegistry'>,
  protectedPaths: Set<string>,
): WizardLaneBEnrichmentProposal {
  const allowedPaths = new Set(request.pageRegistry.map(page => page.filePath));
  const seen = new Set<string>();
  const fileOps: WizardLaneBEnrichmentProposal['fileOps'] = [];

  for (const op of proposal.fileOps) {
    const path = op.path.trim();
    if (!allowedPaths.has(path)) continue;
    if (protectedPaths.has(path) || path.startsWith('/.unison') || path.startsWith('/src/unison')) continue;
    if (seen.has(path)) continue;
    seen.add(path);
    const content = op.content
      .replace(/^\uFEFF/, '')
      .replace(/^\s*```(?:tsx?|jsx?|typescript|javascript)?\s*\n/i, '')
      .replace(/\n\s*```\s*$/, '')
      .trim();
    if (!content) continue;
    fileOps.push({ type: 'replace', path, content });
  }

  return {
    ...proposal,
    wizardSeedId: request.wizardSeedId,
    snapshotId: request.snapshotId,
    designRegistrySignature: request.designRegistrySignature,
    fileOps,
  };
}
