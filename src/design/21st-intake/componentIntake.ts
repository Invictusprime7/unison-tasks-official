/**
 * 21st Intake — Lifecycle + portable certification workflow (M3).
 *
 * Runs the ten-step lifecycle over a quarantined source and decides whether it
 * may be promoted into `VARIANT_REGISTRY` as a first-class Unison
 * implementation. Nothing here executes at site runtime.
 */

import { auditSource, type CompatibilityReport } from './compatibilityAudit';
import { normalizeSource, type CanonicalIdentity } from './sourceNormalizer';
import {
  assertProvenance,
  toVisualSourceMetadata,
  type TwentyFirstComponentRecord,
  type VisualSourceMetadata,
} from './provenance';

export type IntakeStep =
  | 'discover'
  | 'quarantine'
  | 'dependency-audit'
  | 'import-normalization'
  | 'theme-normalization'
  | 'canonical-identity'
  | 'a11y-responsive-audit'
  | 'portable-certification'
  | 'promote'
  | 'delete-duplicate';

export const INTAKE_STEPS: readonly IntakeStep[] = [
  'discover',
  'quarantine',
  'dependency-audit',
  'import-normalization',
  'theme-normalization',
  'canonical-identity',
  'a11y-responsive-audit',
  'portable-certification',
  'promote',
  'delete-duplicate',
];

export interface IntakeInput {
  record: TwentyFirstComponentRecord;
  source: string;
  identity?: CanonicalIdentity;
}

export interface IntakeResult {
  /** Normalized, Unison-owned source. */
  source: string;
  record: TwentyFirstComponentRecord;
  report: CompatibilityReport;
  notes: string[];
  blockers: string[];
  /** True only when the source may be promoted to a canonical family. */
  certified: boolean;
  visualSource?: VisualSourceMetadata;
}

/**
 * Steps 3 through 8. Certification is refused whenever provenance is
 * incomplete or the compatibility audit reports an error.
 */
export function runIntake({ record, source, identity = {} }: IntakeInput): IntakeResult {
  const blockers = assertProvenance(record);
  const normalized = normalizeSource(source, identity);
  const report = auditSource(normalized.source, record);

  for (const issue of report.issues) {
    if (issue.severity === 'error') blockers.push(issue.message);
  }

  const certified = blockers.length === 0;
  const adaptation: TwentyFirstComponentRecord['adaptation'] = {
    ...record.adaptation,
    importsNormalized: true,
    tokensNormalized: !report.issues.some((i) => i.code === 'foreign-color-literal'),
    reducedMotionSupported: !report.issues.some((i) => i.code === 'missing-reduced-motion'),
    responsiveVerified: !report.issues.some((i) => i.code === 'missing-responsive'),
    canonicalSlotsAdded: /data-ut-slot|data-ut-section-id/.test(normalized.source),
    intentReady: /data-ut-intent/.test(normalized.source),
    portableRecipeCertified: certified,
  };

  return {
    source: normalized.source,
    record: { ...record, adaptation, step: certified ? 8 : Math.max(record.step ?? 2, 3) },
    report,
    notes: normalized.notes,
    blockers,
    certified,
    visualSource: certified ? toVisualSourceMetadata(record) : undefined,
  };
}

/**
 * Step 9 — the promotion contract. A certified source becomes a Unison
 * implementation with 21st provenance; the Launch Wizard never special-cases it.
 */
export interface PromotionPlan {
  implementationId: string;
  targetPath: string;
  registryPath: string;
  vfs: { mode: 'portable-recipe'; certification: 'approved' };
  visualSource: VisualSourceMetadata;
  /** Step 10 — the quarantine copy that must be deleted after promotion. */
  deleteIntakePath: string;
}

export function planPromotion(
  result: IntakeResult,
  target: { sectionType: string; slug: string; componentName: string },
): PromotionPlan {
  const provenanceIssues = assertProvenance(result.record);
  if (!result.certified || !result.visualSource || provenanceIssues.length) {
    throw new Error(
      `[21st-intake] "${result.record.sourceId}" is not certified: ${[...result.blockers, ...provenanceIssues].join('; ') || 'unknown blocker'}`,
    );
  }
  return {
    implementationId: `${target.sectionType}:${target.slug}`,
    targetPath: `src/sections/variants/${target.sectionType}/${target.componentName}.tsx`,
    registryPath: 'src/sections/variants/registry.ts',
    vfs: { mode: 'portable-recipe', certification: 'approved' },
    visualSource: result.visualSource,
    deleteIntakePath: `src/design/21st-intake/imported/${result.record.sourceId}/`,
  };
}
