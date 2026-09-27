import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

vi.mock('@/services/builderBrainClient', () => ({ runBuilderTurn: vi.fn() }));

import { runComposerRepairLoop } from '@/services/builder/aiRepairLoop';
import { authorSitePages, orderAuthoringPages } from '@/services/launch/siteAuthoringOrchestrator';

const base = {
  '/src/pages/Home.tsx': 'export default function Home(){return <main>Old</main>}',
  '/src/pages/About.tsx': 'export default function About(){return <main>About</main>}',
};
const good = (path: string, text: string) => ({ data: { content: JSON.stringify({ summary: text, fileOps: [{ type: 'replace', path, content: `export default function P(){return <main>${text}</main>}` }] }) }, error: null });
const bad = (path: string) => ({ data: { content: JSON.stringify({ summary: 'x', fileOps: [{ type: 'replace', path, content: "import X from './Nope';\nexport default function P(){return <X/>}" }] }) }, error: null });
const request = { task: 'site_page_author' as const, page: { role: 'home', title: 'Home', route: '/', filePath: '/src/pages/Home.tsx' }, brief: 'b', files: base, routes: [] };

describe('AI composer repair loop', () => {
  it('accepts on first pass', async () => {
    const invoke = vi.fn().mockResolvedValue(good('/src/pages/Home.tsx', 'New'));
    const r = await runComposerRepairLoop({ request, baseFiles: base, invoke: invoke as never });
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(1);
    expect(r.prepared!.nextFiles['/src/pages/Home.tsx']).toContain('New');
  }, 20000);

  it('repairs with diagnostics, then accepts', async () => {
    const invoke = vi.fn().mockResolvedValueOnce(bad('/src/pages/Home.tsx')).mockResolvedValueOnce(good('/src/pages/Home.tsx', 'Fixed'));
    const r = await runComposerRepairLoop({ request, baseFiles: base, invoke: invoke as never });
    expect(r.ok).toBe(true);
    expect(r.attempts).toBe(2);
    const second = JSON.parse(invoke.mock.calls[1][0].messages[0].content);
    expect(second.task).toBe('site_page_repair');
    expect(second.diagnostics[0]).toMatch(/does not resolve/);
  }, 20000);

  it('gives up after 3 attempts', async () => {
    const invoke = vi.fn().mockResolvedValue(bad('/src/pages/Home.tsx'));
    const r = await runComposerRepairLoop({ request, baseFiles: base, invoke: invoke as never });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('gates_exhausted');
    expect(invoke).toHaveBeenCalledTimes(3);
  }, 20000);

  it('stops on credit errors without retrying', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { context: { status: 402 } } });
    const r = await runComposerRepairLoop({ request, baseFiles: base, invoke: invoke as never });
    expect(r.reason).toBe('credits');
    expect(invoke).toHaveBeenCalledTimes(1);
  });
});

describe('site authoring orchestrator', () => {
  const pages = [
    { pageId: 'about', title: 'About', route: '/about', filePath: '/src/pages/About.tsx', role: 'about' },
    { pageId: 'home', title: 'Home', route: '/', filePath: '/src/pages/Home.tsx', role: 'home' },
  ];

  it('orders Home first deterministically', () => {
    expect(orderAuthoringPages(pages, 'home').map((p) => p.pageId)).toEqual(['home', 'about']);
  });

  it('commits each accepted page and keeps baseline for failures', async () => {
    const invoke = vi.fn(async (input: { messages: Array<{ content: string }> }) => {
      const req = JSON.parse(input.messages[0].content);
      return req.page.role === 'home' ? good('/src/pages/Home.tsx', 'AI Home') : bad('/src/pages/About.tsx');
    });
    const commitPage = vi.fn(async (next: Record<string, string>) => ({ files: next, revisionId: 'rev' }));
    const r = await authorSitePages({ pages, homePageId: 'home', designContext: null, businessName: 'B', files: base, commitPage, invoke: invoke as never });
    expect(commitPage).toHaveBeenCalledTimes(1);
    expect(r.files['/src/pages/Home.tsx']).toContain('AI Home');
    expect(r.files['/src/pages/About.tsx']).toBe(base['/src/pages/About.tsx']);
    expect(r.outcomes.map((o) => o.status)).toEqual(['authored', 'kept-baseline']);
  }, 30000);

  it('pauses remaining pages after a credit error', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { context: { status: 402 } } });
    const r = await authorSitePages({ pages, designContext: null, businessName: 'B', files: base, commitPage: vi.fn(), invoke: invoke as never });
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(r.outcomes.map((o) => o.status)).toEqual(['kept-baseline', 'skipped']);
  });
});

describe('AI composer contract mirror', () => {
  it('client and edge contracts are byte-identical', () => {
    const a = readFileSync(resolve(process.cwd(), 'src/contracts/aiComposerContract.ts'), 'utf8');
    const b = readFileSync(resolve(process.cwd(), 'supabase/functions/_shared/aiComposerContract.ts'), 'utf8');
    expect(a).toBe(b);
  });
});
