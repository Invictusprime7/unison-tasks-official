import { describe, expect, it } from 'vitest';
import {
  assertWizardMergeContextMatchesSelections,
  createWizardMergeContext,
  resolveWizardIndustryOverlay,
} from '@/services/wizardMergeContext';

describe('Wizard merge industry authority', () => {
  it('lets the selected template specialize a broad booking-system default', () => {
    const industryOverlay = resolveWizardIndustryOverlay({
      templateIndustry: 'restaurant',
      generationIndustry: 'restaurant',
      systemIndustry: 'salon',
    });
    const context = createWizardMergeContext({
      industry: industryOverlay,
      templateId: 'restaurant-premium',
      themePresetId: 'editorial',
    });

    expect(industryOverlay).toBe('restaurant');
    expect(() => assertWizardMergeContextMatchesSelections(context, {
      industryOverlay,
      templateId: 'restaurant-premium',
      themePresetId: 'editorial',
    })).not.toThrow();
  });

  it.each([
    ['local-service', 'contractor'],
    ['real-estate', 'real_estate'],
    ['store', 'ecommerce'],
    ['saas', 'saas'],
  ] as const)('normalizes %s to %s', (input, expected) => {
    expect(resolveWizardIndustryOverlay({ templateIndustry: input })).toBe(expected);
  });
});
