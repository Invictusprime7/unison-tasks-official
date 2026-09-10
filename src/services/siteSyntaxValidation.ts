/**
 * Immutable syntax validation for canonical site files.
 *
 * This module never rewrites, truncates, balances, or substitutes source. A
 * malformed compiler result is rejected and must be corrected by its owning
 * compiler stage before the SiteBundleSnapshot can be sealed.
 */
import * as Babel from '@babel/standalone';

export interface SyntaxFileReport {
  path: string;
  status: 'clean' | 'invalid';
  finalError?: string;
}

export interface SyntaxValidationResult {
  files: Record<string, string>;
  reports: SyntaxFileReport[];
  cleanCount: number;
  invalidCount: number;
}

const PARSE_OPTIONS = {
  sourceType: 'module' as const,
  plugins: ['jsx', 'typescript', 'classProperties', 'objectRestSpread'] as string[],
  errorRecovery: false,
};
const CACHE_LIMIT = 4000;
const parseCache = new Map<string, string | null>();
let cachedParser: { parse: (source: string, options: unknown) => unknown } | null | undefined;

function cacheKey(source: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${source.length}:${(hash >>> 0).toString(36)}`;
}

function resolveParser() {
  if (cachedParser === undefined) {
    cachedParser = (Babel as unknown as {
      packages?: { parser?: { parse: (source: string, options: unknown) => unknown } };
    }).packages?.parser ?? null;
  }
  return cachedParser;
}

function parseSource(source: string): string | null {
  const key = cacheKey(source);
  if (parseCache.has(key)) return parseCache.get(key) ?? null;
  let error: string | null = null;
  try {
    const parser = resolveParser();
    if (parser?.parse) parser.parse(source, PARSE_OPTIONS);
    else {
      Babel.transform(source, {
        presets: [
          ['react', { runtime: 'classic' }],
          ['typescript', { isTSX: true, allExtensions: true }],
        ],
        filename: 'site-syntax-validation.tsx',
        ast: false,
        code: false,
      });
    }
  } catch (cause) {
    error = cause instanceof Error ? cause.message : String(cause);
  }
  if (parseCache.size >= CACHE_LIMIT) parseCache.clear();
  parseCache.set(key, error);
  return error;
}

function isCodeFile(path: string): boolean {
  return /\.(tsx|jsx|ts|js)$/.test(path) && !path.includes('/node_modules/');
}

export function clearSiteSyntaxValidationCache(): void {
  parseCache.clear();
}

export function* validateSiteSyntaxSteps(
  files: Record<string, string>,
): Generator<void, SyntaxValidationResult, void> {
  const reports: SyntaxFileReport[] = [];
  let cleanCount = 0;
  let invalidCount = 0;

  for (const [path, source] of Object.entries(files)) {
    yield;
    if (typeof source !== 'string' || !isCodeFile(path)) continue;
    const error = parseSource(source);
    if (error) {
      reports.push({ path, status: 'invalid', finalError: error });
      invalidCount += 1;
    } else {
      reports.push({ path, status: 'clean' });
      cleanCount += 1;
    }
  }

  return { files, reports, cleanCount, invalidCount };
}

export function validateSiteSyntax(files: Record<string, string>): SyntaxValidationResult {
  const steps = validateSiteSyntaxSteps(files);
  let step = steps.next();
  while (!step.done) step = steps.next();
  return step.value;
}
