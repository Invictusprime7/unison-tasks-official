import { describe, it, expect } from 'vitest';
import { bindMediaToComposition, buildSeedMediaLibrary } from '@/services/launch/assetSlotBinding';
import { getCompositionById } from '@/sections/templates';
import type { TemplateComposition } from '@/sections/types';

const assets = [
  { id: 'a2', url: 'https://cdn.test/two.jpg', kind: 'image', tags: ['gallery'] },
  { id: 'a1', url: 'https://cdn.test/one.jpg', kind: 'image', alt: 'Storefront' },
  { id: 'd1', url: 'https://cdn.test/brochure.pdf', kind: 'document' },
  { id: 'a1', url: 'https://cdn.test/one-dupe.jpg', kind: 'image' },
];

describe('seed media library', () => {
  it('keeps only images, dedupes by id, and orders deterministically', () => {
    const library = buildSeedMediaLibrary(assets);
    expect(library.map((a) => a.id)).toEqual(['a1', 'a2']);
    expect(library[0].url).toBe('https://cdn.test/one.jpg');
  });

  it('bounds the library', () => {
    const many = Array.from({ length: 80 }, (_, i) => ({ id: `x${String(i).padStart(3, '0')}`, url: `https://cdn.test/${i}.jpg`, kind: 'image' }));
    expect(buildSeedMediaLibrary(many).length).toBe(40);
    expect(buildSeedMediaLibrary(many, 5).length).toBe(5);
  });
});

describe('asset → slot binding', () => {
  const template = getCompositionById('store-premium') as TemplateComposition;

  it('leaves the composition untouched when no business media exists', () => {
    const { composition, report } = bindMediaToComposition(template, [], 'seed');
    expect(composition).toBe(template);
    expect(report.bound).toBe(0);
  });

  it('substitutes real media into declared slots without changing section shape', () => {
    const library = buildSeedMediaLibrary(assets);
    const { composition, report } = bindMediaToComposition(template, library, 'seed');
    expect(report.bound).toBeGreaterThan(0);
    expect(composition.sections.length).toBe(template.sections.length);
    composition.sections.forEach((section, index) => {
      const source = template.sections[index];
      expect(section.id).toBe(source.id);
      expect(section.type).toBe(source.type);
      expect(Object.keys(section.props || {}).sort()).toEqual(Object.keys(source.props || {}).sort());
    });
    const urls = JSON.stringify(composition);
    expect(urls).toContain('https://cdn.test/one.jpg');
  });

  it('is deterministic for the same seed and library', () => {
    const library = buildSeedMediaLibrary(assets);
    const a = bindMediaToComposition(template, library, 'seed').composition;
    const b = bindMediaToComposition(template, library, 'seed').composition;
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('never invents a media prop the template did not declare', () => {
    const minimal: TemplateComposition = {
      ...template,
      sections: [{ id: 'copy-1', type: 'features', props: { headline: 'Hello' } } as never],
    };
    const { composition, report } = bindMediaToComposition(minimal, buildSeedMediaLibrary(assets), 'seed');
    expect(report.bound).toBe(0);
    expect(composition.sections[0].props).toEqual({ headline: 'Hello' });
  });
});
