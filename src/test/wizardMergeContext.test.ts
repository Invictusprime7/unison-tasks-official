import { describe, expect, it } from 'vitest';
import {
  assertWizardMergeContextMatchesSelections,
  buildPublicBusinessContext,
  createWizardMergeContext,
  resolveWizardIndustryOverlay,
} from '@/services/wizardMergeContext';
import type { BusinessProfileDTO } from '@/types/businessProfile';

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
    ['local-service', 'local-service'],
    ['real-estate', 'real_estate'],
    ['store', 'ecommerce'],
    ['saas', 'saas'],
  ] as const)('normalizes %s to %s', (input, expected) => {
    expect(resolveWizardIndustryOverlay({ templateIndustry: input })).toBe(expected);
  });

  it('exposes only public Business Profile fields to deterministic launch context', () => {
    const profile: BusinessProfileDTO = {
      businessId: 'business-1',
      ownerId: 'owner-secret',
      name: 'Northstar Dental',
      industry: 'dental',
      tagline: 'Calm, modern care',
      email: 'hello@example.com',
      notificationEmail: 'private-alerts@example.com',
      notificationPhone: '+15550009999',
      timezone: 'America/New_York',
      address: { city: 'Boston', region: 'MA' },
      hours: [{ day: 'mon', open: '09:00', close: '17:00' }],
      socialLinks: { instagram: 'https://instagram.com/northstar' },
      settings: { privateApiKey: 'never-share' },
    };

    const publicContext = buildPublicBusinessContext(profile);

    expect(publicContext).toMatchObject({
      name: 'Northstar Dental',
      industry: 'dental',
      email: 'hello@example.com',
    });
    expect(publicContext).not.toHaveProperty('businessId');
    expect(publicContext).not.toHaveProperty('ownerId');
    expect(publicContext).not.toHaveProperty('notificationEmail');
    expect(publicContext).not.toHaveProperty('notificationPhone');
    expect(publicContext).not.toHaveProperty('settings');
    expect(JSON.stringify(publicContext)).not.toContain('never-share');
  });
});
