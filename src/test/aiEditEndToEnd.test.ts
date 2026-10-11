/**
 * aiEditEndToEnd — repeatable coverage for AI editing across real app
 * behaviors: the same chain the Builder runs (raw AI files → candidate →
 * gates → coordinator rebase → applied file map), without a network.
 */
import { describe, expect, it } from 'vitest';
import { prepareAICandidate } from '@/services/builder/aiCandidateGates';
import { rebaseCandidate } from '@/services/builder/builderMutationCoordinator';

const APP = `import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
export default function App() {
  return (<HashRouter><Routes><Route path="/" element={<Home />} /><Route path="/about" element={<About />} /></Routes></HashRouter>);
}
`;

const HOME = `export default function Home() {
  return (<main><h1>Old headline</h1><p>Welcome.</p></main>);
}
`;

const ABOUT = `export default function About() {
  return (<main><h1>About us</h1><p>Our story.</p></main>);
}
`;

const FOOTER = `export default function Footer() {
  return (<footer><p>© Studio</p></footer>);
}
`;

const baseFiles: Record<string, string> = {
  '/src/App.tsx': APP,
  '/src/pages/Home.tsx': HOME,
  '/src/pages/About.tsx': ABOUT,
  '/src/components/Footer.tsx': FOOTER,
};

describe('AI edit end-to-end', () => {
  it('applies a scoped edit across 3+ files atomically and leaves everything else byte-identical', async () => {
    const prepared = await prepareAICandidate({
      aiFiles: {
        '/src/pages/Home.tsx': HOME.replace('Old headline', 'New headline'),
        '/src/pages/About.tsx': ABOUT.replace('Our story.', 'Our new story.'),
        '/src/components/Footer.tsx': FOOTER.replace('© Studio', '© Studio 2026'),
      },
      baseFiles,
      baseRevisionId: 'rev-1',
      origin: 'builder',
      intent: 'update copy on home, about and footer',
      resolveDependencies: false,
    });

    expect(prepared.ok).toBe(true);
    expect(prepared.errors).toEqual([]);
    expect(prepared.nextFiles['/src/pages/Home.tsx']).toContain('New headline');
    expect(prepared.nextFiles['/src/pages/About.tsx']).toContain('Our new story.');
    expect(prepared.nextFiles['/src/components/Footer.tsx']).toContain('© Studio 2026');
    // Untouched files survive unchanged.
    expect(prepared.nextFiles['/src/App.tsx']).toBe(APP);
  });

  it('creates a new page file and carries its route operation', async () => {
    const contact = `export default function Contact() {
  return (<main><h1>Contact</h1><p>Email us.</p></main>);
}
`;
    const prepared = await prepareAICandidate({
      aiFiles: { '/src/pages/Contact.tsx': contact },
      baseFiles,
      baseRevisionId: 'rev-1',
      origin: 'builder',
      intent: 'add a contact page',
      routeOps: [{ type: 'add_page', path: '/contact', title: 'Contact' } as never],
      resolveDependencies: false,
    });

    expect(prepared.ok).toBe(true);
    expect(prepared.nextFiles['/src/pages/Contact.tsx']).toBe(contact);
    expect(prepared.build.changeSet.routeOps).toHaveLength(1);
    expect(prepared.build.changeSet.routeOps[0]).toMatchObject({ type: 'add_page', path: '/contact' });
  });

  it('blocks an edit whose import does not resolve, so a broken page is never saved', async () => {
    const broken = `import Hero from '../components/Missing.tsx';
export default function Home() {
  return (<main><Hero /></main>);
}
`;
    const prepared = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': broken },
      baseFiles,
      baseRevisionId: 'rev-1',
      origin: 'builder',
      resolveDependencies: false,
    });

    expect(prepared.ok).toBe(false);
    expect(prepared.gates.failures.some((f) => f.gate === 'import-graph')).toBe(true);
  });

  it('blocks an edit that would empty an existing page file', async () => {
    const prepared = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': '   ' },
      baseFiles,
      baseRevisionId: 'rev-1',
      origin: 'builder',
      resolveDependencies: false,
    });

    expect(prepared.ok).toBe(false);
    expect(prepared.gates.failures.some((f) => f.gate === 'empty')).toBe(true);
  });

  it('refuses a stale candidate when a newer save touched the same file, and rebases when it did not', async () => {
    const prepared = await prepareAICandidate({
      aiFiles: { '/src/pages/Home.tsx': HOME.replace('Old headline', 'New headline') },
      baseFiles,
      baseRevisionId: 'rev-1',
      origin: 'builder',
      resolveDependencies: false,
    });
    expect(prepared.ok).toBe(true);
    const candidate = prepared.build.changeSet;
    expect(candidate.baseFingerprints?.['/src/pages/Home.tsx']).toBeDefined();

    // A newer commit changed the same file the AI edited → hard refuse.
    const conflicting = { ...baseFiles, '/src/pages/Home.tsx': HOME.replace('Welcome.', 'Someone else edited this.') };
    const refused = rebaseCandidate(candidate, conflicting, 'rev-2');
    expect(refused.ok).toBe(false);
    expect(refused.conflicts).toContain('/src/pages/Home.tsx');

    // A newer commit changed an unrelated file → safe rebase onto it.
    const unrelated = { ...baseFiles, '/src/components/Footer.tsx': FOOTER.replace('© Studio', '© Studio 2026') };
    const rebased = rebaseCandidate(candidate, unrelated, 'rev-3');
    expect(rebased.ok).toBe(true);
    expect(rebased.rebased).toBe(true);
    expect(rebased.candidate?.baseRevisionId).toBe('rev-3');
  });
});
