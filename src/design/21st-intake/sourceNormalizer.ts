/**
 * 21st Intake — Import + identity normalization (M3, Steps 4 and 6).
 */

import { normalizeTokens } from './tokenAdapter';

export interface CanonicalIdentity {
  sectionId?: string;
  artifact?: string;
  implementation?: string;
}

export interface NormalizationResult {
  source: string;
  notes: string[];
}

const NEXT_IMAGE_IMPORT = /^\s*import\s+\w+\s+from\s+['"]next\/image['"];?\s*$/gm;
const NEXT_LINK_IMPORT = /^\s*import\s+\w+\s+from\s+['"]next\/link['"];?\s*$/gm;
const NEXT_DIRECTIVE = /^\s*['"]use client['"];?\s*$/gm;
const SERVER_DIRECTIVE = /^\s*['"]use server['"];?\s*$/gm;

/** Step 4 — replace foreign infrastructure imports with supported equivalents. */
export function normalizeImports(input: string): NormalizationResult {
  const notes: string[] = [];
  let source = input;

  if (NEXT_DIRECTIVE.test(source)) {
    source = source.replace(NEXT_DIRECTIVE, '');
    notes.push('removed "use client" directive');
  }
  if (SERVER_DIRECTIVE.test(source)) {
    source = source.replace(SERVER_DIRECTIVE, '');
    notes.push('removed "use server" directive');
  }
  if (NEXT_IMAGE_IMPORT.test(source)) {
    source = source.replace(NEXT_IMAGE_IMPORT, '');
    notes.push('removed next/image import');
  }
  if (NEXT_LINK_IMPORT.test(source)) {
    source = source.replace(NEXT_LINK_IMPORT, '');
    notes.push('removed next/link import');
  }

  if (/<Image\b/.test(source)) {
    source = source.replace(/<Image\b/g, '<img').replace(/<\/Image>/g, '</img>');
    notes.push('mapped <Image> to <img>');
  }
  if (/<Link\b/.test(source)) {
    source = source.replace(/<Link\b/g, '<a').replace(/<\/Link>/g, '</a>');
    source = source.replace(/<a([^>]*?)\shref=/g, '<a$1 href=');
    notes.push('mapped <Link> to <a>');
  }
  if (/from ['"]react-icons/.test(source) || /from ['"]@heroicons/.test(source)) {
    source = source.replace(/from ['"](?:react-icons[^'"]*|@heroicons[^'"]*)['"]/g, "from 'lucide-react'");
    notes.push('redirected foreign icon imports to lucide-react');
  }

  return { source: source.replace(/\n{3,}/g, '\n\n'), notes };
}

/** Step 6 — stamp canonical Unison identity onto the outermost element. */
export function applyCanonicalIdentity(input: string, identity: CanonicalIdentity): NormalizationResult {
  const notes: string[] = [];
  const attrs: string[] = [];
  if (identity.sectionId) attrs.push(`data-ut-section-id="${identity.sectionId}"`);
  if (identity.artifact) attrs.push(`data-ut-artifact="${identity.artifact}"`);
  if (identity.implementation) attrs.push(`data-ut-implementation="${identity.implementation}"`);
  if (attrs.length === 0) return { source: input, notes };

  const match = input.match(/<(section|div|header|footer|nav|main|article|aside)\b/);
  if (!match || match.index === undefined) {
    notes.push('no root element found — identity not applied');
    return { source: input, notes };
  }
  if (/data-ut-section-id=/.test(input)) {
    notes.push('canonical identity already present');
    return { source: input, notes };
  }

  const insertAt = match.index + match[0].length;
  notes.push(`stamped ${attrs.length} canonical identity attribute(s)`);
  return { source: `${input.slice(0, insertAt)} ${attrs.join(' ')}${input.slice(insertAt)}`, notes };
}

/** Steps 4 + 5 + 6 in canonical order. */
export function normalizeSource(input: string, identity: CanonicalIdentity = {}): NormalizationResult {
  const imports = normalizeImports(input);
  const tokens = normalizeTokens(imports.source);
  const identified = applyCanonicalIdentity(tokens.source, identity);
  return {
    source: identified.source,
    notes: [
      ...imports.notes,
      ...(tokens.replacements.length ? [`normalized ${tokens.replacements.length} foreign token(s)`] : []),
      ...(tokens.remainingLiterals.length
        ? [`unresolved color literal(s): ${tokens.remainingLiterals.join(', ')}`]
        : []),
      ...identified.notes,
    ],
  };
}
