import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/cmsRecordService', () => ({
  listCmsRecords: vi.fn(async () => []), createCmsRecord: vi.fn(), removeCmsRecord: vi.fn(),
  updateCmsRecord: vi.fn(async () => ({ id: 'p1' })),
  listContentRecords: vi.fn(async () => []), getContentRecord: vi.fn(), createContentRecord: vi.fn(), updateContentRecord: vi.fn(),
}));

import { resolvePropertyOwner } from '@/services/editor/propertyOwnerResolver';
import { executeEditorCommand } from '@/services/editor/editorCommandService';
import { canIssue } from '@/services/editor/editorCapabilities';
import { parseProjectBackendDescriptor } from '@/services/project-backend/projectBackendResolver';
import { verifyRuntimeIdentity } from '@/services/project-backend/projectBackendHealth';

const cms = readFileSync('supabase/functions/cms-records/index.ts', 'utf8');
const runtimeRead = readFileSync('supabase/functions/site-runtime-read/index.ts', 'utf8');

describe('Phase 0 — project scope on saved items', () => {
  it('cms-records requires a site and writes project_id on create', () => {
    expect(cms).toContain('saved items belong to one site');
    expect(cms).toContain('business_id: body.businessId, project_id: projectId');
    expect(cms).toContain('.eq("project_id", projectId)');
  });
  it('site-runtime-read filters catalog by project', () => {
    expect(runtimeRead).toContain('project_id.eq.${context.projectId}');
  });
});

describe('Phase 1 — editor commands', () => {
  it('a resource mark routes text edits to the resource, never page source', () => {
    expect(resolvePropertyOwner({ type: 'set-text', text: 'x', target: { resourceMark: 'products#p1.name' } })).toBe('resource');
    expect(resolvePropertyOwner({ type: 'set-text', text: 'x', target: {} })).toBe('source');
    expect(resolvePropertyOwner({ type: 'set-style', styles: {}, target: { resourceMark: 'products#p1.name' } })).toBe('presentation');
    expect(resolvePropertyOwner({ type: 'set-link', href: '/a', target: {} })).toBe('route');
  });
  it('inline cannot issue structural commands', () => {
    expect(canIssue('inline', 'delete')).toBe(false);
    expect(canIssue('ai', 'create-page')).toBe(true);
  });
  it('source edits without a host executor fail with a clear message', async () => {
    const r = await executeEditorCommand({ type: 'set-text', text: 'x', target: {} }, { source: 'toolbar', resource: { businessId: 'b', mode: 'builder' } });
    expect(r.ok).toBe(false);
    expect(r.lane).toBe('source');
  });
});

describe('Phase 2 — backend resolver', () => {
  it('parses shared-legacy and blocks cross-site identities', () => {
    const d = parseProjectBackendDescriptor({ bindingId: 'x', projectId: 'A', siteId: 'S', mode: 'dedicated', status: 'ready' });
    expect(verifyRuntimeIdentity(d, { businessId: 'b', projectId: 'B', siteId: 'S', schemaVersion: 1 }).ok).toBe(false);
    expect(verifyRuntimeIdentity(d, { businessId: 'b', projectId: 'A', siteId: 'S', schemaVersion: 1 }).ok).toBe(true);
    expect(() => parseProjectBackendDescriptor({})).toThrow();
  });
});
