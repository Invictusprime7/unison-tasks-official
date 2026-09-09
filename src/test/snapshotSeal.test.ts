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
    { '/src/pages/Home.tsx': 'export default function Home(){ return <main>Canonical body</main>; }' },
    snapshot.vfsFiles,
    snapshot,
  );
}

describe('snapshot seal Wizard ownership proof', () => {
  it('projects the finalized router without mutating the compile candidate', () => {
    const snapshot = createSnapshot();
    const originalRouter = snapshot.routerFile.content;
    const files = { ...snapshot.vfsFiles, '/src/App.tsx': 'export default function App(){return <main>Final</main>}' };
    const sealed = sealSnapshot({ artifact: snapshot, vfsFiles: files, appContext: appContext(), sealedBy: 'recompile' });

    expect(sealed.routerFile.content).toBe(sealed.vfsFiles['/src/App.tsx']);
    expect(snapshot.routerFile.content).toBe(originalRouter);
    expect(snapshot.vfsFiles['/src/App.tsx']).toBe(originalRouter);
  });

  it.each(['wizard-launch', 'recompile'] as const)('consumes the v2 proof for %s and persists canonical compiler authority metadata', (sealedBy) => {
    const snapshot = createSnapshot();
    const sealed = sealSnapshot({
      artifact: createWizardCompileArtifact(snapshot),
      vfsFiles: mergedFiles(snapshot),
      appContext: appContext(),
      sealedBy,
    });

    expect(sealed.meta.seal).toMatchObject({
      pipeline: 'canonical-compiler+stage-4b',
      authorityProofVersion: '2.0',
      registeredPageBodyAuthority: 'canonical-compiler',
      registeredPageFiles: ['/src/pages/Home.tsx'],
      protectedFilePatterns: [...WIZARD_LANE_A_PROTECTED_FILES].sort(),
    });
    expect(sealed.vfsFiles[WIZARD_LAUNCH_AUTHORITY_PATH]).toBeUndefined();
    expect(sealed.vfsFiles['/src/pages/Home.tsx']).toContain('Canonical body');
  });

  it('reads legacy v1 Lane B proofs without rewriting their provenance', () => {
    const snapshot = createSnapshot();
    const files = mergedFiles(snapshot);
    files[WIZARD_LAUNCH_AUTHORITY_PATH] = JSON.stringify({
      version: '1.0',
      laneAArtifactId: snapshot.snapshotId,
      registeredPageBodyAuthority: 'lane-b',
      registeredPageFiles: ['/src/pages/Home.tsx'],
      laneAProtectedFiles: [...WIZARD_LANE_A_PROTECTED_FILES],
    });

    const sealed = sealSnapshot({
      artifact: createWizardCompileArtifact(snapshot),
      vfsFiles: files,
      appContext: appContext(),
      sealedBy: 'wizard-launch',
    });

    expect(sealed.meta.seal).toMatchObject({
      pipeline: 'lane-a+lane-b+stage-4b',
      authorityProofVersion: '1.0',
      registeredPageBodyAuthority: 'lane-b',
      laneAProtectedFiles: [...WIZARD_LANE_A_PROTECTED_FILES].sort(),
    });
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
      compileArtifactId: 'forged',
    });
    expect(() => sealSnapshot({ artifact, vfsFiles: forged, appContext: appContext(), sealedBy: 'wizard-launch' }))
      .toThrow('does not match the compile artifact');

    const incomplete = { ...valid };
    incomplete[WIZARD_LAUNCH_AUTHORITY_PATH] = JSON.stringify({
      ...JSON.parse(valid[WIZARD_LAUNCH_AUTHORITY_PATH]),
      registeredPageFiles: [],
    });
    expect(() => sealSnapshot({ artifact, vfsFiles: incomplete, appContext: appContext(), sealedBy: 'wizard-launch' }))
      .toThrow('page files do not match the Lane A registry');
  });
});
