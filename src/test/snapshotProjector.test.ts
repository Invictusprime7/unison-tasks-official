import { describe, expect, it } from 'vitest';
import type { SiteBundleSnapshot } from '@/platform/core/canonicalPipeline';
import {
  acknowledgePendingVfsOperations,
  clearPendingVfsOperations,
  getPendingVfsOperations,
  projectSnapshotVfsFiles,
  recordPendingVfsMutation,
  restorePendingVfsOperations,
  resolveSnapshot,
  serializePendingVfsOperations,
  type SnapshotResolution,
} from '@/services/snapshotProjector';

function snapshotWith(files: Record<string, string>): SiteBundleSnapshot {
  return {
    snapshotId: 'snapshot-authority-test',
    businessName: 'Manifest Business',
    industry: 'restaurant',
    pageRegistry: { pages: {} } as SiteBundleSnapshot['pageRegistry'],
    vfsFiles: files,
    routerFile: { path: '/src/App.tsx', content: files['/src/App.tsx'] || '' },
    manifest: {} as SiteBundleSnapshot['manifest'],
    bindings: {},
    calendars: {},
    popups: {},
    creatorData: {} as SiteBundleSnapshot['creatorData'],
    componentInstances: {},
    routes: ['/'],
    homeRoute: '/',
    createdAt: '2026-07-21T00:00:00.000Z',
    meta: {
      source: 'wizard',
      systemId: 'booking',
      industry: 'restaurant',
      verticalContractId: 'booking',
      themePresetId: 'restaurant-warm',
      templateId: 'restaurant-premium',
      themeInjection: {
        version: '1.0',
        stage: '4b',
        presetId: 'restaurant-warm',
        cssPath: '/src/index.css',
      },
      seal: {
        version: '1.0',
        sealedAt: '2026-07-21T00:00:00.000Z',
        sealedBy: 'wizard-launch',
        compileArtifactId: 'compile-authority-test',
        fileCount: Object.keys(files).length,
      },
    },
  };
}

