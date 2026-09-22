import { describe, expect, it } from 'vitest';
import {
  DESIGN_VOCABULARY,
  type VocabularyCategory,
} from '@/platform/core/designVocabulary';
import {
  GENERATED_BACKGROUND_PRIMITIVES,
  GENERATED_MOTION_PRIMITIVES,
} from '@/platform/core/generatedUiFoundation';
import {
  buildExecutableVocabularyReport,
  isOfferableVocabulary,
  resolveVocabularyExecution,
  VOCABULARY_PRIMITIVE_RECIPES,
} from '@/services/launch/executableVocabulary';
import { resolveExperienceEnvelope } from '@/services/experienceCapabilityResolver';
import type { BusinessModel } from '@/types/playground';

const MODELS: BusinessModel[] = [
  'portfolio_creator',
  'ecommerce',
  'saas_digital',
  'appointment_service',
  'quote_lead',
  'restaurant_hospitality',
  'nonprofit',
  'general',
];

const INDUSTRIES = [
  'salon', 'contractor', 'ecommerce', 'saas', 'agency', 'restaurant',
  'nonprofit', 'coaching', 'realestate', 'fitness', 'photography',
] as const;

const STYLE_INTENTS = [null, 'bold', 'minimal', 'premium'] as const;

const CANDIDATE_KEYS = [
  ['hero', 'heroCandidates'],
  ['content', 'contentCandidates'],
  ['media', 'mediaCandidates'],
  ['background', 'backgroundCandidates'],
  ['commerce', 'commerceCandidates'],
  ['motion', 'motionCandidates'],
  ['navigation', 'navigationCandidates'],
] as const;

describe('executable vocabulary authority', () => {
  it('only names primitive recipes the generated foundation actually emits', () => {
    const emitted = new Set<string>([
      ...GENERATED_MOTION_PRIMITIVES,
      ...GENERATED_BACKGROUND_PRIMITIVES,
    ]);
    for (const [key, names] of Object.entries(VOCABULARY_PRIMITIVE_RECIPES)) {
      for (const name of names) {
        expect(emitted.has(name), `${key} claims unemitted primitive ${name}`).toBe(true);
      }
    }
  });

  it('classifies every vocabulary entry exactly once', () => {
    const report = buildExecutableVocabularyReport();
    const classified = [
      ...report.byKind.implementation,
      ...report.byKind.adapter,
      ...report.byKind.primitive,
      ...report.unexecutable.map((item) => item.key),
    ];
    expect(classified.length).toBe(report.total);
    expect(new Set(classified).size).toBe(report.total);
  });

  it('leaves no vocabulary category without an executable entry', () => {
    expect(buildExecutableVocabularyReport().emptyCategories).toEqual([]);
  });

  it('keeps asset-dependent 3D entries out of the offerable set', () => {
    expect(resolveVocabularyExecution({ category: 'media', id: '3d-viewer' }).reason)
      .toBe('asset-dependency');
    expect(isOfferableVocabulary({ category: 'media', id: '3d-viewer' })).toBe(false);
  });

  it('reports the remaining Phase 5 backlog and shrinks, never widens', () => {
    const report = buildExecutableVocabularyReport();
    // Closing the gap means registering an implementation, adapter or recipe —
    // never deleting a vocabulary entry, so `total` must stay put.
    expect(report.total).toBe(DESIGN_VOCABULARY.length);
    expect(report.unexecutable.map((item) => item.key)).not.toContain('hero:split-cinematic');
    expect(report.unexecutable.length).toBeLessThan(report.total / 2);
  });
});

describe('launcher vocabulary closure across every industry', () => {
  const inputs = MODELS.flatMap((businessModel) =>
    INDUSTRIES.flatMap((industry) =>
      STYLE_INTENTS.map((styleIntent) => ({
        seed: `${businessModel}-${industry}-${styleIntent ?? 'default'}`,
        businessModel,
        industry,
        styleIntent,
        sellsProducts: businessModel === 'ecommerce',
        needsBooking: businessModel === 'appointment_service',
        wantsLeadCapture: businessModel === 'quote_lead',
      })),
    ),
  );

  it('never offers a candidate the compiler cannot build', () => {
    const offences: string[] = [];
    for (const input of inputs) {
      const envelope = resolveExperienceEnvelope(input);
      for (const [category, field] of CANDIDATE_KEYS) {
        for (const id of envelope[field]) {
          if (!isOfferableVocabulary({ category: category as VocabularyCategory, id })) {
            offences.push(`${input.businessModel}/${input.industry}: ${category}:${id}`);
          }
        }
      }
    }
    expect(offences).toEqual([]);
  });

  it('still leaves every industry a real choice in the core categories', () => {
    for (const input of inputs) {
      const envelope = resolveExperienceEnvelope(input);
      for (const field of ['heroCandidates', 'contentCandidates', 'mediaCandidates', 'navigationCandidates', 'motionCandidates'] as const) {
        expect(envelope[field].length, `${input.businessModel}/${input.industry} has no ${field}`)
          .toBeGreaterThan(0);
      }
    }
  });

  it('offers commerce vocabulary only to commerce launches, and only buildable ones', () => {
    const store = resolveExperienceEnvelope({ seed: 's', businessModel: 'ecommerce', industry: 'ecommerce', sellsProducts: true });
    const salon = resolveExperienceEnvelope({ seed: 's', businessModel: 'appointment_service', industry: 'salon', needsBooking: true });
    expect(store.commerceCandidates.length).toBeGreaterThan(0);
    expect(salon.commerceCandidates).toEqual([]);
    for (const id of store.commerceCandidates) {
      expect(isOfferableVocabulary({ category: 'commerce', id })).toBe(true);
    }
  });
});
