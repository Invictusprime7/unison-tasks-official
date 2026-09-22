import { describe, expect, it } from 'vitest';
import {
  INDUSTRY_CREATIVE_PROFILES,
  describeIndustryDialect,
  industryCreativeProfile,
} from '@/sections/templates/industryCreativeVocabulary';
import { COMPOSITION_ROLES, isCreativelyAdditiveSection } from '@/sections/aiPageComposition';
import { PAGE_ARCHETYPES, pageArchetypeFor, resolvePageArchetype } from '@/sections/pageArchetypeContract';
import { ART_DIRECTION_PACK_IDS } from '@/sections/variants/artDirectionPacks';
import { getVariantsForSection } from '@/sections/variants/registry';
import {
  INDUSTRY_DIALECTS,
  resolvePageArchetype as edgeResolve,
} from '../../supabase/functions/_shared/pageArchetypeContract';

const INDUSTRIES = Object.keys(INDUSTRY_CREATIVE_PROFILES);

describe('industry creative vocabulary', () => {
  it('covers every canonical industry', () => {
    for (const industry of ['saas', 'salon', 'restaurant', 'local-service', 'ecommerce', 'portfolio', 'nonprofit', 'agency', 'real-estate', 'coaching']) {
      expect(INDUSTRY_CREATIVE_PROFILES[industry]).toBeDefined();
    }
  });

  it('only references registered families, roles and art direction packs', () => {
    for (const profile of Object.values(INDUSTRY_CREATIVE_PROFILES)) {
      for (const pack of profile.preferredArtDirections) expect(ART_DIRECTION_PACK_IDS).toContain(pack);
      const families = [
        ...profile.preferredFamilies,
        ...profile.discouragedFamilies,
        ...Object.values(profile.pageProfiles).flatMap(page => [
          ...(page.requiredFamilies ?? []), ...(page.preferredFamilies ?? []), ...(page.discouragedFamilies ?? []),
        ]),
      ];
      for (const family of families) expect(getVariantsForSection(family).length).toBeGreaterThan(0);
      for (const role of Object.keys(profile.pageProfiles)) expect(COMPOSITION_ROLES).toContain(role);
    }
  });

  it('resolves aliases to the canonical dialect', () => {
    expect(industryCreativeProfile('barber')?.industry).toBe('salon');
    expect(industryCreativeProfile('hvac')?.industry).toBe('local-service');
    expect(industryCreativeProfile('unknown-vertical')).toBeUndefined();
    expect(describeIndustryDialect('unknown-vertical')).toBe('');
    expect(describeIndustryDialect('salon')).toContain('INDUSTRY DIALECT');
  });

  it('never forbids a family the page role requires', () => {
    for (const industry of INDUSTRIES) {
      for (const role of COMPOSITION_ROLES) {
        const archetype = resolvePageArchetype(role, industry);
        for (const required of archetype.requiredFamilies) {
          expect(archetype.forbiddenFamilies).not.toContain(required);
        }
        expect(archetype.requiredFamilies.length).toBeLessThanOrEqual(archetype.maxBodySections);
      }
    }
  });

  it('leaves rhythm, density and unknown industries untouched', () => {
    for (const role of Object.keys(PAGE_ARCHETYPES)) {
      expect(resolvePageArchetype(role, 'unknown-vertical')).toEqual(pageArchetypeFor(role));
      const base = pageArchetypeFor(role);
      const salon = resolvePageArchetype(role, 'salon');
      expect(salon.rhythmShift).toBe(base.rhythmShift);
      expect(salon.densityShift).toBe(base.densityShift);
    }
  });

  it('applies the industry dialect (salon home leads with services and proof)', () => {
    const home = resolvePageArchetype('home', 'salon');
    expect(home.requiredFamilies).toContain('services');
    expect(home.recommendedFamilies).toEqual(expect.arrayContaining(['gallery', 'before-after']));
    expect(home.forbiddenFamilies).toContain('logo-cloud');
    expect(resolvePageArchetype('gallery', 'salon').requiredFamilies).toContain('before-after');
    expect(resolvePageArchetype('home', 'saas').requiredFamilies).toContain('features');
  });

  it('matches the edge mirror for every industry and role', () => {
    expect(Object.keys(INDUSTRY_DIALECTS).sort()).toEqual(INDUSTRIES.sort());
    for (const industry of INDUSTRIES) {
      for (const role of COMPOSITION_ROLES) {
        const client = resolvePageArchetype(role, industry);
        const edge = edgeResolve(role, industry);
        expect([...edge.requiredFamilies].sort()).toEqual([...client.requiredFamilies].sort());
        expect([...edge.forbiddenFamilies].sort()).toEqual([...client.forbiddenFamilies].sort());
        expect([...edge.forbiddenTags].sort()).toEqual([...client.forbiddenTags].sort());
        expect(edge.maxBodySections).toBe(client.maxBodySections);
      }
    }
  });

  it('makes creative additivity contract-aware, never contract-breaking', () => {
    expect(isCreativelyAdditiveSection('before-after', 'gallery', 'salon')).toBe(true);
    expect(isCreativelyAdditiveSection('pricing', 'gallery', 'portfolio')).toBe(false);
    expect(isCreativelyAdditiveSection('navbar', 'home', 'salon')).toBe(false);
    expect(isCreativelyAdditiveSection('footer', 'home', 'salon')).toBe(false);
    expect(isCreativelyAdditiveSection('hero', 'home', 'salon')).toBe(false);
    for (const industry of INDUSTRIES) {
      for (const role of COMPOSITION_ROLES) {
        for (const family of resolvePageArchetype(role, industry).forbiddenFamilies) {
          expect(isCreativelyAdditiveSection(family, role, industry)).toBe(false);
        }
      }
    }
  });
});
