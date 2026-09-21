/**
 * Canonical Closure — Phase 1: typed Builder request ontology.
 *
 * Invariant F (presentation/backend separation):
 *   A presentation-only request never requires an unrelated backend capability.
 *
 * Design traits ("modern", "premium"), experience features ("motion.marquee")
 * and outcome language ("easier_to_book") are separate request domains from
 * canonical business capability ids, and only the latter may reach backend
 * capability-pack verification.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  heuristicEnvelope,
  normalizeEnvelope,
} from '@/types/builderRequestEnvelope';
import {
  BUSINESS_CAPABILITIES,
  classifyBuilderRequestTerm,
} from '@/platform/core/businessCapabilityVocabulary';
import { ABSTRACT_GOALS } from '@/platform/core/abstractGoalRegistry';
import { normalizeBusinessCapability } from '@/services/capabilityInterpretation';

describe('typed request domains', () => {
  it('classifies design language as a design trait, never a capability', () => {
    for (const term of ['modern', 'premium', 'editorial-spacing', 'generous-whitespace']) {
      expect(classifyBuilderRequestTerm(term).domain).toBe('design');
    }
  });

  it('classifies motion/immersive language as an experience feature', () => {
    for (const term of ['motion.marquee', 'parallax', 'horizontal moving banner marquee']) {
      expect(classifyBuilderRequestTerm(term).domain).toBe('experience');
    }
  });

  it('classifies canonical capability ids and their aliases as capabilities', () => {
    expect(classifyBuilderRequestTerm('booking.appointments')).toEqual({
      domain: 'capability',
      value: 'booking.appointments',
    });
    expect(classifyBuilderRequestTerm('checkout')).toEqual({
      domain: 'capability',
      value: 'commerce.checkout',
    });
  });
});

describe('normalizeEnvelope typed projections', () => {
  it('splits a legacy requestedCapabilities array into typed domains', () => {
    const envelope = normalizeEnvelope({
      summary: 'make it premium and modern, and let customers book',
      requestedCapabilities: [
        'modern',
        'premium',
        'motion.marquee',
        'booking.appointments',
        'clear product hierarchy',
      ],
    });

    expect(envelope.requestedBusinessCapabilities).toEqual(['booking.appointments']);
    expect(envelope.designTraits).toEqual(expect.arrayContaining(['modern', 'premium']));
    expect(envelope.experienceFeatures).toContain('motion.marquee');
    expect(envelope.requestedCapabilities).toEqual(['booking.appointments']);
  });

  it('drops capability ids that are not in the canonical vocabulary', () => {
    const envelope = normalizeEnvelope({
      requestedBusinessCapabilities: ['booking.appointments', 'teleportation.beam'],
    });
    expect(envelope.requestedBusinessCapabilities).toEqual(['booking.appointments']);
  });

  it('keeps a purely presentational request free of business capabilities', () => {
    const envelope = heuristicEnvelope('add a hero background to all pages', {
      hasExistingTemplate: true,
    });
    expect(envelope.requestedBusinessCapabilities).toEqual([]);
    expect(envelope.requestedCapabilities).toEqual([]);
  });
});

describe('abstract goal ontology', () => {
  it('only emits canonical capability ids', () => {
    for (const goal of Object.values(ABSTRACT_GOALS)) {
      for (const capability of goal.capabilities ?? []) {
        expect(
          normalizeBusinessCapability(capability),
          `${goal.id} → ${capability}`,
        ).not.toBeNull();
      }
    }
  });

  it('keeps visual outcomes as design traits with no capabilities', () => {
    for (const id of ['premium', 'modern', 'trustworthy']) {
      expect(ABSTRACT_GOALS[id].capabilities ?? []).toEqual([]);
      expect(ABSTRACT_GOALS[id].designTraits?.length).toBeGreaterThan(0);
    }
  });
});

describe('edge vocabulary mirror', () => {
  it('matches the client vocabulary exactly', () => {
    const mirror = readFileSync(
      resolve(process.cwd(), 'supabase/functions/_shared/businessCapabilityVocabulary.ts'),
      'utf8',
    );
    const ids = [...mirror.matchAll(/^\s{2}"([a-z_.]+)",$/gm)].map((m) => m[1]);
    expect(ids).toEqual(BUSINESS_CAPABILITIES);
  });
});
