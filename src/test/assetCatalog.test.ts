import { describe, it, expect } from 'vitest';
import { buildRenderedResourceIndex, detectUsedAssetKeys, isRelevantAsset, listAssetTypes, normalizeIndustry } from '@/services/resources/assetCatalog';

describe('asset catalog', () => {
  it('ranks by industry and marks used types', () => {
    const files = { '/src/pages/Home.tsx': '<ServiceGrid /><div data-ut-resource="testimonials#t1.quote" />' };
    const types = listAssetTypes({ industry: 'barber', vfsFiles: files });
    expect(normalizeIndustry('barber')).toBe('salon');
    expect(types[0].used).toBe(true);
    const services = types.find((t) => t.key === 'services')!;
    expect(services.group).toBe('catalog');
    expect(types.find((t) => t.key === 'testimonials')?.group).toBe('content');
    expect(isRelevantAsset(services)).toBe(true);
    expect(detectUsedAssetKeys(files).has('testimonials')).toBe(true);
  });
  it('indexes rendered record marks', () => {
    const idx = buildRenderedResourceIndex({ '/a.tsx': '<p data-ut-resource="products#p1.name">x</p>' });
    expect(idx.get('products#p1')).toEqual(['/a.tsx']);
  });
});
