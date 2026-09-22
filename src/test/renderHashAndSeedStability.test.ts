/**
 * P1 — compiler-first Wizard authority.
 *
 * • The same wizard answers compile the same design on every launch: launch
 *   identity (wizardSeedId) is never a design input.
 * • An intentional regeneration nonce is the only token that moves the design.
 * • The render hash is a stable fingerprint of the rendered site.
 */

import { describe, expect, it } from 'vitest';

import { computeRenderHash, deriveDesignSeed } from '@/platform/core/generationSeed';
import { buildWizardDesignIntervention } from '@/services/wizardDesignIntervention';

const ANSWERS = {
  businessName: 'Northstar Salon',
  businessModel: 'appointment_service' as const,
  industryOverlay: 'salon' as const,
  templateId: 'salon-premium',
  themePresetId: 'organic',
  primaryGoal: 'book',
  requestedPages: ['home', 'services', 'contact'],
  projectId: 'business-1',
  needsBooking: true,
};

describe('render hash + design seed stability', () => {
  it('ignores the per-launch identity so the same answers compile the same design', () => {
    const first = buildWizardDesignIntervention({ ...ANSWERS, wizardSeedId: 'ws_random_one' });
    const second = buildWizardDesignIntervention({ ...ANSWERS, wizardSeedId: 'ws_random_two' });

    expect(first.seed).toBe(second.seed);
    expect(first.activeVariants).toEqual(second.activeVariants);
    expect(first.artDirectionPackId).toBe(second.artDirectionPackId);
  });

  it('moves the design only for an intentional regeneration', () => {
    const base = buildWizardDesignIntervention(ANSWERS);
    const again = buildWizardDesignIntervention({ ...ANSWERS, regenerationNonce: 'take-2' });

    expect(again.seed).not.toBe(base.seed);
  });

  it('derives the same seed for reordered list answers', () => {
    expect(deriveDesignSeed({ ...ANSWERS, industry: 'salon', requestedPages: ['contact', 'home', 'services'] }))
      .toBe(deriveDesignSeed({ ...ANSWERS, industry: 'salon' }));
  });

  it('fingerprints the rendered site independently of key order', () => {
    const a = computeRenderHash({ seed: 's', pages: ['home'], pack: 'noir-atelier' });
    const b = computeRenderHash({ pack: 'noir-atelier', pages: ['home'], seed: 's' });
    const c = computeRenderHash({ seed: 's', pages: ['home', 'about'], pack: 'noir-atelier' });

    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^rh_[0-9a-f]{8}$/);
  });

  it('is stamped into the compiled snapshot metadata', async () => {
    const source = await import('node:fs').then((fs) =>
      fs.readFileSync('src/platform/core/canonicalPipeline.ts', 'utf8'),
    );
    expect(source).toContain('renderHash?: string;');
    expect(source).toMatch(/renderHash: \(\(\) => \{/);
  });
});
