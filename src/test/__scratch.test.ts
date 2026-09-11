import { describe, it } from 'vitest';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import type { WizardSelections } from '@/platform/core/playground';

const cases: Array<Partial<WizardSelections> & { label: string }> = [
  { label: 'salon', businessModel: 'appointment_service', industryOverlay: 'salon', systemType: 'booking', primaryGoal: 'book', needsBooking: true, requestedPages: ['home', 'about', 'services', 'gallery', 'booking', 'contact'], primaryIntent: 'booking.create' },
  { label: 'portfolio', businessModel: 'portfolio_creator', industryOverlay: 'portfolio', systemType: 'portfolio', primaryGoal: 'contact', requestedPages: ['home', 'about', 'gallery', 'contact'], primaryIntent: 'contact.submit' },
  { label: 'ecommerce', businessModel: 'ecommerce', industryOverlay: 'ecommerce', systemType: 'commerce', primaryGoal: 'sell', requestedPages: ['home', 'about', 'shop', 'contact'], primaryIntent: 'cart.add' },
  { label: 'saas', businessModel: 'saas_digital', industryOverlay: 'saas', systemType: 'lead', primaryGoal: 'signup', requestedPages: ['home', 'about', 'pricing', 'faq', 'contact'], primaryIntent: 'lead.submit' },
];

describe('scratch', () => {
  for (const c of cases) {
    it(c.label, () => {
      const preset = THEME_PRESETS[0];
      try {
        const r = commitToPipeline({ selections: { businessName: 'X', scaffoldMode: 'selected-pages', themePresetId: preset.id, themeTokens: themePresetToThemeTokens(preset), ...c } as WizardSelections }, 'wizard-launch');
        console.info('OK', c.label, Object.values(r.siteBundleSnapshot.pageRegistry.pages).map((p: any) => p.path));
      } catch (e: any) {
        console.error('FAIL', c.label, e.message, JSON.stringify(e.details ?? e.context ?? {}));
      }
    });
  }
});
