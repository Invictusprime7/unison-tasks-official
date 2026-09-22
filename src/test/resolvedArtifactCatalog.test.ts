import { describe, it, expect } from 'vitest';
import {
  buildResolvedArtifactCatalog,
  enumerateCompositionMedia,
  resolveCatalogAsset,
  assertArtifactCatalogClosure,
  MEDIA_PROP_KEYS,
  MEDIA_COLLECTION_KEYS,
} from '@/platform/core/resolvedArtifactCatalog';
import {
  bindMediaToComposition,
  buildBusinessAssetIndex,
  type SeedMediaAsset,
} from '@/services/launch/assetSlotBinding';
import type { TemplateComposition } from '@/sections/types';

function composition(): TemplateComposition {
  return {
    id: 'comp-1',
    name: 'Test',
    category: 'test',
    industry: 'salon',
    description: '',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        props: { headline: 'Hi', image: 'https://stock/hero.jpg', alt: 'stock hero' },
      },
      {
        id: 'gallery-1',
        type: 'gallery',
        props: {
          items: [
            { image: 'https://stock/a.jpg' },
            { image: 'https://stock/b.jpg' },
            { title: 'no media' },
          ],
        },
      },
    ],
  } as unknown as TemplateComposition;
}

const library: SeedMediaAsset[] = [
  { id: 'asset-1', url: 'https://cdn/one.jpg', kind: 'image', alt: 'One' },
  { id: 'asset-2', url: 'https://cdn/two.jpg', kind: 'image' },
];

describe('resolvedArtifactCatalog', () => {
  it('enumerates single and collection media deterministically', () => {
    const refs = enumerateCompositionMedia(composition());
    expect(refs.map((r) => r.propPath)).toEqual([
      'props.image',
      'props.items[0].image',
      'props.items[1].image',
    ]);
    expect(enumerateCompositionMedia(composition())).toEqual(refs);
  });

  it('labels stock defaults when no business library is supplied', () => {
    const catalog = buildResolvedArtifactCatalog(composition());
    expect(catalog.stockDefaultCount).toBe(3);
    expect(catalog.businessAssetCount).toBe(0);
    expect(catalog.emptyCount).toBe(0);
  });

  it('labels business assets from the asset index', () => {
    const { composition: bound, report } = bindMediaToComposition(composition(), library, 'seed');
    expect(report.bound).toBe(3);
    const catalog = buildResolvedArtifactCatalog(bound, buildBusinessAssetIndex(library));
    expect(catalog.businessAssetCount).toBe(3);
    expect(catalog.stockDefaultCount).toBe(0);
    expect(report.catalog?.businessAssetCount).toBe(3);
  });

  it('never fabricates media for an empty library', () => {
    const { composition: bound, report } = bindMediaToComposition(composition(), [], 'seed');
    expect(bound).toEqual(composition());
    expect(report.catalog?.stockDefaultCount).toBe(3);
  });

  it('resolves media by section and reports no closure violations by default', () => {
    const catalog = buildResolvedArtifactCatalog(composition());
    expect(resolveCatalogAsset(catalog, 'hero-1')?.value).toBe('https://stock/hero.jpg');
    expect(resolveCatalogAsset(catalog, 'missing-section')).toBeNull();
    expect(assertArtifactCatalogClosure(catalog)).toEqual([]);
  });

  it('keeps brand marks out of the substitutable vocabulary', () => {
    expect(MEDIA_PROP_KEYS).toContain('logo');
    expect(MEDIA_COLLECTION_KEYS).toContain('logos');
    const withLogo = composition();
    (withLogo.sections[0].props as Record<string, unknown>).logo = 'https://stock/brand.svg';
    const { composition: bound } = bindMediaToComposition(withLogo, library, 'seed');
    expect((bound.sections[0].props as Record<string, unknown>).logo).toBe('https://stock/brand.svg');
    expect(buildResolvedArtifactCatalog(bound).entries.some((e) => e.propKey === 'logo')).toBe(true);
  });
});
