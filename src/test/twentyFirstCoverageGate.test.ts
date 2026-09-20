import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { ART_DIRECTION_PACKS, getGenerationVariantsForSection } from '@/sections/variants';
import { getAllSections } from '@/sections/registry';
import {
  resolveComponentStateContract,
  componentStateContractIssues,
  BASELINE_COMPONENT_STATES,
} from '@/sections/variants/componentStates';
import { validateTwentyFirstGenerationCoverage, summarizeCoverageReport } from '@/services/launch/twentyFirstCoverageGate';
import { buildWizardAggregatedRegistryContext } from '@/services/launch/wizardRegistryAggregation';
import type { SectionType } from '@/sections/types';

const SECTION_TYPES = Object.keys(getAllSections()) as SectionType[];

describe('V4 M5 — 21st generation coverage gate', () => {
  it('passes for every art direction pack across every registered section', () => {
    for (const pack of Object.values(ART_DIRECTION_PACKS)) {
      const report = validateTwentyFirstGenerationCoverage({
        pages: [{ role: 'home', sectionTypes: SECTION_TYPES }],
        artDirectionPack: pack,
      });
      expect(report.issues, pack.id).toEqual([]);
      expect(report.ok, pack.id).toBe(true);
      expect(report.sections.length).toBe(SECTION_TYPES.length);
      expect(summarizeCoverageReport(report)).toContain('verified');
    }
  });

  it('rejects a selected variant that is not eligible for the role and pack', () => {
    const pack = ART_DIRECTION_PACKS['soft-editorial'];
    const report = validateTwentyFirstGenerationCoverage({
      pages: [{ role: 'home', sectionTypes: ['hero'] }],
      artDirectionPack: pack,
      selectedVariants: { 'home:hero': 'hero:not-a-real-variant' as never },
    });
    expect(report.ok).toBe(false);
    expect(report.issues.join(' ')).toContain('not registered');
    expect(summarizeCoverageReport(report)).toContain('incomplete');
  });

  it('runs before Stage 4b in the launch orchestrator and only degrades', () => {
    const source = fs.readFileSync('src/services/launch/launchOrchestrator.ts', 'utf8');
    const gateAt = source.indexOf('validateTwentyFirstGenerationCoverage({');
    const stage4bAt = source.indexOf('await runWizardStage4b({');
    expect(gateAt).toBeGreaterThan(-1);
    expect(gateAt).toBeLessThan(stage4bAt);
    expect(source).toContain("run.degrade('seed', 'coverage.21st-incomplete'");
    expect(source.slice(gateAt, stage4bAt)).not.toContain('throw');
  });
});

describe('V4 M6 — component states are first-class', () => {
  it('documents states, interaction posture and responsive coverage for every eligible implementation', () => {
    for (const type of SECTION_TYPES) {
      for (const variant of getGenerationVariantsForSection(type)) {
        const contract = resolveComponentStateContract(variant);
        expect(componentStateContractIssues(variant), variant.id).toEqual([]);
        for (const state of BASELINE_COMPONENT_STATES) expect(contract.supported).toContain(state);
        expect(contract.responsive).toContain('reduced-motion');
        expect(contract.interaction.reducedMotion).toBeTruthy();
      }
    }
  });

  it('exposes component states to the AI layers through the wizard registry context', () => {
    const context = buildWizardAggregatedRegistryContext({
      industry: 'store',
      templateId: 'store-premium',
      themePresetId: 'midnight',
    });
    expect(context.implementations?.length).toBeGreaterThan(0);
    for (const implementation of context.implementations ?? []) {
      expect(implementation.componentStates?.supported, implementation.id).toContain('default');
      expect(implementation.componentStates?.responsive).toContain('reduced-motion');
    }
  });
});
