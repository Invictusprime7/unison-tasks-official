import { describe, expect, it } from 'vitest';
import { composerScopeViolations } from '@/contracts/aiComposerContract';
import { stampAuthoredPage } from '@/services/launch/siteAuthoringOrchestrator';

describe('AI Composer canonical compatibility scope', () => {
  const page = '/src/pages/Home.tsx';
  it('allows the page file and project-local components', () => {
    expect(composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: page },
      { type: 'create', path: '/src/project-components/site/SiteNav.tsx' },
    ])).toEqual([]);
  });
  it('confines App Builder page tasks to the shared generation scope', () => {
    const violations = composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: page },
      { type: 'create', path: '/src/components/Navbar.tsx' },
      { type: 'create', path: '/src/hooks/useNavigation.ts' },
      { type: 'create', path: '/src/components/generated/Stub.tsx' },
    ]);
    expect(violations).toHaveLength(2);
    expect(violations.join()).toContain('/src/components/Navbar.tsx');
    expect(violations.join()).toContain('/src/hooks/useNavigation.ts');
    expect(composerScopeViolations('site_page_repair', page, [
      { type: 'delete', path: '/src/components/ui/button.tsx' },
    ])).toHaveLength(1);
  });
  it('keeps Builder source edits freeform outside protected files', () => {
    expect(composerScopeViolations('builder_source_edit', page, [
      { type: 'create', path: '/src/components/Navbar.tsx' },
      { type: 'create', path: '/src/hooks/useNavigation.ts' },
    ])).toEqual([]);
  });
  it('keeps App.tsx compiler-owned so AI uses typed route operations', () => {
    expect(composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: '/src/App.tsx' },
    ]).join()).toContain('canonical runtime file');
  });
  it('keeps runtime metadata and bootstrap files protected', () => {
    expect(composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: '/src/main.tsx' },
      { type: 'replace', path: '/.unison/runtime-manifest.json' },
    ]).join()).toMatch(/canonical runtime file/);
  });
  it('stamps an idempotent provenance header', () => {
    const once = stampAuthoredPage({ [page]: 'export default 1;\n' }, { filePath: page, role: 'home' }, 'abc');
    const twice = stampAuthoredPage(once, { filePath: page, role: 'home' }, 'abc');
    expect(twice[page]).toBe('// @unison-ai-authored role=home design=abc\nexport default 1;\n');
  });
});
