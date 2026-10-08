import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
const restoreRevision = vi.fn(async () => ({ status: 'committed', persistedRevisionId: 'new' }));
vi.mock('@/services/vfsCommitService', () => ({ restoreRevision: (...a: unknown[]) => restoreRevision(...(a as [])) }));

import { checkpointLabel, pickUndoTarget, restoreCheckpoint, type Checkpoint } from '@/services/builder/checkpointService';
import { buildRenderedSiteDigest, __resetRenderedSiteDigestForTests } from '@/services/builder/renderedSiteDigest';

const cp = (id: string, kind: Checkpoint['kind']): Checkpoint => ({ id, kind, label: id, createdAt: '', source: kind, changes: [] });

describe('checkpoints', () => {
  it('labels AI checkpoints with the prompt and hides internal candidate ids', () => {
    expect(checkpointLabel('ai-builder', 'AI · change the heading')).toBe('AI · change the heading');
    expect(checkpointLabel('ai-builder', 'AI candidate abc')).toBe('AI change');
    expect(checkpointLabel('system-restore', null)).toBe('Restored checkpoint');
  });

  it('undo goes to the previous non-restore checkpoint', () => {
    const list = [cp('r3', 'restore'), cp('a2', 'ai'), cp('a1', 'ai'), cp('l0', 'launch')];
    expect(pickUndoTarget(list, 'a2')?.id).toBe('a1');
    expect(pickUndoTarget(list, 'r3')?.id).toBe('a2');
    expect(pickUndoTarget(list, 'l0')).toBeNull();
  });

  it('restores through the canonical restore with a label', async () => {
    await restoreCheckpoint({} as never, { id: 'a1', label: 'AI · x' }, 'Undo');
    expect(restoreRevision).toHaveBeenCalledWith(expect.objectContaining({ targetRevisionId: 'a1', label: 'Undo → AI · x' }));
  });
});

describe('rendered site digest', () => {
  it('describes the rendered route and unrendered pages from source', () => {
    __resetRenderedSiteDigestForTests();
    document.body.innerHTML = '<nav><a href="#/">Home</a><a href="#/menu">Menu</a></nav><section id="hero"><h1>Fresh pasta daily</h1><button data-ut-intent="nav.goto" data-ut-path="/book">Book</button></section>';
    const digest = buildRenderedSiteDigest({
      doc: document,
      route: '/',
      signature: 's1',
      vfsFiles: { '/src/pages/Menu.tsx': '<section><h2>Our menu</h2></section>' },
    });
    expect(digest).toContain('Fresh pasta daily');
    expect(digest).toContain('Book [nav.goto → /book]');
    expect(digest).toContain('Menu: Home | Menu');
    expect(digest).toContain('/src/pages/Menu.tsx');
    expect(digest).toContain('Our menu');
    expect(digest.length).toBeLessThanOrEqual(12_000);
  });
});
