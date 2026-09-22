import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  PAGE_ARCHETYPES,
  buildPageArchetypeCss,
  describePageArchetypes,
  normalizePageSectionOrder,
  pageArchetypeIssues,
  resolvePageScale,
} from '@/sections/pageArchetypeContract';
import { COMPOSITION_ROLES } from '@/sections/aiPageComposition';
import { ART_DIRECTION_PACKS, ART_DIRECTION_PACK_IDS } from '@/sections/variants/artDirectionPacks';
import {
  PAGE_ARCHETYPES as EDGE_ARCHETYPES,
  normalizePageSectionOrder as edgeNormalize,
  pageArchetypeIssues as edgeIssues,
} from '../../supabase/functions/_shared/pageArchetypeContract';

describe('page archetype contract', () => {
  it('declares an archetype for every composition role', () => {
    for (const role of COMPOSITION_ROLES) expect(PAGE_ARCHETYPES[role]).toBeDefined();
  });

  it('never forbids a family it also requires', () => {
    for (const [role, archetype] of Object.entries(PAGE_ARCHETYPES)) {
      const overlap = archetype.requiredFamilies.filter(family => archetype.forbiddenFamilies.includes(family));
      expect(overlap, role).toEqual([]);
      expect(archetype.requiredFamilies.length, role).toBeLessThanOrEqual(archetype.maxBodySections);
    }
  });

  it('drops the negative vocabulary and reports missing required families', () => {
    expect(normalizePageSectionOrder('checkout', ['navbar', 'hero', 'gallery', 'contact', 'footer']))
      .toEqual(['navbar', 'contact', 'footer']);
    // Missing required families are never synthesised — they surface as issues.
    expect(normalizePageSectionOrder('faq', ['navbar', 'hero', 'footer'])).toEqual(['navbar', 'hero', 'footer']);
    expect(pageArchetypeIssues('faq', ['navbar', 'hero', 'footer'])).toContain('pages.faq.sectionOrder: a faq page must include faq');
    expect(pageArchetypeIssues('faq', ['navbar', 'hero', 'footer'], {}, { requireFamilies: false })).toEqual([]);
  });

  it('clamps a padded page to its body ceiling without dropping required families', () => {
    const order = normalizePageSectionOrder('contact', ['navbar', 'hero', 'about', 'features', 'stats', 'contact', 'cta', 'footer']);
    expect(order).toContain('contact');
    expect(order.filter(family => family !== 'navbar' && family !== 'footer').length).toBeLessThanOrEqual(4);
  });

  it('reports required, forbidden and trait violations', () => {
    expect(pageArchetypeIssues('pricing', ['navbar', 'hero', 'gallery', 'footer'])).toEqual([
      'pages.pricing.sectionOrder: gallery is forbidden on a pricing page',
      'pages.pricing.sectionOrder: a pricing page must include pricing',
      'pages.pricing.sectionOrder: a pricing page must include faq',
    ]);
    expect(pageArchetypeIssues('checkout', ['navbar', 'contact', 'footer'], { contact: ['marquee'] })).toEqual([
      'pages.checkout.variants.contact: marquee is forbidden on a checkout page',
    ]);
    expect(pageArchetypeIssues('gallery', ['navbar', 'hero', 'gallery', 'cta', 'footer'])).toEqual([]);
  });

  it('modulates the pack spacing scale instead of replacing the visual language', () => {
    for (const packId of ART_DIRECTION_PACK_IDS) {
      const pack = ART_DIRECTION_PACKS[packId];
      const checkout = resolvePageScale('checkout', pack);
      const home = resolvePageScale('home', pack);
      expect(home.rhythm).toBe(pack.design.rhythm);
      expect(home.density).toBe(pack.signature.density);
      expect(checkout.rhythm).toBeDefined();
      const css = buildPageArchetypeCss(pack);
      expect(css).toContain('[data-ut-page-role="checkout"]');
      expect(css).toContain('--ut-rhythm-space');
      // Page scope carries spacing only — never colour, type or motion.
      expect(css).not.toContain('--ut-type-hero');
      expect(css).not.toContain('--primary');
    }
  });

  it('states the archetype rules in the model contract', () => {
    const block = describePageArchetypes(['checkout', 'gallery']);
    expect(block).toContain('never include (families)');
    expect(block).toContain('never include (design traits)');
    expect(block).toContain('must include: contact');
  });

  it('keeps the edge mirror byte-equivalent in behaviour', () => {
    for (const role of Object.keys(PAGE_ARCHETYPES)) {
      const client = PAGE_ARCHETYPES[role];
      const edge = EDGE_ARCHETYPES[role];
      expect(edge, role).toBeDefined();
      expect(edge.requiredFamilies, role).toEqual([...client.requiredFamilies]);
      expect(edge.forbiddenFamilies, role).toEqual([...client.forbiddenFamilies]);
      expect(edge.forbiddenTags, role).toEqual([...client.forbiddenTags]);
      expect(edge.maxBodySections, role).toBe(client.maxBodySections);
    }
    const order = ['navbar', 'hero', 'gallery', 'blog-preview', 'contact', 'footer'];
    for (const role of Object.keys(PAGE_ARCHETYPES)) {
      expect(edgeNormalize(role, [...order]), role).toEqual(normalizePageSectionOrder(role, order));
      expect(edgeIssues(role, order, { hero: ['marquee'] }), role)
        .toEqual(pageArchetypeIssues(role, order, { hero: ['marquee'] }));
    }
  });

  it('keeps the retired launcher surfaces deleted', () => {
    const files = ['src/hooks/useWizardAI.ts', 'src/components/onboarding/WizardTopAction.tsx'];
    for (const file of files) {
      expect(() => readFileSync(file, 'utf8')).toThrow();
    }
  });
});
