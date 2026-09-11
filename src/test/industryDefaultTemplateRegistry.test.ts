import { describe, expect, it } from 'vitest';
import { getAllIndustries } from '@/platform/core/industryMatrix';
import type { PageSpec } from '@/platform/core/industryMatrix';
import { getCompositionById } from '@/sections/templates';
import {
  getDefaultTemplateIdForIndustry,
  getIndustryDefaultRegistration,
} from '@/sections/templates/industryDefaultRegistry';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';
import { resolvePageSpecsForRoles, type GeneratedSitePlan, type PageRouteNode } from '@/platform/core/siteTopologyPlanner';
import type { SectionEntry } from '@/sections/types';

const PURPOSE_TO_ROLE: Record<PageSpec['purpose'], PageRouteNode['role']> = {
  landing: 'home',
  services: 'services',
  portfolio: 'gallery',
  contact: 'contact',
  about: 'about',
  blog: 'blog',
  shop: 'shop',
  checkout: 'checkout',
  booking: 'booking',
  pricing: 'pricing',
  faq: 'faq',
};

function readSections(source: string): SectionEntry[] {
  const match = source.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/);
  if (!match) throw new Error('Compiled page did not serialize sections');
  return JSON.parse(match[1]) as SectionEntry[];
}

function nodeFor(
  role: string,
  path: string,
  title: string,
): PageRouteNode {
  const isHome = path === '/';
  return {
    id: `${role}-${title.toLowerCase().replace(/\W+/g, '-')}`,
    name: title,
    title,
    route: path,
    role: role as PageRouteNode['role'],
    filePath: isHome ? '/src/pages/Home.tsx' : `/src/pages/${title.replace(/\W+/g, '')}.tsx`,
    visibleInNav: true,
    isHome,
    generatedBy: 'wizard',
  };
}

function planFor(industry: string, templateId: string, page: PageRouteNode): GeneratedSitePlan {
  return {
    siteId: `registry-${industry}`,
    industry,
    businessName: 'Registry Test Co',
    homePageId: page.isHome ? page.id : 'home',
    pages: [page],
    navItems: [page.id],
    funnels: [],
    redirects: [],
    generatedAt: '2026-09-10T00:00:00.000Z',
    selectedTemplateId: templateId,
  };
}

describe('industry default template registry', () => {
  it('gives every canonical industry a registered default composition', () => {
    for (const profile of getAllIndustries()) {
      const registration = getIndustryDefaultRegistration(profile.industry);
      const templateId = getDefaultTemplateIdForIndustry(profile.industry);
      expect(registration, profile.industry).toBeTruthy();
      expect(registration?.systemType, profile.industry).toBe(profile.systemType);
      expect(templateId, profile.industry).toBeTruthy();
      expect(getCompositionById(templateId!), profile.industry).toBeTruthy();
    }
  });

  it.each([
    ['real-estate', 'gallery', 'Listings', '/listings'],
    ['portfolio', 'gallery', 'Work', '/work'],
    ['restaurant', 'services', 'Menu', '/menu'],
    ['coaching', 'services', 'Programs', '/programs'],
  ] as const)('preserves authored %s page identity for %s', (industry, role, title, path) => {
    const [spec] = resolvePageSpecsForRoles([role], industry);
    expect(spec?.title).toBe(title);
    expect(spec?.path).toBe(path);
    expect(spec?.expectedSections.length).toBeGreaterThan(0);
  });

  it('materializes every declared interior page contract from its industry default', () => {
    for (const profile of getAllIndustries()) {
      const templateId = getDefaultTemplateIdForIndustry(profile.industry)!;
      const template = getCompositionById(templateId)!;

      for (const spec of profile.defaultPages) {
        if (spec.path === '/') continue;
        const role = PURPOSE_TO_ROLE[spec.purpose] ?? 'custom';
        const page = nodeFor(role, spec.path, spec.title);
        const files = generateTopologyPlaceholderFiles(
          page,
          planFor(profile.industry, templateId, page),
          template,
        );
        const sections = readSections(files[page.filePath]);
        const actualTypes = sections.map((section) => section.type);

        for (const expectedType of spec.expectedSections) {
          expect(
            actualTypes,
            `${profile.industry} ${spec.path} is missing ${expectedType}: ${actualTypes.join(', ')}`,
          ).toContain(expectedType);
        }
        expect(sections.length, `${profile.industry} ${spec.path}`).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
