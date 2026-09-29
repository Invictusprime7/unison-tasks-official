import { describe, expect, it } from 'vitest';
import { createOpenCompositionTools } from '@/services/builder/openCompositionTools';

const files = {
  '/src/pages/Home.tsx': "import { LocalCard } from '@/project-components/site/LocalCard'; export default function Home(){ return <LocalCard/>; }",
  '/src/project-components/site/LocalCard.tsx': 'export function LocalCard(){ return <article>Original local component</article>; }',
  '/src/index.css': ':root { --primary: 10 20% 30%; }',
};

describe('open composition tools', () => {
  it('reads exact project source and accepts an original local component outside registry recipes', async () => {
    const tools = createOpenCompositionTools({ files, revisionId: 'revision-1' });
    const source = tools.readProjectFiles(['/src/pages/Home.tsx'], 'revision-1');
    expect(source.files['/src/project-components/site/LocalCard.tsx']).toContain('Original local component');

    const candidate = await tools.validateCandidate({
      files: { '/src/project-components/site/OriginalBanner.tsx': 'export function OriginalBanner(){ return <aside>New original component</aside>; }' },
      baseRevisionId: 'revision-1',
      intent: 'add-local-banner',
    });
    expect(candidate.ok).toBe(true);
  });

  it('rejects stale project reads and exposes missing registry context without blocking composition', () => {
    const tools = createOpenCompositionTools({ files, revisionId: 'revision-1' });
    expect(() => tools.readProjectFiles(['/src/pages/Home.tsx'], 'revision-old')).toThrow('context is stale');
    expect(tools.getRegistryComponent('not-a-recipe')).toBeNull();
    expect(tools.searchDesignKnowledge('editorial portfolio').entries.length).toBeGreaterThan(0);
  });
});
