import { describe, it, expect } from 'vitest';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import { sealSnapshot } from '@/platform/core/snapshotSeal';
import { buildThemeContract } from '@/platform/core/themeContract';
import { projectResolvedArtDirection } from '@/sections/variants/resolvedArtDirection';

function createSnapshot(packId: string): SiteBundleSnapshot {
  return {
    snapshotId: 'seal_ad',
    businessName: 'STELLAR BEAUTY',
    industry: 'salon',
    pageRegistry: { homePageId: 'home', pages: {} },
    vfsFiles: {
      '/src/App.tsx': 'export default function App(){ return null; }',
      '/src/index.css': ':root { --primary: 0 0% 0%; }',
    },
    routerFile: { path: '/src/App.tsx', content: 'export default function App(){ return null; }' },
    manifest: { routes: [], nav: [], layout: { header: 'none', footer: 'none' }, metadata: { title: 'x' } },
    bindings: {}, calendars: {}, popups: {},
    creatorData: { products: {}, services: {}, testimonials: {}, faqItems: {}, galleryItems: {}, teamMembers: {}, collections: {}, forms: {}, componentInstances: {} },
    componentInstances: {}, routes: ['/'], homeRoute: '/',
    createdAt: '2026-08-29T00:00:00.000Z',
    meta: { source: 'wizard', industry: 'salon', themePresetId: 'editorial', templateId: 'salon-premium', artDirectionPackId: packId },
  } as unknown as SiteBundleSnapshot;
}

const appContext = {
  generatedAt: '2026-08-29T00:00:00.000Z',
  industry: 'salon',
  themePresetId: 'editorial',
  templateId: 'salon-premium',
  entryPoint: '/src/App.tsx',
};

describe('sealed art direction reaches every consumer (Phase E)', () => {
  it('seals the resolved record for revisions that only carried a pack id', () => {
    const sealed = sealSnapshot({
      artifact: createSnapshot('noir-atelier'),
      vfsFiles: createSnapshot('noir-atelier').vfsFiles,
      appContext,
      sealedBy: 'recompile',
    });
    expect(sealed.meta.artDirection?.familyId).toBe('editorial');
    expect(sealed.meta.artDirection?.storagePackId).toBe('noir-atelier');
    expect(sealed.meta.artDirection?.packId).toMatch(/^editorial\./);
  });

  it('re-sealing (autosave, recompile, publish) never drops or drifts the record', () => {
    const first = sealSnapshot({
      artifact: createSnapshot('noir-atelier'),
      vfsFiles: createSnapshot('noir-atelier').vfsFiles,
      appContext,
      sealedBy: 'recompile',
    });
    const second = sealSnapshot({
      artifact: JSON.parse(JSON.stringify(first)) as SiteBundleSnapshot,
      vfsFiles: first.vfsFiles,
      appContext,
      sealedBy: 'builder-commit',
    });
    expect(second.meta.artDirection).toEqual(first.meta.artDirection);
  });

  it('the theme contract is derived from the sealed record, not a re-derived pack', () => {
    const sealedRecord = projectResolvedArtDirection({ themePresetId: 'minimalist', artDirectionPackId: 'swiss-grid' })!;
    const contract = buildThemeContract({
      artDirection: sealedRecord,
      // A stale pack id must lose to the sealed record.
      artDirectionPackId: 'neon-grid',
      themePresetId: 'minimalist',
    });
    expect(contract.artDirectionPackId).toBe('swiss-grid');
    expect(contract.artDirectionFamilyId).toBe('minimalist');
    expect(contract.artDirectionQualifiedPackId).toMatch(/^minimalist\./);
  });

  it('legacy contracts without a sealed record still resolve a family', () => {
    const contract = buildThemeContract({ artDirectionPackId: 'editorial-noir', themePresetId: 'editorial' });
    expect(contract.artDirectionFamilyId).toBe('editorial');
  });
});
