/**
 * M1 close-out — persisted publish parity evidence.
 *
 * Exit condition: canonical VFS implementation === published runtime
 * implementation. This test drives the real publish path
 * (`deployToProvider` with a `projectId`), which loads the durable
 * publish-ready revision from the ledger and ships that payload. It proves:
 *
 *  1. The bytes handed to the deploy provider are the canonical composition
 *     bytes — never in-memory caller state.
 *  2. Canonical identity (`data-ut-section-id`, `data-ut-variant`) survives
 *     the publish projection for every emitted section.
 *  3. The published file fingerprint equals the canonical VFS fingerprint,
 *     so no file may exist only as registry metadata or only in preview.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { computeFilesFingerprint } from '@/services/publishAttestation';
import { UNISON_ATTRIBUTION_ASSET } from '@/services/export/unisonAttribution';

const mocks = vi.hoisted(() => {
  const projectQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  projectQuery.update = vi.fn(() => projectQuery);
  projectQuery.eq = vi.fn(() => projectQuery);
  projectQuery.select = vi.fn(() => projectQuery);
  projectQuery.maybeSingle = vi.fn();
  return {
    invoke: vi.fn(),
    from: vi.fn(() => projectQuery),
    loadLatestPublishReadyRevisionForProject: vi.fn(),
    recordRepublishEvent: vi.fn(),
    projectQuery,
  };
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: mocks.invoke }, from: mocks.from },
}));

vi.mock('@/services/vfsCommitService', () => ({
  loadLatestPublishReadyRevisionForProject: mocks.loadLatestPublishReadyRevisionForProject,
  recordRepublishEvent: mocks.recordRepublishEvent,
}));

import { deployToProvider } from '@/services/deploymentService';

const TEMPLATE_IDS = ['salon-premium', 'store-premium', 'store-minimal', 'store-boutique'];

const INDEX_HTML =
  '<!doctype html><html><head><title>Canonical</title></head><body><div id="root"></div></body></html>';

function canonicalVfsForTemplate(templateId: string): Record<string, string> {
  const template = getCompositionById(templateId);
  expect(template, `composition ${templateId} must exist`).toBeTruthy();
  const files = compositionToReactFileSet(template!, '/src/pages/Home.tsx');
  return { ...files, '/index.html': INDEX_HTML };
}

function identityTokens(files: Record<string, string>) {
  const sectionIds = new Set<string>();
  const variantIds = new Set<string>();
  for (const content of Object.values(files)) {
    for (const match of content.matchAll(/data-ut-section-id=(?:"|\{")([^"}]+)(?:"|"\})/g)) {
      sectionIds.add(match[1]);
    }
    for (const match of content.matchAll(/data-ut-variant=(?:"|\{")([^"}]+)(?:"|"\})/g)) {
      variantIds.add(match[1]);
    }
  }
  return { sectionIds, variantIds };
}

function publishedPayload(): Record<string, string> {
  const call = mocks.invoke.mock.calls.at(-1);
  expect(call?.[0]).toBe('publish-site');
  return (call?.[1] as { body: { files: Record<string, string> } }).body.files;
}

describe('persisted publish parity (M1 exit condition)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.invoke.mockResolvedValue({
      data: { status: 'success', provider: 'vercel', url: 'https://published.test' },
      error: null,
    });
    mocks.projectQuery.maybeSingle.mockResolvedValue({ data: { id: 'project-1' }, error: null });
  });

  it.each(TEMPLATE_IDS)('publishes the canonical VFS bytes for %s', async (templateId) => {
    const canonical = canonicalVfsForTemplate(templateId);
    mocks.loadLatestPublishReadyRevisionForProject.mockResolvedValue({
      id: `revision-${templateId}`,
      projectId: 'project-1',
      businessId: 'business-1',
      draftId: 'draft-1',
      vfsFiles: canonical,
      siteBundleSnapshot: null,
      vfsHash: 'hash-1',
    });

    const result = await deployToProvider({
      provider: 'vercel',
      projectId: 'project-1',
      // Deliberately stale, un-committed caller state — must never be shipped.
      files: { '/index.html': '<html><body>stale caller state</body></html>' },
    });

    expect(result.status).toBe('success');

    const published = publishedPayload();
    expect(published['index.html']).not.toContain('stale caller state');

    // 1. Byte parity for every canonical file except index.html, which the
    //    publish path augments with the required attribution script tag.
    for (const [path, content] of Object.entries(canonical)) {
      const publishedPath = path.replace(/^\/+/, '');
      if (publishedPath === 'index.html') {
        expect(published[publishedPath]).toContain('<div id="root"></div>');
        expect(published[publishedPath]).toContain(UNISON_ATTRIBUTION_ASSET);
        continue;
      }
      expect(published[publishedPath], `${publishedPath} must publish canonical bytes`).toBe(content);
    }

    // No published file may exist outside the canonical set (attribution aside).
    const canonicalPaths = new Set(Object.keys(canonical).map((p) => p.replace(/^\/+/, '')));
    for (const publishedPath of Object.keys(published)) {
      if (publishedPath === UNISON_ATTRIBUTION_ASSET) continue;
      expect(canonicalPaths.has(publishedPath), `${publishedPath} is not canonical`).toBe(true);
    }
  });

  it.each(TEMPLATE_IDS)('preserves canonical section and variant identity for %s', async (templateId) => {
    const canonical = canonicalVfsForTemplate(templateId);
    mocks.loadLatestPublishReadyRevisionForProject.mockResolvedValue({
      id: `revision-${templateId}`,
      projectId: 'project-1',
      businessId: 'business-1',
      draftId: 'draft-1',
      vfsFiles: canonical,
      siteBundleSnapshot: null,
      vfsHash: 'hash-1',
    });

    await deployToProvider({ provider: 'vercel', projectId: 'project-1', files: {} });

    const expected = identityTokens(canonical);
    const actual = identityTokens(publishedPayload());
    expect([...actual.sectionIds].sort()).toEqual([...expected.sectionIds].sort());
    expect([...actual.variantIds].sort()).toEqual([...expected.variantIds].sort());
  });

  it('keeps the published fingerprint equal to the canonical VFS fingerprint', async () => {
    const canonical = canonicalVfsForTemplate('store-premium');
    mocks.loadLatestPublishReadyRevisionForProject.mockResolvedValue({
      id: 'revision-fingerprint',
      projectId: 'project-1',
      businessId: 'business-1',
      draftId: 'draft-1',
      vfsFiles: canonical,
      siteBundleSnapshot: null,
      vfsHash: 'hash-1',
    });

    await deployToProvider({ provider: 'vercel', projectId: 'project-1', files: {} });

    const published = publishedPayload();
    const comparable = Object.fromEntries(
      Object.entries(published).filter(
        ([path]) => path !== UNISON_ATTRIBUTION_ASSET && path !== 'index.html',
      ),
    );
    const canonicalComparable = Object.fromEntries(
      Object.entries(canonical)
        .filter(([path]) => path.replace(/^\/+/, '') !== 'index.html')
        .map(([path, content]) => [path.replace(/^\/+/, ''), content]),
    );

    const publishedPrint = await computeFilesFingerprint(comparable);
    const canonicalPrint = await computeFilesFingerprint(canonicalComparable);
    expect(publishedPrint.fingerprint).toBe(canonicalPrint.fingerprint);
    expect(publishedPrint.fileCount).toBe(canonicalPrint.fileCount);
    expect(publishedPrint.fileCount).toBeGreaterThan(0);
  });

  it('refuses to publish when no publish-ready revision exists', async () => {
    mocks.loadLatestPublishReadyRevisionForProject.mockResolvedValue(null);

    const result = await deployToProvider({
      provider: 'vercel',
      projectId: 'project-1',
      files: canonicalVfsForTemplate('salon-premium'),
    });

    expect(result.status).toBe('error');
    expect(result.error).toContain('no publish-ready revision');
    expect(mocks.invoke).not.toHaveBeenCalled();
  });
});
