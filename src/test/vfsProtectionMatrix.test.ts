import { describe, expect, it } from 'vitest';
import { canDirectlyAuthorVfsPath, classifyVfsProtection } from '@/services/vfsProtectionMatrix';

describe('post-launch VFS protection matrix', () => {
  it.each([
    ['/src/App.tsx', 'immutable-infrastructure'],
    ['/.unison/site-bundle-snapshot.json', 'immutable-infrastructure'],
    ['/src/unison/ui/motion.tsx', 'immutable-infrastructure'],
    ['/src/integrations/supabase/client.ts', 'capability-sensitive'],
    ['/src/components/recipes/Hero.ts', 'system-generated-replaceable'],
    ['/src/pages/Home.tsx', 'builder-authorable'],
    ['/src/index.css', 'builder-authorable'],
    ['/public/hero.jpg', 'user-content-data-owned'],
  ] as const)('classifies %s as %s', (path, classification) => {
    expect(classifyVfsProtection({ path }).classification).toBe(classification);
  });

  it('only opens replaceable presentation paths after handoff to a Builder authoring source', () => {
    const replaceable = classifyVfsProtection({ path: '/src/components/recipes/Hero.ts' });
    expect(canDirectlyAuthorVfsPath(replaceable, 'playground-edit', true)).toBe(true);
    expect(canDirectlyAuthorVfsPath(replaceable, 'ai-builder', true)).toBe(true);
    expect(canDirectlyAuthorVfsPath(replaceable, 'playground-edit', false)).toBe(false);
    expect(canDirectlyAuthorVfsPath(replaceable, 'theme-change', true)).toBe(false);

    const immutable = classifyVfsProtection({ path: '/src/App.tsx' });
    expect(canDirectlyAuthorVfsPath(immutable, 'ai-builder', true)).toBe(false);
    expect(classifyVfsProtection({ path: '/src/App.tsx', canonicalRouterActive: false }).classification)
      .toBe('builder-authorable');
  });
});
