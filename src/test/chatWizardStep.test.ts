import { describe, it, expect } from 'vitest';
import { getChatWizardStep } from '@/services/launch/chatWizardStep';
import { stripSiteConfirmationMarker } from '@/components/ai/siteConfirmation';

describe('contextual chat selections', () => {
  it('uses validated metadata rather than keywords from a site summary', () => {
    expect(getChatWizardStep('Your pages include booking. What style suits you?', 'aesthetic')).toBe('aesthetic');
    expect(getChatWizardStep('Which pages do you want? <UNISON_WIZARD_STEP:pages>')).toBe('pages');
    expect(getChatWizardStep('What is your main goal?', 'invalid')).toBe('goals');
  });
  it('supports older replies and keeps protocol markers out of visible chat', () => {
    expect(getChatWizardStep('What should we call your brand?')).toBe('brand');
    expect(getChatWizardStep('Ready? <UNISON_SITE_CONFIRMATION>')).toBe('confirm');
    expect(stripSiteConfirmationMarker('Ready?\n<UNISON_WIZARD_STEP:confirm>\n<UNISON_SITE_CONFIRMATION>')).toBe('Ready?');
  });
});
