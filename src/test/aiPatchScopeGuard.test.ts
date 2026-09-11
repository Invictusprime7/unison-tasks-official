import { describe, it, expect } from 'vitest';
import { checkAiPatchScope, describeAiPatchScopeViolations } from '@/services/aiPatchScopeGuard';

const before: Record<string, string> = {
  '/src/App.tsx': 'router',
  '/src/main.tsx': 'entry',
  '/src/index.css': ':root{}',
  '/src/pages/Home.tsx': 'home v1',
  '/src/sections/HeroSplit.tsx': 'hero v1',
  '/src/integrations/supabase/client.ts': 'client',
};

describe('aiPatchScopeGuard', () => {
  it('allows page body, section module, and token surface edits', () => {
    const result = checkAiPatchScope(before, {
      ...before,
      '/src/pages/Home.tsx': 'home v2',
      '/src/sections/HeroSplit.tsx': 'hero v2',
      '/src/index.css': ':root{--x:1}',
    });
    expect(result.violations).toEqual([]);
    expect(result.allowed).toBe(true);
    expect(result.changedPaths.sort()).toEqual([
      '/src/index.css',
      '/src/pages/Home.tsx',
      '/src/sections/HeroSplit.tsx',
    ]);
  });

  it('ignores unchanged files so a full resent map is not a violation', () => {
    const result = checkAiPatchScope(before, { ...before });
    expect(result.allowed).toBe(true);
    expect(result.changedPaths).toEqual([]);
  });

  it('rejects rewrites of the deterministic router and runtime entry', () => {
    const result = checkAiPatchScope(before, { ...before, '/src/App.tsx': 'router v2' });
    expect(result.allowed).toBe(false);
    expect(result.violations[0].path).toBe('/src/App.tsx');
    expect(describeAiPatchScopeViolations(result.violations)).toContain('/src/App.tsx');
  });

  it('rejects platform, service, and integration writes', () => {
    const result = checkAiPatchScope(before, {
      ...before,
      '/src/integrations/supabase/client.ts': 'hacked',
      '/src/services/vfsCommitService.ts': 'hacked',
    });
    expect(result.allowed).toBe(false);
    expect(result.violations.map((v) => v.path).sort()).toEqual([
      '/src/integrations/supabase/client.ts',
      '/src/services/vfsCommitService.ts',
    ]);
  });

  it('rejects brand new files outside the authoring surfaces', () => {
    const result = checkAiPatchScope(before, { ...before, '/src/utils/sneaky.ts': 'x' });
    expect(result.allowed).toBe(false);
  });
});
