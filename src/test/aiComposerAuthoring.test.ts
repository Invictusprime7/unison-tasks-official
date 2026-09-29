import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

vi.mock('@/services/builderBrainClient', () => ({ runBuilderTurn: vi.fn() }));

import { repairBuilderCandidate, runComposerRepairLoop } from '@/services/builder/aiRepairLoop';
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

  it('carries the accepted Home language into a distinct loose-fit fashion page', async () => {
    const fashionPages = [
      { pageId: 'story', title: 'Our Story', route: '/our-story', filePath: '/src/pages/About.tsx', role: 'brand-story' },
      { pageId: 'home', title: 'Home', route: '/', filePath: '/src/pages/Home.tsx', role: 'home' },
    ];
    const homeSource = `
      import { ArrowRight } from 'lucide-react';
      export default function Home(){return <main>
        <nav data-ut-variant="navbar:editorial-minimal" className="ut-surface text-foreground" />
        <section data-ut-variant="hero:fashion-cinematic" className="ut-section text-left">
          <h1 className="ut-hero">STYLE THAT SPEAKS FOR ITSELF.</h1><ArrowRight />
        </section>
      </main>}`;
    const storySource = `
      import { ArrowRight } from 'lucide-react';
      export default function Story(){return <main>
        <nav data-ut-variant="navbar:editorial-minimal" className="ut-surface text-foreground" />
        <section data-ut-variant="hero:editorial-intro" className="ut-section text-center">
          <p className="ut-eyebrow">ABOUT OUR TEAM</p><h1 className="ut-title">OUR STORY</h1><ArrowRight />
        </section>
      </main>}`;
    const requests: Array<Record<string, unknown>> = [];
    const invoke = vi.fn(async (input: { messages: Array<{ content: string }> }) => {
      const req = JSON.parse(input.messages[0].content);
      requests.push(req);
      const path = req.page.filePath;
      const content = req.page.role === 'home' ? homeSource : storySource;
      return { data: { content: JSON.stringify({ summary: `Authored ${req.page.title}`, fileOps: [{ type: 'replace', path, content }] }) }, error: null };
    });
    const commitPage = vi.fn(async (next: Record<string, string>) => ({ files: next, revisionId: 'rev' }));

    const result = await authorSitePages({
      pages: fashionPages,
      homePageId: 'home',
      designContext: null,
      businessName: 'Dream Fashion',
      files: base,
      commitPage,
      invoke: invoke as never,
    });

    expect(result.outcomes.map((outcome) => outcome.status)).toEqual(['authored', 'authored']);
    expect(requests[1].brief).toContain('HOMEPAGE VISUAL LANGUAGE');
    expect(requests[1].brief).toContain('navbar: navbar:editorial-minimal');
    expect(requests[1].brief).toContain('Select a distinct role-appropriate hero');
    expect(requests[0].brief).toContain('never a whitelist');
    expect(result.files['/src/pages/Home.tsx']).toContain('hero:fashion-cinematic');
    expect(result.files['/src/pages/About.tsx']).toContain('hero:editorial-intro');
    expect(result.files['/src/pages/About.tsx']).toContain('navbar:editorial-minimal');
  }, 30000);

  it('pauses remaining pages after a credit error', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { context: { status: 402 } } });
    const r = await authorSitePages({ pages, designContext: null, businessName: 'B', files: base, commitPage: vi.fn(), invoke: invoke as never });
    expect(invoke).toHaveBeenCalledTimes(1);
    expect(r.outcomes.map((o) => o.status)).toEqual(['kept-baseline', 'skipped']);
  });

  it('uses the same mandatory knowledge policy for a Builder repair request', async () => {
    const invoke = vi.fn().mockResolvedValue(good('/src/pages/Home.tsx', 'Recovered'));
    await repairBuilderCandidate({
      rawFiles: { '/src/pages/Home.tsx': 'bad source' },
      failed: { errors: ['Import failed'], ok: false } as never,
      baseFiles: base,
      activeFilePath: '/src/pages/Home.tsx',
      prompt: 'Create an Aria-inspired editorial portfolio home',
      invoke: invoke as never,
    });
    const sent = JSON.parse(invoke.mock.calls[0][0].messages[0].content);
    expect(sent.brief).toContain('never a whitelist');
    expect(sent.brief).toContain('ARIA');
    expect(sent.brief).toContain('not a mandatory recipe');
  });
});

describe('AI composer contract mirror', () => {
  it('client and edge contracts are byte-identical', () => {
    const a = readFileSync(resolve(process.cwd(), 'src/contracts/aiComposerContract.ts'), 'utf8');
    const b = readFileSync(resolve(process.cwd(), 'supabase/functions/_shared/aiComposerContract.ts'), 'utf8');
    expect(a).toBe(b);
  });
});
