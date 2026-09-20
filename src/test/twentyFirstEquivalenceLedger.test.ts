/**
 * Phase A gate — 21st equivalence ledger.
 *
 * The ledger is a projection, so these tests assert two invariants that must
 * never regress while the migration runs:
 *   1. every art direction pack family keeps at least one certified design;
 *   2. the certified design count per section family never drops.
 */

import { describe, expect, it } from 'vitest';
import {
  buildEquivalenceLedger,
  eligibleCountsBySection,
  equivalenceBlockers,
  isEquivalent,
  summarizeEquivalenceLedger,
} from '@/services/design/equivalenceLedger';
import { getGenerationVariantsForSection, VARIANT_REGISTRY } from '@/sections/variants';
import { getAllSections } from '@/sections/registry';
import type { SectionType } from '@/sections/types';

/** Certified designs per family as of the Phase A audit. Raise, never lower. */
const BASELINE_ELIGIBLE: Record<string, number> = {
  navbar: 5, hero: 3, services: 4, features: 1, pricing: 3, testimonials: 2,
  team: 1, gallery: 1, faq: 2, cta: 2, contact: 3, footer: 1, stats: 2,
  about: 1, 'logo-cloud': 1, 'blog-preview': 1, 'before-after': 1,
};

describe('21st equivalence ledger (Phase A)', () => {
  const report = buildEquivalenceLedger();

  it('agrees exactly with the generation eligibility rule', () => {
    for (const type of Object.keys(getAllSections()) as SectionType[]) {
      const fromRegistry = getGenerationVariantsForSection(type).map((v) => v.id).sort();
      const fromLedger = report.entries.filter((e) => e.sectionType === type && e.eligible)
        .map((e) => e.id).sort();
      expect(fromLedger, type).toEqual(fromRegistry);
    }
  });

  it('records a blocker for every design that is not yet certified', () => {
    for (const entry of report.entries) {
      expect(entry.blockers.length === 0, entry.id).toBe(entry.eligible);
    }
    for (const variants of Object.values(VARIANT_REGISTRY)) {
      for (const variant of variants ?? []) {
        expect(isEquivalent(variant), variant.id).toBe(equivalenceBlockers(variant).length === 0);
      }
    }
  });

  it('keeps every declared pack family covered by a certified design', () => {
    expect(report.removalBlockers.map((c) => `${c.packId}/${c.sectionType}`)).toEqual([]);
    for (const cell of report.matrix) {
      expect(cell.eligible.length, `${cell.packId}/${cell.sectionType}`).toBeGreaterThan(0);
    }
  });

  it('never regresses certified coverage per section family', () => {
    const counts = eligibleCountsBySection(report);
    for (const [type, baseline] of Object.entries(BASELINE_ELIGIBLE)) {
      expect(counts[type] ?? 0, type).toBeGreaterThanOrEqual(baseline);
    }
    expect(report.totals.familiesCovered).toBe(report.totals.familiesTotal);
    expect(summarizeEquivalenceLedger(report)).toContain('legacy removal safe');
  });
});
