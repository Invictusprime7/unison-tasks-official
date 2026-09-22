/**
 * Edge mirror of the compiled site design contract projection.
 *
 * The contract is compiled once on the client (src/services/launch/siteDesignContract.ts)
 * and transported with the brief. This module only reads that projection — it
 * never recompiles one, so there is no second authority to drift from. The
 * `projectionDensityIssues` body below is byte-for-byte identical to the client
 * function and is drift-tested.
 */

export interface SiteDesignContractProjection {
  version: '1.0';
  industry: string;
  artDirectionPackId: string;
  negativeVocabularyEnforced: boolean;
  chromeFamilies: string[];
  summary: string;
  pages: Record<string, { required: string[]; min: number; max: number }>;
}

export function projectionDensityIssues(
  projection: SiteDesignContractProjection | undefined,
  role: string,
  sectionOrder: readonly string[],
): { hard: string[]; advisory: string[] } {
  const page = projection?.pages[role];
  if (!page) return { hard: [], advisory: [] };
  const chrome = new Set(projection!.chromeFamilies);
  const body = sectionOrder.filter(family => !chrome.has(family));
  const hard: string[] = [];
  const advisory: string[] = [];
  if (body.length < page.min) hard.push(`pages.${role}: at least ${page.min} body sections`);
  if (body.length > page.max) hard.push(`pages.${role}: at most ${page.max} body sections`);
  for (const required of page.required) {
    if (!sectionOrder.includes(required)) {
      advisory.push(`pages.${role}: a ${role} page must prove its ${required} role`);
    }
  }
  return { hard, advisory };
}
