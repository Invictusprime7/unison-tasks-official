import { readFileSync } from 'node:fs';
import { useEffect } from 'react';
import { act, renderHook } from '@testing-library/react';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { resolvePersistedEditorIdentity, resolveProjectActivePagePath } from '@/services/projectRuntimeEnvelope';
import type { ProjectRuntimeProjection } from '@/services/projectRuntimeEnvelope';

const source = ts.createSourceFile(
  'WebBuilder.tsx', readFileSync('src/components/creatives/WebBuilder.tsx', 'utf8'),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX,
);

function loadHydrationEffect(
  dependencies: Record<string, unknown>,
  anchor = 'resolvePersistedEditorIdentity(hydratedRevision)',
): () => void {
  const matches: ts.CallExpression[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'useEffect' &&
      node.arguments[0]?.getText(source).includes(anchor)) {
      matches.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (matches.length !== 1) throw new Error('Expected exactly one persisted revision adoption effect');
  const compiled = ts.transpileModule(matches[0].getText(source), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None },
  }).outputText;
  return new Function(...Object.keys(dependencies), compiled).bind(null, ...Object.values(dependencies));
}

function deferredProjection() {
  let resolve!: (projection: ProjectRuntimeProjection) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<ProjectRuntimeProjection>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function revision(suffix: string, revisionId = `revision-${suffix}`) {
  return {
    id: revisionId, draftId: `draft-${suffix}`, projectId: `project-${suffix}`, businessId: `business-${suffix}`,
    siteBundleSnapshot: {
      pageRegistry: { pages: { home: { pageId: `home-${suffix}` } } },
      creatorData: { componentInstances: {} }, bindings: {}, calendars: {}, popups: {},
      vfsFiles: { '/src/pages/Home.tsx': `page-${suffix}` },
    },
  };
}

function createDependencies() {
  return {
    useEffect, resolvePersistedEditorIdentity, resolveProjectActivePagePath,
    currentDraftIdRef: { current: null as string | null },
    templateFiles: { setCurrentDraftId: vi.fn(), setCurrentProjectId: vi.fn() },
    setCurrentDraftId: vi.fn(), hydrateCanonicalPlayground: vi.fn(),
    setPlaygroundBindings: vi.fn(), setPlaygroundCalendars: vi.fn(), setPlaygroundPopups: vi.fn(),
    setActivePublishedRevisionId: vi.fn(), setRuntimeProjectionRevisionId: vi.fn(),
    setActivePagePath: vi.fn(), setCanonicalHydrationError: vi.fn(),
    loadProjectRuntimeProjection: vi.fn<() => Promise<ProjectRuntimeProjection>>(),
    console: { warn: vi.fn() },
  };
}

const projection = { activePublishedRevisionId: 'published-current', activePagePath: '/src/pages/Home.tsx' };

describe('WebBuilder persisted revision adoption effect', () => {
  it('fetches the advanced committed revision even when the draft identity is unchanged', async () => {
    const files = { '/src/App.tsx': 'committed router' };
    const dependencies = {
      useEffect,
      currentDraftId: 'draft-same', resolvedProjectId: 'project-same', projectId: undefined,
      effectiveRouteState: undefined, hydrationNonce: 0,
      hydratedRevisionRef: { current: null as string | null },
      setCanonicalHydrationError: vi.fn(), setHydratedRevision: vi.fn(),
      setRuntimeProjectionRevisionId: vi.fn(), setCurrentRevisionId: vi.fn(),
      loadProjectedRevisionForDraft: vi.fn()
        .mockResolvedValueOnce({ ...revision('same', 'revision-1'), vfsFiles: files })
        .mockResolvedValueOnce({ ...revision('same', 'revision-2'), vfsFiles: files }),
      loadRevision: vi.fn(), loadLatestRevisionForProject: vi.fn(),
      virtualFSRef: { current: { getSandpackFiles: () => files } },
      computeBuilderVfsSignature: JSON.stringify,
      replaceCommittedWizardFiles: vi.fn(), importBuilderFiles: vi.fn(), launchEntryPoint: '/src/App.tsx',
      console: { log: vi.fn(), warn: vi.fn() },
    };
    const { rerender } = renderHook(({ currentRevisionId }) => loadHydrationEffect({
      ...dependencies, currentRevisionId,
    }, 'const hydrationKey =')(), { initialProps: { currentRevisionId: 'revision-1' } });
    await act(async () => {});
    rerender({ currentRevisionId: 'revision-2' });
    await act(async () => {});

    expect(dependencies.loadProjectedRevisionForDraft).toHaveBeenCalledTimes(2);
    expect(dependencies.setHydratedRevision).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'revision-2' }));
    expect(dependencies.loadRevision).not.toHaveBeenCalled();
    expect(dependencies.loadLatestRevisionForProject).not.toHaveBeenCalled();
  });

  it('adopts durable identity and bindings once despite hook-wrapper rerenders', async () => {
    const dependencies = createDependencies();
    const pending = deferredProjection();
    dependencies.loadProjectRuntimeProjection.mockReturnValue(pending.promise);
    const hydratedRevision = revision('first');
    const { rerender } = renderHook(() => loadHydrationEffect({
      ...dependencies, hydratedRevision, templateFiles: { ...dependencies.templateFiles },
    })());

    expect(dependencies.currentDraftIdRef.current).toBe('draft-first');
    expect(dependencies.templateFiles.setCurrentDraftId).toHaveBeenCalledExactlyOnceWith('draft-first');
    expect(dependencies.templateFiles.setCurrentProjectId).toHaveBeenCalledExactlyOnceWith('project-first');
    expect(dependencies.setCurrentDraftId).toHaveBeenCalledExactlyOnceWith('draft-first');
    expect(dependencies.setPlaygroundBindings).toHaveBeenCalledWith(hydratedRevision.siteBundleSnapshot.bindings);
    rerender();
    expect(dependencies.loadProjectRuntimeProjection).toHaveBeenCalledExactlyOnceWith('project-first', 'draft-first');
    await act(async () => pending.resolve(projection));
    expect(dependencies.setRuntimeProjectionRevisionId).toHaveBeenLastCalledWith('revision-first');
    expect(dependencies.setActivePagePath).toHaveBeenCalledExactlyOnceWith('/src/pages/Home.tsx');
  });

  it.each(['resolve', 'reject'] as const)('ignores stale %s after switching projects', async (settlement) => {
    const dependencies = createDependencies();
    const previous = deferredProjection();
    const current = deferredProjection();
    dependencies.loadProjectRuntimeProjection.mockReturnValueOnce(previous.promise).mockReturnValueOnce(current.promise);
    const { rerender } = renderHook(({ hydratedRevision }) => loadHydrationEffect({
      ...dependencies, hydratedRevision,
    })(), { initialProps: { hydratedRevision: revision('previous') } });
    rerender({ hydratedRevision: revision('current') });
    await act(async () => current.resolve(projection));
    await act(async () => {
      if (settlement === 'resolve') previous.resolve({ ...projection, activePublishedRevisionId: 'stale' });
      else previous.reject(new Error('Stale project lookup failed'));
    });

    expect(dependencies.currentDraftIdRef.current).toBe('draft-current');
    expect(dependencies.templateFiles.setCurrentProjectId).toHaveBeenLastCalledWith('project-current');
    expect(dependencies.setRuntimeProjectionRevisionId).toHaveBeenLastCalledWith('revision-current');
    expect(dependencies.setActivePublishedRevisionId).toHaveBeenLastCalledWith('published-current');
    expect(dependencies.setActivePagePath).toHaveBeenCalledOnce();
    expect(dependencies.setCanonicalHydrationError).not.toHaveBeenCalled();
  });

  it('loads the next committed revision of the same draft', async () => {
    const dependencies = createDependencies();
    dependencies.loadProjectRuntimeProjection.mockResolvedValue(projection);
    const { rerender } = renderHook(({ hydratedRevision }) => loadHydrationEffect({
      ...dependencies, hydratedRevision,
    })(), { initialProps: { hydratedRevision: revision('same', 'revision-1') } });
    await act(async () => {});
    rerender({ hydratedRevision: revision('same', 'revision-2') });
    await act(async () => {});

    expect(dependencies.loadProjectRuntimeProjection).toHaveBeenCalledTimes(2);
    expect(dependencies.setRuntimeProjectionRevisionId).toHaveBeenLastCalledWith('revision-2');
    expect(dependencies.currentDraftIdRef.current).toBe('draft-same');
  });

  it('does not invent identity before a revision is loaded', () => {
    const dependencies = createDependencies();
    renderHook(() => loadHydrationEffect({ ...dependencies, hydratedRevision: null })());
    expect(dependencies.templateFiles.setCurrentDraftId).not.toHaveBeenCalled();
    expect(dependencies.templateFiles.setCurrentProjectId).not.toHaveBeenCalled();
    expect(dependencies.loadProjectRuntimeProjection).not.toHaveBeenCalled();
  });
});