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
});
