import { describe, it } from 'vitest';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';
import type { WizardSelections } from '@/platform/core/playground';

const cases: Array<Partial<WizardSelections> & { label: string }> = [
  { label: 'restaurant', businessModel: 'appointment_service', industryOverlay: 'restaurant', systemType: 'booking', primaryGoal: 'book', needsBooking: true, requestedPages: ['home', 'about', 'services', 'gallery', 'contact'], primaryIntent: 'booking.create' },
  { label: 'contractor', businessModel: 'quote_lead', industryOverlay: 'contractor', systemType: 'lead', primaryGoal: 'contact', wantsLeadCapture: true, requestedPages: ['home', 'about', 'services', 'gallery', 'contact'], primaryIntent: 'lead.submit' },
  { label: 'coaching', businessModel: 'appointment_service', industryOverlay: 'coaching', systemType: 'booking', primaryGoal: 'book', needsBooking: true, requestedPages: ['home', 'about', 'services', 'pricing', 'booking', 'contact'], primaryIntent: 'booking.create' },
  { label: 'nonprofit', businessModel: 'quote_lead', industryOverlay: 'nonprofit', systemType: 'lead', primaryGoal: 'contact', wantsLeadCapture: true, requestedPages: ['home', 'about', 'services', 'contact'], primaryIntent: 'donation.start' },
  { label: 'agency', businessModel: 'quote_lead', industryOverlay: 'agency', systemType: 'lead', primaryGoal: 'contact', wantsLeadCapture: true, requestedPages: ['home', 'about', 'services', 'contact', 'faq'], primaryIntent: 'lead.submit' },
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
