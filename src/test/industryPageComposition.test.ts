/**
 * M6 — cross-industry page composition guards.
 *
 * Regression cover for the "every page is a clone of Home / duplicate sections"
 * defect. Interior routes must be built from their own industry page contract,
 * not by re-filtering the Home template.
 */
import { describe, expect, it } from 'vitest';
import { ALL_COMPOSITIONS, getCompositionById } from '@/sections/templates';
import { generateTopologyPlaceholderFiles } from '@/utils/topologyVFSScaffolder';
import { getIndustryProfile, industryRoleForPage } from '@/platform/core/industryMatrix';
import type { GeneratedSitePlan, PageRouteNode } from '@/platform/core/siteTopologyPlanner';
import type { SectionEntry } from '@/sections/types';

const FIRST_CLASS_INDUSTRIES = [
  'saas', 'salon', 'contractor', 'restaurant', 'coaching',
  'ecommerce', 'portfolio', 'nonprofit', 'agency',
] as const;

const CHROME = new Set(['navbar', 'footer']);

function readSections(source: string): SectionEntry[] {
  const match = source.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/);
  if (!match) throw new Error('Compiled page did not serialize sections');
  return JSON.parse(match[1]) as SectionEntry[];
}

function pageNode(role: string, path: string, title: string): PageRouteNode {
  const isHome = path === '/';
  return {
    id: `${role}-page`,
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

function plan(templateId: string, industry: string, page: PageRouteNode): GeneratedSitePlan {
  return {
    siteId: `composition-${industry}`,
    industry,
    businessName: 'Composition Guard Co',
    homePageId: 'home-page',
    pages: [page],
    navItems: [page.id],
    funnels: [],
    redirects: [],
    generatedAt: '2026-09-10T00:00:00.000Z',
    selectedTemplateId: templateId,
  };
}

function templateForIndustry(industry: string) {
  return ALL_COMPOSITIONS.find((composition) => composition.industry === industry)
    ?? getCompositionById('salon-premium')!;
}

describe('industry page composition guards', () => {
  for (const industry of FIRST_CLASS_INDUSTRIES) {
    const profile = getIndustryProfile(industry);
    if (!profile) continue;
    const template = templateForIndustry(industry);

    const home = pageNode('home', '/', 'Home');
    const homeSections = () =>
      readSections(generateTopologyPlaceholderFiles(home, plan(template.id, industry, home), template)[home.filePath]);

    it(`${industry}: interior pages never repeat a section type`, () => {
      for (const spec of profile.defaultPages) {
        if (spec.path === '/') continue;
        const page = pageNode(industryRoleForPage(spec), spec.path, spec.title);
        const sections = readSections(
          generateTopologyPlaceholderFiles(page, plan(template.id, industry, page), template)[page.filePath],
        );
        const bodyTypes = sections.map((section) => section.type).filter((type) => !CHROME.has(type));
        expect(new Set(bodyTypes).size, `${industry} ${spec.path} -> ${bodyTypes.join(',')}`).toBe(bodyTypes.length);
        expect(new Set(sections.map((section) => section.id)).size).toBe(sections.length);
        expect(sections.length, `${industry} ${spec.path}`).toBeGreaterThanOrEqual(4);
      }
    });

    it(`${industry}: interior pages are not clones of Home`, () => {
      const homeBody = homeSections().map((section) => section.type).filter((type) => !CHROME.has(type)).join('|');
      for (const spec of profile.defaultPages) {
        if (spec.path === '/') continue;
        const page = pageNode(industryRoleForPage(spec), spec.path, spec.title);
        const sections = readSections(
          generateTopologyPlaceholderFiles(page, plan(template.id, industry, page), template)[page.filePath],
        );
        const body = sections.map((section) => section.type).filter((type) => !CHROME.has(type)).join('|');
        expect(body, `${industry} ${spec.path}`).not.toBe(homeBody);
      }
    });

    it(`${industry}: interior heroes do not reuse the Home hero treatment`, () => {
      const homeHero = homeSections().find((section) => section.type === 'hero');
      for (const spec of profile.defaultPages) {
        if (spec.path === '/') continue;
        const page = pageNode(industryRoleForPage(spec), spec.path, spec.title);
        const sections = readSections(
          generateTopologyPlaceholderFiles(page, plan(template.id, industry, page), template)[page.filePath],
        );
        const hero = sections.find((section) => section.type === 'hero');
        if (!hero || !homeHero) continue;
        expect(hero.props.headline, `${industry} ${spec.path}`).not.toBe(homeHero.props.headline);
      }
    });
  }
});
