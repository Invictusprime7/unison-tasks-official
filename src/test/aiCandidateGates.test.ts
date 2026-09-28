import { describe, it, expect } from 'vitest';
import { prepareAICandidate } from '@/services/builder/aiCandidateGates';

const base = {
  '/src/pages/Home.tsx': "import Hero from '../components/Hero';\nexport default function Home(){return <main><Hero/></main>}",
  '/src/components/Hero.tsx': 'export default function Hero(){return <h1>Hi</h1>}',
};

describe('AI candidate gates', () => {
  it('accepts a valid Home edit and returns the full next file map', async () => {
    const r = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': "import Hero from '@/components/Hero';\nexport default function Home(){return <main><Hero/><p>New</p></main>}" },
      baseFiles: base,
    });
    expect(r.ok).toBe(true);
    expect(r.nextFiles['/src/pages/Home.tsx']).toContain('New');
    expect(r.nextFiles['/src/components/Hero.tsx']).toBe(base['/src/components/Hero.tsx']);
  }, 20000);

  it('blocks unresolved local imports', async () => {
    const r = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': "import X from './Missing';\nexport default function Home(){return <X/>}" },
      baseFiles: base,
    });
    expect(r.ok).toBe(false);
    expect(r.gates.failures.some((f) => f.gate === 'import-graph')).toBe(true);
  }, 20000);

  it('blocks files that do not parse', async () => {
    const r = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': 'export default function Home(){ return <main> }' },
      baseFiles: base,
      preflight: (c) => c,
    });
    expect(r.ok).toBe(false);
    expect(r.gates.failures.some((f) => f.gate === 'parse')).toBe(true);
  }, 20000);

  it('blocks no-op responses', async () => {
    const r = await prepareAICandidate({ aiFiles: { ...base }, baseFiles: base });
    expect(r.ok).toBe(false);
  });

  it('allows role-fit visual variation but blocks true affinity contradictions', async () => {
    const language = {
      sourcePageId: 'home', variants: { navbar: 'navbar:floating-pill' }, tokens: ['--ut-type-display'], typography: ['ut-display'],
      contentModel: { headings: ['Style'], intents: [], sectionFamilies: ['hero'] },
      architecture: { spacingClasses: ['ut-section'], surfaceClasses: [], contrastRoles: [], mediaPosture: [], primitives: [], alignments: ['text-center'], sectionOrder: ['hero'] },
      signature: 'stable',
    };
    const varied = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': 'export default function Home(){return <main className="text-left"><h1 className="ut-display">Story</h1><section data-ut-variant="hero:centered" /></main>}' },
      baseFiles: base,
      affinity: { language },
    });
    expect(varied.ok).toBe(true);

    const forbidden = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': 'export default function Home(){return <main><h1>Story</h1><section data-ut-variant="hero:retired" /></main>}' },
      baseFiles: base,
      affinity: { language, forbiddenImplementations: { hero: ['hero:retired'] } },
    });
    expect(forbidden.ok).toBe(false);
    expect(forbidden.gates.failures.some(failure => failure.gate === 'affinity')).toBe(true);
  }, 20000);
});
