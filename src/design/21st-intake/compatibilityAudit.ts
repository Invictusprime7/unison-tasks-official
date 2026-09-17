/**
 * 21st Intake — Compatibility audit (M3).
 *
 * Static source checks: no Next-only imports, no Tailwind v4-only assumptions,
 * reduced-motion handling, responsive intent, canonical identity attributes.
 */

import { auditDependencies, type DependencyAuditResult } from './dependencyResolver';
import type { TwentyFirstComponentRecord } from './provenance';

export interface CompatibilityIssue {
  code:
    | 'next-only-import'
    | 'server-only-import'
    | 'tailwind-v4-only'
    | 'foreign-color-literal'
    | 'missing-reduced-motion'
    | 'missing-responsive'
    | 'missing-canonical-identity'
    | 'missing-alt'
    | 'dependency';
  message: string;
  severity: 'error' | 'warning';
}

export interface CompatibilityReport {
  passed: boolean;
  issues: CompatibilityIssue[];
  dependencies: DependencyAuditResult;
}

const NEXT_IMPORT = /from\s+['"]next(\/[\w-]+)?['"]/;
const SERVER_ONLY = /from\s+['"]server-only['"]|['"]use server['"]/;
/** Tailwind v4-only syntax that our v3 build cannot compile. */
const TAILWIND_V4_ONLY = /@theme\b|@import\s+['"]tailwindcss['"]|\bsize-\[/;
const HEX_LITERAL = /(?:bg|text|border|from|via|to|ring|shadow|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/;
const RAW_HEX_STYLE = /(?:color|background(?:-color)?)\s*:\s*['"]?#[0-9a-fA-F]{3,8}/;
const MOTION_USAGE = /framer-motion|animate-|transition-|@keyframes/;
const REDUCED_MOTION = /prefers-reduced-motion|useReducedMotion|motion-safe:|motion-reduce:/;
const RESPONSIVE = /\b(sm|md|lg|xl|2xl):/;
const IMG_TAG = /<img\b[^>]*>/g;

export function auditSource(
  source: string,
  record: Pick<TwentyFirstComponentRecord, 'dependencies' | 'capabilities'>,
): CompatibilityReport {
  const issues: CompatibilityIssue[] = [];

  if (NEXT_IMPORT.test(source)) {
    issues.push({ code: 'next-only-import', severity: 'error', message: 'Next.js runtime import must be adapted away' });
  }
  if (SERVER_ONLY.test(source)) {
    issues.push({ code: 'server-only-import', severity: 'error', message: 'Server-only API is not supported in generated sites' });
  }
  if (TAILWIND_V4_ONLY.test(source)) {
    issues.push({ code: 'tailwind-v4-only', severity: 'error', message: 'Tailwind v4-only syntax; Unison compiles Tailwind v3' });
  }
  if (HEX_LITERAL.test(source) || RAW_HEX_STYLE.test(source)) {
    issues.push({ code: 'foreign-color-literal', severity: 'error', message: 'Foreign color literal must map to Stage 4b semantic tokens' });
  }
  if (MOTION_USAGE.test(source) && !REDUCED_MOTION.test(source)) {
    issues.push({ code: 'missing-reduced-motion', severity: 'error', message: 'Animated source must honour reduced motion' });
  }
  if (!RESPONSIVE.test(source)) {
    issues.push({ code: 'missing-responsive', severity: 'warning', message: 'No responsive breakpoints found' });
  }
  if (!/data-ut-section-id|data-ut-slot|data-ut-implementation/.test(source)) {
    issues.push({ code: 'missing-canonical-identity', severity: 'warning', message: 'Canonical identity attributes not yet added' });
  }
  for (const tag of source.match(IMG_TAG) ?? []) {
    if (!/\balt=/.test(tag)) {
      issues.push({ code: 'missing-alt', severity: 'error', message: 'Image is missing an alt contract' });
      break;
    }
  }

  const capabilities = record.capabilities?.threeD ? ['threeD'] : [];
  const dependencies = auditDependencies(record.dependencies ?? [], capabilities);
  for (const dep of dependencies.rejected) {
    issues.push({ code: 'dependency', severity: 'error', message: `Rejected dependency: ${dep}` });
  }
  for (const dep of dependencies.unknown) {
    issues.push({ code: 'dependency', severity: 'warning', message: `Unreviewed dependency: ${dep}` });
  }

  return { passed: !issues.some((i) => i.severity === 'error'), issues, dependencies };
}
