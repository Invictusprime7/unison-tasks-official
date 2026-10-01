/** Design-system quality gates over a candidate. Advisory until real launches prove the thresholds. */

import type { AppBuildCandidateClosureIssue } from '../appBuilderContracts';
import type { DesignSourceUsageReport } from '../appBuilderGenerationContext';

export function evaluateDesignQuality(report: DesignSourceUsageReport): AppBuildCandidateClosureIssue[] {
  const issues: AppBuildCandidateClosureIssue[] = [];
  for (const pageId of report.primitiveOnlyPages) {
    issues.push({
      severity: 'advisory',
      code: 'design-source-unused',
      path: pageId,
      message: `Page ${pageId} references none of its ${report.eligiblePerPage[pageId]} eligible certified design sources.`,
    });
  }
  for (const id of report.genericFallbackIds) {
    issues.push({ severity: 'advisory', code: 'generic-implementation-used', message: `Generic implementation ${id} was used where richer ones may exist.` });
  }
  const sets = Object.entries(report.referencedPerPage).filter(([, ids]) => ids.length > 0).map(([, ids]) => ids.join('|'));
  if (sets.length > 1 && new Set(sets).size === 1) {
    issues.push({ severity: 'advisory', code: 'repeated-design-topology', message: 'Every page uses the identical set of design sources.' });
  }
  return issues;
}
