import { describe, expect, it } from 'vitest';
import { composerScopeViolations } from '@/contracts/aiComposerContract';
import { stampAuthoredPage } from '@/services/launch/siteAuthoringOrchestrator';

describe('AI Composer design-system write scope', () => {
  const page = '/src/pages/Home.tsx';
  it('allows the page file and project-local components', () => {
    expect(composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: page },
      { type: 'create', path: '/src/project-components/site/SiteNav.tsx' },
    ])).toEqual([]);
  });
  it('refuses rewriting canonical section components', () => {
    const errors = composerScopeViolations('site_page_author', page, [
      { type: 'replace', path: page }, { type: 'create', path: '/src/components/Navbar.tsx' },
    ]);
    expect(errors.join()).toMatch(/Navbar\.tsx: outside page scope/);
  });
  it('requires the target page to be authored', () => {
    expect(composerScopeViolations('site_page_author', page, [
      { type: 'create', path: '/src/project-components/X.tsx' },
    ]).join()).toMatch(/must be authored/);
  });
  it('stamps an idempotent provenance header', () => {
    const once = stampAuthoredPage({ [page]: 'export default 1;\n' }, { filePath: page, role: 'home' }, 'abc');
    const twice = stampAuthoredPage(once, { filePath: page, role: 'home' }, 'abc');
    expect(twice[page]).toBe('// @unison-ai-authored role=home design=abc\nexport default 1;\n');
  });
});
