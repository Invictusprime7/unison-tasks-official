import { describe, expect, it } from 'vitest';
import {
  compileSiteDesignContract,
  projectSiteDesignContract,
  projectionDensityIssues,
} from '@/services/launch/siteDesignContract';
import {
  projectionDensityIssues as edgeProjectionDensityIssues,
} from '../../supabase/functions/_shared/siteDesignContractProjection';
import { renderCompositionCanonicalContract } from '@/services/launch/compositionCanonicalContract';
import { COMPOSITION_ROLES } from '@/sections/aiPageComposition';
import { INDUSTRY_CREATIVE_KEYS } from '@/sections/templates/industryCreativeVocabulary';

const ROLES = [...COMPOSITION_ROLES];
const projectionFor = (industry: string) =>
  projectSiteDesignContract(compileSiteDesignContract({ industry, roles: ROLES }));

const CASES: readonly string[][] = [
  [],
  ['navbar', 'footer'],
  ['navbar', 'hero', 'services', 'cta', 'footer'],
  ['navbar', 'hero', 'gallery', 'testimonials', 'cta', 'faq', 'stats', 'team', 'about', 'footer'],
  ['navbar', 'contact', 'footer'],
];

describe('site design contract projection', () => {
  it('carries the compiled summary, chrome and per-page budgets', () => {
    const projection = projectionFor('salon');
    expect(projection.version).toBe('1.0');
    expect(projection.chromeFamilies).toEqual(['navbar', 'footer']);
    expect(projection.summary).toContain('SITE DESIGN CONTRACT');
    expect(Object.keys(projection.pages).sort()).toEqual(ROLES.slice().sort());
    expect(JSON.parse(JSON.stringify(projection))).toEqual(projection);
  });

  it('client and edge density checks never drift', () => {
    for (const industry of INDUSTRY_CREATIVE_KEYS) {
      const projection = projectionFor(industry);
      for (const role of ROLES) {
        for (const sectionOrder of CASES) {
          expect(edgeProjectionDensityIssues(projection, role, sectionOrder), `${industry}/${role}`)
            .toEqual(projectionDensityIssues(projection, role, sectionOrder));
        }
      }
    }
  });

  it('treats the ceiling as hard and the floor and required roles as advisory', () => {
    const projection = projectionFor('salon');
    const bloated = projectionDensityIssues(projection, 'checkout',
      ['navbar', 'contact', 'faq', 'cta', 'stats', 'gallery', 'team', 'footer']);
    expect(bloated.hard.some(issue => issue.includes('at most'))).toBe(true);
    const thin = projectionDensityIssues(projection, 'booking', ['navbar', 'footer']);
    expect(thin.hard).toEqual([]);
    expect(thin.advisory.some(issue => issue.includes('must prove'))).toBe(true);
  });

  it('returns nothing for an unknown role or a missing projection', () => {
    expect(projectionDensityIssues(undefined, 'home', ['hero'])).toEqual({ hard: [], advisory: [] });
    expect(projectionDensityIssues(projectionFor('salon'), 'nope', ['hero'])).toEqual({ hard: [], advisory: [] });
  });

  it('renders the compiled contract into the composition prompt', () => {
    const brief = {
      roles: ['home'],
      variants: [{ id: 'hero:prisma-cinematic', family: 'hero', pageRoles: ['home'] }],
      industry: 'salon',
      designContract: projectionFor('salon'),
    };
    const withContract = renderCompositionCanonicalContract(brief);
    expect(withContract).toContain('SITE DESIGN CONTRACT');
    expect(withContract).toContain('11. The compiled site design contract');
    const without = renderCompositionCanonicalContract({ ...brief, designContract: undefined });
    expect(without).not.toContain('SITE DESIGN CONTRACT');
    expect(without.split('\n').every(line => line.length > 0)).toBe(true);
  });
});
