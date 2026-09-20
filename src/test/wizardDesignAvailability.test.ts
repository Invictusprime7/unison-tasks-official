import { describe, expect, it } from 'vitest';
import {
  getWizardSectionOptions,
  getWizardSectionPickers,
  getWizardVisualDirections,
  isWizardVisualDirectionAvailable,
  sectionTypesForSelectedPages,
  WIZARD_CORE_SECTION_TYPES,
} from '@/services/wizardDesignAvailability';
import { ART_DIRECTION_PACK_IDS } from '@/sections/variants/artDirectionPacks';
import { deriveImplementationVisualSignature } from '@/services/implementationVisualSignature';
import { getVariantById } from '@/sections/variants';

describe('V5 P3: Wizard design availability is registry-derived', () => {
  it('projects one card per registered art direction pack', () => {
    const directions = getWizardVisualDirections({ experience: 'standard' });
    expect(directions.map(option => option.id).sort()).toEqual([...ART_DIRECTION_PACK_IDS].sort());
  });

  it('every pack covers a standard launch of the core section types', () => {
    const directions = getWizardVisualDirections({ experience: 'standard', selectedPages: [] });
    const blocked = directions.filter(option => !option.available);
    expect(blocked.map(option => `${option.id}: ${option.unavailableReason}`)).toEqual([]);
    expect(sectionTypesForSelectedPages([])).toEqual(WIZARD_CORE_SECTION_TYPES);
  });

  it('selected pages widen the coverage requirement', () => {
    const types = sectionTypesForSelectedPages(['pricing', 'faq', 'about']);
    expect(types).toContain('pricing');
    expect(types).toContain('faq');
    expect(types).toContain('team');
  });

  it('section options are certified and compatible with the chosen experience', () => {
    for (const experience of ['standard', 'motion-rich', 'immersive'] as const) {
      const options = getWizardSectionOptions('hero' as never, null, experience);
      expect(options.length).toBeGreaterThan(0);
      for (const option of options) {
        const variant = getVariantById(option.variantId);
        expect(variant).toBeDefined();
        expect(variant?.source?.origin).toBe('21st');
        expect(variant?.vfs?.certification).toBe('approved');
        expect(variant?.generationStatus).toBe('preferred');
        const level = deriveImplementationVisualSignature(variant!).experienceLevel;
        if (experience === 'standard') expect(level).toBe('standard');
        if (experience === 'motion-rich') expect(level).not.toBe('immersive');
      }
    }
  });

  it('pickers only surface section types with a real choice', () => {
    const pickers = getWizardSectionPickers(null, 'standard');
    for (const picker of pickers) expect(picker.options.length).toBeGreaterThan(1);
  });

  it('availability is answerable for one explicitly selected direction', () => {
    expect(isWizardVisualDirectionAvailable(ART_DIRECTION_PACK_IDS[0], { experience: 'standard' })).toBe(true);
  });
});
