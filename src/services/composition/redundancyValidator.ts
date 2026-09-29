import { compositionSimilarity } from './compositionSimilarity';
import type { CompositionSignature, RedundancyIssue, SiteVisualMemoryEntry } from './types';

export const REDUNDANCY_THRESHOLD = 0.8;

/** Flags a page whose topology nearly duplicates an already committed page. */
export function findRedundancy(
  pageId: string,
  signature: CompositionSignature,
  memory: readonly SiteVisualMemoryEntry[],
  threshold = REDUNDANCY_THRESHOLD,
): RedundancyIssue | null {
  if (signature.sectionOrder.length < 2) return null;
  let worst: RedundancyIssue | null = null;
  for (const entry of memory) {
    if (entry.pageId === pageId) continue;
    const similarity = compositionSimilarity(signature, entry.signature);
    if (similarity >= threshold && (!worst || similarity > worst.similarity)) {
      worst = {
        pageId,
        conflictsWith: entry.pageId,
        similarity,
        reason: `Same topology as the ${entry.role} page (hero ${entry.signature.hero}, sections ${entry.signature.sectionOrder.join(' → ')}).`,
      };
    }
  }
  return worst;
}
