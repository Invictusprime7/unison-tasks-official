import { describe, expect, it } from 'vitest';
import { verifyBindingProjection } from '@/services/semanticVerification';

const binding = {
  bindingId: 'bind-book', coreIntent: 'booking.create', intent: 'calendar.open',
  sourcePageId: 'home', sourceLabel: 'Book', targetId: 'calendar', targetType: 'calendar',
};

describe('binding semantic verification', () => {
  it('requires both the accepted binding manifest and runtime projection', () => {
    const result = verifyBindingProjection({
      snapshot: { bindings: { 'bind-book': binding } } as never,
      files: { '/src/pages/Home.tsx': '<button data-ut-binding-id="bind-book" data-ut-intent="booking.create">Book</button>' },
      boundBindingIds: ['bind-book'], unboundBindings: [],
    });
    expect(result).toMatchObject({ ok: true, failures: [] });
  });

  it('rejects a manifest-only binding that preview cannot execute', () => {
    const result = verifyBindingProjection({
      snapshot: { bindings: { 'bind-book': binding } } as never,
      files: { '/src/pages/Home.tsx': '<button>Book</button>' },
      boundBindingIds: ['bind-book'], unboundBindings: [],
    });
    expect(result.ok).toBe(false);
    expect(result.failures[0]).toContain('preview runtime');
  });

  it('rejects an unbound control that remains projected into preview', () => {
    const result = verifyBindingProjection({
      snapshot: { bindings: {} } as never,
      files: { '/src/pages/Home.tsx': '<button data-ut-binding-id="bind-book">Book</button>' },
      boundBindingIds: [], unboundBindings: [binding as never],
    });
    expect(result.ok).toBe(false);
    expect(result.failures[0]).toContain('preview runtime');
  });
});
