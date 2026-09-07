import { describe, expect, it } from 'vitest';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import {
  createWizardCompileArtifact,
  sealSnapshot,
  WIZARD_LANE_A_PROTECTED_FILES,
  WIZARD_LAUNCH_AUTHORITY_PATH,
} from '@/platform/core/snapshotSeal';
import { mergeGeneratedVfsWithCanonicalSnapshot } from '@/services/canonicalLaunchVfs';

function createSnapshot(): SiteBundleSnapshot {
  return {
    snapshotId: 'lane_a_snapshot',
    businessName: 'STELLAR BEAUTY',
    industry: 'salon',
    pageRegistry: {
      homePageId: 'home',
      pages: {
        home: {
          pageId: 'home',
          title: 'Home',
          path: '/',
          filePath: '/src/pages/Home.tsx',
          isHome: true,
        },
      },
    },
    vfsFiles: {
      '/src/App.tsx': 'export default function App(){ return null; }',
      '/src/index.css': ':root { --primary: 0 0% 0%; }',
      '/src/pages/Home.tsx': 'export default function Home(){ return <main>Lane A scaffold</main>; }',
      '/src/unison/ui/index.ts': 'export {};',
    },
    routerFile: { path: '/src/App.tsx', content: 'export default function App(){ return null; }' },
    manifest: { routes: [], nav: [], layout: { header: 'none', footer: 'none' }, metadata: { title: 'STELLAR BEAUTY' } },
    bindings: {},
    calendars: {},
    popups: {},
    creatorData: { products: {}, services: {}, testimonials: {}, faqItems: {}, galleryItems: {}, teamMembers: {}, collections: {}, forms: {}, componentInstances: {} },
    componentInstances: {},
    routes: ['/'],
    homeRoute: '/',
    createdAt: '2026-08-29T00:00:00.000Z',
    meta: { source: 'wizard', industry: 'salon', themePresetId: 'editorial', templateId: 'salon-premium' },
  } as unknown as SiteBundleSnapshot;
}

function appContext() {
  return {
    generatedAt: '2026-08-29T00:00:00.000Z',
    industry: 'salon',
    themePresetId: 'editorial',
    templateId: 'salon-premium',
    entryPoint: '/src/App.tsx',
  };
}

function mergedFiles(snapshot: SiteBundleSnapshot) {
  return mergeGeneratedVfsWithCanonicalSnapshot(
    { '/src/pages/Home.tsx': 'export default function Home(){ return <main>Lane B body</main>; }' },
    snapshot.vfsFiles,
    snapshot,
  );
}

describe('snapshot seal Wizard ownership proof', () => {
  it('consumes canonical merge proof and persists the three-stage authority metadata', () => {
    const snapshot = createSnapshot();
    const sealed = sealSnapshot({
      artifact: createWizardCompileArtifact(snapshot),
      vfsFiles: mergedFiles(snapshot),
      appContext: appContext(),
      sealedBy: 'wizard-launch',
    });

    expect(sealed.meta.seal).toMatchObject({
      pipeline: 'lane-a+lane-b+stage-4b',
      registeredPageBodyAuthority: 'lane-b',
      registeredPageFiles: ['/src/pages/Home.tsx'],
      laneAProtectedFiles: [...WIZARD_LANE_A_PROTECTED_FILES].sort(),
    });
    expect(sealed.vfsFiles[WIZARD_LAUNCH_AUTHORITY_PATH]).toBeUndefined();
    expect(sealed.vfsFiles['/src/pages/Home.tsx']).toContain('Lane B body');
  });

  it('rejects missing, forged, and incomplete ownership proofs', () => {
    const snapshot = createSnapshot();
    const artifact = createWizardCompileArtifact(snapshot);
    const valid = mergedFiles(snapshot);

    const missing = { ...valid };
    delete missing[WIZARD_LAUNCH_AUTHORITY_PATH];
    expect(() => sealSnapshot({ artifact, vfsFiles: missing, appContext: appContext(), sealedBy: 'wizard-launch' }))
      .toThrow('missing /.unison/wizard-launch-authority.json');

    const forged = { ...valid };
    forged[WIZARD_LAUNCH_AUTHORITY_PATH] = JSON.stringify({
      ...JSON.parse(valid[WIZARD_LAUNCH_AUTHORITY_PATH]),
      laneAArtifactId: 'forged',
    });
    expect(() => sealSnapshot({ artifact, vfsFiles: forged, appContext: appContext(), sealedBy: 'wizard-launch' }))
      .toThrow('does not match the Lane A artifact');

    const incomplete = { ...valid };
    incomplete[WIZARD_LAUNCH_AUTHORITY_PATH] = JSON.stringify({
      ...JSON.parse(valid[WIZARD_LAUNCH_AUTHORITY_PATH]),
      registeredPageFiles: [],
    });
    expect(() => sealSnapshot({ artifact, vfsFiles: incomplete, appContext: appContext(), sealedBy: 'wizard-launch' }))
      .toThrow('page files do not match the Lane A registry');
  });
});