describe('snapshot projector', () => {
  it('keeps scoped pending creates, replacements and deletes over a stale snapshot', () => {
    const snapshot = snapshotWith({
      '/src/App.tsx': 'router',
      '/src/pages/Home.tsx': 'old home',
      '/src/pages/Removed.tsx': 'old removed page',
    });
    const resolution: SnapshotResolution = { snapshot, isWizardDraft: true, themePresetId: 'restaurant-warm', projectionScope: 'draft-a' };
    const before = { ...snapshot.vfsFiles };
    const live = { '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'new home', '/src/pages/New.tsx': 'new page' };
    try {
      recordPendingVfsMutation({ scope: 'draft-a', baseRevisionId: 'rev-1', candidateRevisionId: 'rev-2', beforeFiles: before, afterFiles: live, operationId: 'candidate-2' });
      const projected = projectSnapshotVfsFiles(live, resolution);
      expect(projected['/src/pages/Home.tsx']).toBe('new home');
      expect(projected['/src/pages/New.tsx']).toBe('new page');
      expect(projected['/src/pages/Removed.tsx']).toBeUndefined();
      expect(getPendingVfsOperations('draft-a')).toHaveLength(1);
    } finally {
      clearPendingVfsOperations('draft-a');
    }
  });

  it('does not leak a pending operation between drafts and only acknowledges a complete operation', () => {
    const snapshot = snapshotWith({ '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'old', '/src/pages/Removed.tsx': 'old removed' });
    const draftA: SnapshotResolution = { snapshot, isWizardDraft: true, themePresetId: 'restaurant-warm', projectionScope: 'draft-a' };
    const draftB: SnapshotResolution = { snapshot, isWizardDraft: true, themePresetId: 'restaurant-warm', projectionScope: 'draft-b' };
    try {
      recordPendingVfsMutation({ scope: 'draft-a', beforeFiles: snapshot.vfsFiles, afterFiles: { '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'new' }, operationId: 'operation-a' });
      expect(projectSnapshotVfsFiles(snapshot.vfsFiles, draftB)['/src/pages/Home.tsx']).toBe('old');
      // The snapshot contains the replacement but still resurrects the delete,
      // so it cannot acknowledge the entire candidate.
      expect(acknowledgePendingVfsOperations({ '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'new', '/src/pages/Removed.tsx': 'old removed' }, 'draft-a')).toEqual([]);
      expect(getPendingVfsOperations('draft-a')).toHaveLength(1);
      expect(acknowledgePendingVfsOperations({ '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'new' }, 'draft-a')).toEqual(['operation-a']);
      expect(getPendingVfsOperations('draft-a')).toEqual([]);
    } finally {
      clearPendingVfsOperations('draft-a');
      clearPendingVfsOperations('draft-b');
    }
  });

  it('round-trips pending operations through a matching draft recovery journal', () => {
    const snapshot = snapshotWith({ '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'old' });
    const resolution: SnapshotResolution = { snapshot, isWizardDraft: true, themePresetId: 'restaurant-warm', projectionScope: 'draft-recovery' };
    try {
      recordPendingVfsMutation({
        scope: 'draft-recovery',
        beforeFiles: snapshot.vfsFiles,
        afterFiles: { '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'recovered' },
        operationId: 'recovery-operation',
      });
      const journal = serializePendingVfsOperations('draft-recovery');
      clearPendingVfsOperations('draft-recovery');

      expect(restorePendingVfsOperations(journal, 'another-draft')).toEqual([]);
      expect(restorePendingVfsOperations(journal, 'draft-recovery')).toEqual(['recovery-operation']);
      expect(getPendingVfsOperations('draft-recovery')).toMatchObject([{
        operationId: 'recovery-operation',
        changes: [{ type: 'replace', path: '/src/pages/Home.tsx', contents: 'recovered' }],
      }]);
      expect(projectSnapshotVfsFiles(snapshot.vfsFiles, resolution)['/src/pages/Home.tsx']).toBe('recovered');
    } finally {
      clearPendingVfsOperations('draft-recovery');
      clearPendingVfsOperations('another-draft');
    }
  });

  it('acknowledges only operations captured by the successful server transaction', () => {
    const files = { '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'new', '/src/pages/About.tsx': 'new' };
    try {
      recordPendingVfsMutation({ scope: 'draft-ack', beforeFiles: { '/src/App.tsx': 'router' }, afterFiles: { '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'new' }, operationId: 'server-acknowledged' });
      recordPendingVfsMutation({ scope: 'draft-ack', beforeFiles: { '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'new' }, afterFiles: files, operationId: 'newer-operation' });

      expect(acknowledgePendingVfsOperations(files, 'draft-ack', { operationIds: ['server-acknowledged'] })).toEqual(['server-acknowledged']);
      expect(getPendingVfsOperations('draft-ack').map(({ operationId }) => operationId)).toEqual(['newer-operation']);
    } finally {
      clearPendingVfsOperations('draft-ack');
    }
  });

  it('replaces a fully formed template preset with the authoritative snapshot VFS', () => {
    const snapshot = snapshotWith({
      '/src/App.tsx': 'export default function App() { return <main>Deterministic manifest</main>; }',
      '/src/index.css': ':root { --primary: 24 90% 45%; }',
      '/src/pages/Home.tsx': 'export default function Home() { return <section>Manifest home</section>; }',
    });
    const resolution: SnapshotResolution = {
      snapshot,
      isWizardDraft: true,
      themePresetId: 'restaurant-warm',
    };
    const templatePresetFiles = {
      '/src/App.tsx': 'export default function App() { return <main><h1>Exhale Salon</h1></main>; }',
      '/src/index.css': ':root { --primary: 320 80% 55%; }',
      '/src/pages/Home.tsx': 'export default function Home() { return <section>Template home</section>; }',
      '/src/template-only.tsx': 'export default function PresetOnly() { return null; }',
    };

    const projected = projectSnapshotVfsFiles(templatePresetFiles, resolution);

    expect(projected['/src/App.tsx']).toContain('Deterministic manifest');
    expect(projected['/src/App.tsx']).not.toContain('Exhale Salon');
    expect(projected['/src/index.css']).toContain('--primary: 24 90% 45%');
    expect(projected['/src/pages/Home.tsx']).toContain('Manifest home');
    expect(projected['/src/template-only.tsx']).toBeUndefined();
    expect(projected['/.unison/site-bundle-snapshot.json']).toContain('snapshot-authority-test');
  });

  it('removes stale root runtime files instead of letting them compete after Sandpack flattening', () => {
    const snapshot = snapshotWith({
      '/src/App.tsx': "import Home from './pages/Home'; export default function App() { return <Home />; }",
      '/src/index.css': ':root { --primary: 24 90% 45%; }',
      '/src/pages/Home.tsx': 'export default function Home() { return <section>Canonical home</section>; }',
    });
    const resolution: SnapshotResolution = {
      snapshot,
      isWizardDraft: true,
      themePresetId: 'restaurant-warm',
    };

    const projected = projectSnapshotVfsFiles({
      ...snapshot.vfsFiles,
      '/App.tsx': 'export default function App() { return <main>Legacy fallback</main>; }',
      '/pages/Home.tsx': 'export default function Home() { return <main>Minimal home</main>; }',
      '/template.css': ':root { --primary: 320 80% 55%; }',
      '/.unison/app-context.json': '{"themePresetId":"restaurant-warm"}',
    }, resolution);

    expect(projected['/App.tsx']).toBeUndefined();
    expect(projected['/pages/Home.tsx']).toBeUndefined();
    expect(projected['/template.css']).toBeUndefined();
    expect(projected['/src/App.tsx']).toContain("from './pages/Home'");
    expect(projected['/src/pages/Home.tsx']).toContain('Canonical home');
    expect(projected['/.unison/app-context.json']).toContain('restaurant-warm');
  });

  it('rehydrates an explicitly compacted snapshot from the route VFS', () => {
    const compactSnapshot = snapshotWith({});
    const sourceFiles = {
      '/src/App.tsx': 'export default function App() { return <main>Recovered manifest</main>; }',
      '/src/index.css': ':root { --primary: 24 90% 45%; }',
      '/.unison/site-bundle-snapshot.json': JSON.stringify({ ...compactSnapshot, vfsFiles: {} }),
    };

    const resolution = resolveSnapshot(sourceFiles, {
      siteBundleSnapshot: compactSnapshot,
      snapshotVfsCompacted: true,
    } as never);
    const projected = projectSnapshotVfsFiles(sourceFiles, resolution);

    expect(resolution.snapshot?.vfsFiles['/src/App.tsx']).toContain('Recovered manifest');
    expect(projected['/src/App.tsx']).toContain('Recovered manifest');
  });

  it('treats an unmarked metadata-only snapshot as invalid', () => {
    const compactSnapshot = snapshotWith({});
    const resolution = resolveSnapshot({
      '/src/App.tsx': 'export default function App() { return <main>Template preset</main>; }',
      '/.unison/site-bundle-snapshot.json': JSON.stringify(compactSnapshot),
    }, { siteBundleSnapshot: compactSnapshot } as never);

    expect(resolution.snapshot).toBeNull();
    expect(resolution.isWizardDraft).toBe(true);
  });

  it('derives projection scope from a draft before applying pending operations', () => {
    const snapshot = snapshotWith({ '/src/App.tsx': 'router', '/src/pages/Home.tsx': 'old' });
    const resolution = resolveSnapshot(snapshot.vfsFiles, { siteBundleSnapshot: snapshot, draftId: 'draft-scoped' } as never);
    expect(resolution.projectionScope).toBe('draft-scoped');
  });

  it('rejects preview hydration from an unsealed Wizard snapshot', () => {
    const unsealed = snapshotWith({
      '/src/App.tsx': 'export default function App() { return null; }',
      '/src/index.css': ':root { --primary: 24 90% 45%; }',
    });
    delete unsealed.meta.seal;

    expect(() => resolveSnapshot(unsealed.vfsFiles, { siteBundleSnapshot: unsealed } as never))
      .toThrow('requires a committed sealed SiteBundleSnapshot');
  });
});
