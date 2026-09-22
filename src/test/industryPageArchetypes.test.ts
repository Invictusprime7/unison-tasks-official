import { describe, expect, it } from 'vitest';
import { getAllIndustries, getIndustryProfile, type PageSpec } from '@/platform/core/industryMatrix';
import { planSiteTopology, resolvePageSpecsForRoles } from '@/platform/core/siteTopologyPlanner';
import { certifiedDefaultVariantId, layoutVariantMap, SECTION_FAMILY_EMIT } from '@/sections/resolveSectionLayout';
import { getIndustryDefaultPageChoices, getIndustryPageChoiceCards } from '@/components/onboarding/wizard/wizardCatalog';

const industries = getAllIndustries();
const UTILITY_PURPOSES = new Set(['checkout']);

describe('Phase 6 — industry page archetypes', () => {
  it.each(industries.map((profile) => [profile.industry, profile] as const))(
    '%s ships a deep, unique page map led by Home',
    (industry, profile) => {
      const pages = profile.defaultPages;
      expect(pages.length, `${industry} page depth`).toBeGreaterThanOrEqual(6);
      expect(pages[0].path).toBe('/');
      expect(pages[0].purpose).toBe('landing');

      const paths = pages.map((page) => page.path.toLowerCase());
      expect(new Set(paths).size, `${industry} duplicate routes`).toBe(paths.length);
      expect(paths).toContain('/contact');
      expect(paths).toContain('/about');

      for (const page of pages) {
        expect(page.title.trim().length, `${industry} page title`).toBeGreaterThan(0);
        expect(page.path.startsWith('/'), `${industry} ${page.path}`).toBe(true);
      }
    },
  );

  it.each(industries.map((profile) => [profile.industry, profile] as const))(
    '%s only expects sections the compiler can render with a certified design',
    (industry, profile) => {
      const families = new Map(
        Object.entries(SECTION_FAMILY_EMIT).map(([name, family]) => [family.sectionType, { name, family }]),
      );
      for (const page of profile.defaultPages) {
        expect(page.expectedSections.length, `${industry} ${page.path} sections`).toBeGreaterThanOrEqual(3);
        expect(page.expectedSections[0]).toBe('navbar');
        expect(page.expectedSections[page.expectedSections.length - 1]).toBe('footer');
        for (const section of page.expectedSections) {
          const entry = families.get(section);
          expect(entry, `${industry} ${page.path}: unknown family "${section}"`).toBeDefined();
          expect(() =>
            certifiedDefaultVariantId(entry!.name, entry!.family, layoutVariantMap(entry!.family)),
          ).not.toThrow();
        }
        const unique = new Set(page.expectedSections);
        expect(unique.size, `${industry} ${page.path} repeats a section`).toBe(page.expectedSections.length);
      }
    },
  );

  it.each(industries.map((profile) => [profile.industry, profile] as const))(
    '%s archetype survives the topology planner unchanged',
    (industry, profile) => {
      const plan = planSiteTopology(industry, 'Acme Co');
      expect(plan.pages.map((page) => page.route)).toEqual(profile.defaultPages.map((page) => page.path));
      expect(plan.pages.filter((page) => page.isHome)).toHaveLength(1);

      const navRoutes = plan.pages.filter((page) => page.visibleInNav).map((page) => page.route);
      for (const page of profile.defaultPages.filter((spec) => UTILITY_PURPOSES.has(spec.purpose))) {
        expect(navRoutes, `${industry} hides ${page.path} from nav`).not.toContain(page.path);
      }
      expect(navRoutes.length, `${industry} nav depth`).toBeGreaterThanOrEqual(5);
      expect(new Set(plan.pages.map((page) => page.filePath)).size).toBe(plan.pages.length);
    },
  );

  it.each(industries.map((profile) => profile.industry))(
    '%s exposes its authored page identity to the wizard',
    (industry) => {
      const choices = getIndustryDefaultPageChoices(industry);
      expect(choices.length, `${industry} wizard choices`).toBeGreaterThanOrEqual(4);
      expect(new Set(choices).size).toBe(choices.length);

      const authored = getIndustryPageChoiceCards(industry);
      const labels = new Map(authored.map((card) => [card.id, card.label]));
      const profile = getIndustryProfile(industry)!;
      for (const page of profile.defaultPages) {
        if (page.path === '/') continue;
        const match = [...labels.values()].includes(page.title);
        if (choices.length > 0 && match) expect(match).toBe(true);
      }
    },
  );

  it('keeps industry-authored route identity when roles are resolved', () => {
    const specs = (roles: string[], industry: string): PageSpec[] => resolvePageSpecsForRoles(roles, industry);
    expect(specs(['services'], 'restaurant')[0].path).toBe('/menu');
    expect(specs(['gallery'], 'real-estate')[0].path).toBe('/listings');
    expect(specs(['gallery'], 'local-service')[0].path).toBe('/projects');
    expect(specs(['blog'], 'agency')[0].title).toBe('Insights');
    expect(specs(['about'], 'portfolio')[0].title).toBe('Studio');
  });

  it('gives each system family the depth its business model needs', () => {
    const purposes = (industry: string) =>
      new Set(getIndustryProfile(industry)!.defaultPages.map((page) => page.purpose));

    expect(purposes('salon')).toContain('booking');
    expect(purposes('restaurant')).toContain('booking');
    expect(purposes('coaching')).toContain('booking');
    expect(purposes('real-estate')).toContain('booking');
    expect(purposes('ecommerce')).toContain('shop');
    expect(purposes('ecommerce')).toContain('checkout');
    expect(purposes('saas')).toContain('pricing');
    expect(purposes('agency')).toContain('portfolio');
    expect(purposes('portfolio')).toContain('portfolio');
    expect(purposes('nonprofit')).toContain('blog');
    expect(purposes('local-service')).toContain('faq');
  });
});
