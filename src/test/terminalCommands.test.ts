import { describe, expect, it, vi } from 'vitest';
import type { VirtualNode } from '@/hooks/useVirtualFileSystem';
import { processCommand, type CommandContext } from '@/services/terminalCommands';

function file(path: string, content: string): VirtualNode {
  const name = path.split('/').pop() || path;
  return {
    id: path,
    name,
    path,
    content,
    type: 'file',
    language: path.endsWith('.json') ? 'json' : 'typescript',
    parentId: null,
  };
}

function context(nodes: VirtualNode[]): CommandContext {
  return {
    nodes,
    currentDeps: {},
    onAddDep: vi.fn(),
    onRemoveDep: vi.fn(),
  };
}

describe('VFS terminal diagnose', () => {
  it('does not parse the canonical snapshot JSON as an executable module', () => {
    const snapshot = JSON.stringify({
      vfsFiles: {
        '/src/pages/Home.tsx': "import Hero from '../components/Hero'; export default function Page() { return <Hero />; }",
        '/src/pages/About.tsx': "import Missing from './About.sections'; export default function Page() { return <Missing />; }",
      },
    });
    const result = processCommand('diagnose', context([
      file('/src/App.tsx', "import { theme } from './theme'; export default function App() { return <main>{theme}</main>; }"),
      file('/src/theme.ts', "export const theme = 'stage-4b';"),
      file('/src/pages/Home.tsx', 'export default function Page() { return <main>Home</main>; }'),
      file('/src/pages/About.tsx', 'export default function Page() { return <main>About</main>; }'),
      file('/.unison/site-bundle-snapshot.json', snapshot),
    ]));

    const output = result.lines.map((line) => line.text).join('\n');
    expect(output).toContain('No issues found');
    expect(output).not.toContain('site-bundle-snapshot.json');
    expect(output).not.toContain('Duplicate default export');
  });

  it('still reports unresolved imports owned by executable source', () => {
    const result = processCommand('diagnose', context([
      file('/src/App.tsx', "import Missing from './Missing'; export default Missing;"),
    ]));

    expect(result.lines.map((line) => line.text).join('\n'))
      .toContain('Broken import: ./Missing in /src/App.tsx');
  });
});
