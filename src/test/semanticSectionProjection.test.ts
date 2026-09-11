import { describe, it, expect } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import type { TemplateComposition } from '@/sections/types';

/**
 * Registered variants now ship as real modules: the family file resolves the
 * chosen variant, `<Component>Base.tsx` is the deterministic fallback and
 * `recipes/<Component>.ts` carries the registered implementations. Structural
 * assertions read that whole emitted surface.
 */
function familySource(files: Record<string, string>, component: string): string {
  return [
    `/src/components/recipes/${component}.ts`,
    `/src/components/${component}Base.tsx`,
    `/src/components/${component}.tsx`,
  ].map((path) => files[path] || '').join('\n');
}


function composition(sections: TemplateComposition['sections']): TemplateComposition {
  return { id: 'fixture', name: 'Fixture', industry: 'photography', sections } as unknown as TemplateComposition;
}

describe('M1 — semantic section projection', () => {
  const template = composition([
    { id: 'gallery-1', type: 'gallery', props: { headline: 'Work', items: [{ src: '/a.jpg', alt: 'A', caption: 'A', category: 'weddings' }] } },
    { id: 'pricing-1', type: 'pricing', props: { headline: 'Packages', tiers: [{ name: 'Session', price: '$400', features: ['2 hours'], cta: { label: 'Book', href: '#' } }] } },
    { id: 'about-1', type: 'about', props: { headline: 'Studio', description: 'We shoot light.', image: '/s.jpg' } },
    { id: 'logos-1', type: 'logo-cloud', props: { logos: [{ name: 'Vogue' }] } },
    { id: 'ba-1', type: 'before-after', props: { items: [{ before: '/b.jpg', after: '/a2.jpg' }] } },
    { id: 'blog-1', type: 'blog-preview', props: { posts: [{ title: 'Post', excerpt: 'x' }] } },
  ] as unknown as TemplateComposition['sections']);

  const files = compositionToReactFileSet(template, '/src/pages/Home.tsx');
  const map = files['/src/pages/Home.sections.ts'];

  it('emits a dedicated renderer file per semantic section type', () => {
    for (const path of ['Gallery', 'Pricing', 'About', 'LogoCloud', 'BeforeAfter', 'BlogPreview']) {
      expect(files[`/src/components/${path}.tsx`]).toBeTruthy();
    }
  });

  it('never collapses gallery or pricing into the Services renderer', () => {
    expect(familySource(files, 'Services')).toBeUndefined();
    expect(map).toContain('"gallery": Gallery');
    expect(map).toContain('"pricing": Pricing');
    expect(map).toContain('"about": About');
    expect(map).toContain('"logo-cloud": LogoCloud');
  });

  it('gallery renderer consumes src/alt/caption/category', () => {
    const gallery = familySource(files, 'Gallery');
    expect(gallery).toContain('item.caption');
    expect(gallery).toContain('item.category');
    expect(gallery).toContain('data-ut-variant="gallery:');
  });

  it('pricing renderer consumes tiers and features', () => {
    const pricing = familySource(files, 'Pricing');
    expect(pricing).toContain('tier.features');
    expect(pricing).toContain('data-ut-variant="pricing:tiers"');
  });
});
