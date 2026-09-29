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
  it('allows freeform authored source across pages and shared components', () => {
    expect(composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: page },
      { type: 'create', path: '/src/components/Navbar.tsx' },
      { type: 'create', path: '/src/hooks/useNavigation.ts' },
    ])).toEqual([]);
  });
  it('keeps only canonical runtime files protected', () => {
    expect(composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: '/src/App.tsx' },
    ]).join()).toMatch(/canonical runtime file/);
  });
  it('stamps an idempotent provenance header', () => {
    const once = stampAuthoredPage({ [page]: 'export default 1;\n' }, { filePath: page, role: 'home' }, 'abc');
    const twice = stampAuthoredPage(once, { filePath: page, role: 'home' }, 'abc');
    expect(twice[page]).toBe('// @unison-ai-authored role=home design=abc\nexport default 1;\n');
  });
});
