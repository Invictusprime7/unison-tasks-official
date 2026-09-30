import { describe, expect, it } from 'vitest';
import { aiComposerRequestSchema } from '@/contracts/aiComposerContract';
import {
  assembleCanonicalAuthoringRequest,
  resolveCanonicalAuthoringPage,
  shouldUseCanonicalComposer,
} from '@/services/builder/canonicalAuthoringRequest';

const files = {
  '/src/pages/Home.tsx': "import Hero from '../project-components/Hero'; export default function Home(){return <Hero/>}",
  '/src/project-components/Hero.tsx': 'export default function Hero(){return <h1>Exact source</h1>}',
  '/src/index.css': '@tailwind base;',
  '/package.json': '{"dependencies":{"react":"latest"}}',
  '/.unison/wizard-registry-context.json': '{"version":"1","sections":[{"type":"hero"}]}',
  '/.unison/site-bundle-snapshot.json': JSON.stringify({
    pageRegistry: { pages: { home: { title: 'Home', path: '/' } } },
  }),
};

describe('canonical AI authorship request assembly', () => {
  it('routes ordinary React source edits to Composer and leaves specialized lanes alone', () => {
    const base = {
      isReactProject: true, isLaunchPlanningRequest: false,
      isCatalogMutationRequest: false, hasAttachments: false, hasVfs: true,
    };
    expect(shouldUseCanonicalComposer(base)).toBe(true);
    expect(shouldUseCanonicalComposer({ ...base, isCatalogMutationRequest: true })).toBe(false);
    expect(shouldUseCanonicalComposer({ ...base, isLaunchPlanningRequest: true })).toBe(false);
    expect(shouldUseCanonicalComposer({ ...base, hasAttachments: true })).toBe(false);
    expect(shouldUseCanonicalComposer({ ...base, isReactProject: false })).toBe(false);
  });

  it('resolves Builder targets from accepted page topology', () => {
    const withTopology = {
      ...files,
      '/.unison/site-bundle-snapshot.json': JSON.stringify({
        pageRegistry: { pages: {
          home: { title: 'Home', path: '/', filePath: '/src/pages/Home.tsx', pageType: 'home' },
          pricing: { title: 'Pricing', path: '/pricing', filePath: '/src/pages/Pricing.tsx', pageType: 'pricing' },
        } },
      }),
      '/src/pages/Pricing.tsx': 'export default function Pricing(){return <main/>}',
    };

    expect(resolveCanonicalAuthoringPage(withTopology, '/src/pages/Pricing.tsx')).toEqual({
      role: 'pricing', title: 'Pricing', route: '/pricing', filePath: '/src/pages/Pricing.tsx',
    });
  });

  it('uses complete transitive source and records hashed evidence', async () => {
    const assembled = await assembleCanonicalAuthoringRequest({
      task: 'builder_source_edit',
      page: { role: 'home', title: 'Home', route: '/', filePath: '/src/pages/Home.tsx' },
      brief: 'Keep the current visual language.',
      knowledgeQuery: 'editorial home',
      instruction: 'Make the hero more editorial.',
      baseFiles: files,
      baseRevisionId: 'revision-42',
      routes: [],
    });

    expect(aiComposerRequestSchema.safeParse(assembled.request).success).toBe(true);
    expect(assembled.request.files['/src/pages/Home.tsx']).toBe(files['/src/pages/Home.tsx']);
    expect(assembled.request.files['/src/project-components/Hero.tsx']).toBe(files['/src/project-components/Hero.tsx']);
    expect(assembled.request.routes).toEqual([{ title: 'Home', route: '/' }]);
    expect(assembled.evidence).toMatchObject({
      baseRevisionId: 'revision-42',
      sourceContextComplete: true,
      registryContextHash: expect.stringMatching(/^(sha256|fnv1a):/),
      knowledgeContextHash: expect.stringMatching(/^sha256:/),
    });
    expect(assembled.evidence.availableOperations).toContain('add_page');
  });

  it('changes the source evidence hash when exact source bytes change', async () => {
    const input = {
      task: 'site_page_author' as const,
      page: { role: 'home', title: 'Home', route: '/', filePath: '/src/pages/Home.tsx' },
      brief: 'Author home.', knowledgeQuery: 'home', baseFiles: files, routes: [],
    };
    const first = await assembleCanonicalAuthoringRequest(input);
    const second = await assembleCanonicalAuthoringRequest({
      ...input,
      baseFiles: { ...files, '/src/project-components/Hero.tsx': 'export default function Hero(){return <h1>Changed</h1>}' },
    });

    expect(first.evidence.sourceContextHash).not.toBe(second.evidence.sourceContextHash);
  });
});
