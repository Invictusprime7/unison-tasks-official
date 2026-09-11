import { describe, it, expect } from 'vitest';
import { getVariantsForSection, getVariantById, getVariantIdForLayout } from '@/sections/variants/registry';
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


const REQUIRED = [
  'gallery:editorial-mosaic',
  'gallery:masonry',
  'gallery:cinematic-grid',
  'gallery:lightbox-grid',
  'gallery:feature-split',
];

describe('Phase 4 — gallery premium variant family', () => {
  it('registers all five required gallery variants', () => {
    const ids = getVariantsForSection('gallery').map((v) => v.id);
    for (const id of REQUIRED) expect(ids).toContain(id);
  });

  it('exposes an executable component and JSX renderer per variant', () => {
    for (const id of REQUIRED) {
      const variant = getVariantById(id as never);
      expect(variant?.component).toBeTypeOf('function');
      expect(variant?.renderJSX({ heading: 'Work', listItems: ['One', 'Two'] })).toContain(`data-variant="${id}"`);
    }
  });

  it('maps layout hints to executable variant ids', () => {
    expect(getVariantIdForLayout('gallery', 'mosaic')).toBe('gallery:editorial-mosaic');
    expect(getVariantIdForLayout('gallery', 'masonry')).toBe('gallery:masonry');
    expect(getVariantIdForLayout('gallery', 'lightbox')).toBe('gallery:lightbox-grid');
  });

  it('generated gallery renderer supports lightbox + all premium layouts', () => {
    const composition = {
      id: 'fixture', name: 'Fixture', industry: 'photography',
      sections: [{ id: 'gallery-1', type: 'gallery', props: { headline: 'Work', layout: 'masonry', items: [{ src: '/a.jpg', caption: 'A', category: 'weddings' }] } }],
    } as unknown as TemplateComposition;
    const gallery = familySource(compositionToReactFileSet(composition, '/src/pages/Home.tsx'), 'Gallery');
    for (const marker of ['gallery:editorial-mosaic', 'gallery:masonry', 'gallery:lightbox-grid', 'gallery:feature-split', 'gallery:cinematic-grid']) {
      expect(gallery).toContain(marker);
    }
    expect(gallery).toContain('aria-modal="true"');
    expect(gallery).toContain("event.key === 'Escape'");
  });
});
