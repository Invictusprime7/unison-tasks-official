import { describe, it, expect } from 'vitest';
import { ART_DIRECTION_PACKS } from '@/sections/variants';
import { validateTwentyFirstGenerationCoverage, summarizeCoverageReport } from '@/services/launch/twentyFirstCoverageGate';

const REQUIRED = ['navbar','hero','gallery','services','features','pricing','testimonials','faq','contact','cta','footer'];

describe('M4: every art direction pack passes the 21st coverage gate', () => {
  for (const pack of Object.values(ART_DIRECTION_PACKS) as any[]) {
    it(`pack ${pack.id}`, () => {
      const report = validateTwentyFirstGenerationCoverage({
        pages: [{ role: 'home', sectionTypes: REQUIRED as any }],
        artDirectionPack: pack,
      });
      expect(report.ok, summarizeCoverageReport(report)).toBe(true);
    });
  }
});
