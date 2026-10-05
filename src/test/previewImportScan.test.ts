import { describe, expect, it } from 'vitest';
import * as Babel from '@babel/standalone';
import { prepareSandpackFiles, processCode } from '@/utils/sandpackFilePrep';

describe('preview import scanning', () => {
  it.each(['```', '</code></pre>'])('still removes a leaked closing marker: %s', (marker) => {
    const code = 'export default function App() { return <main>Preview</main>; }';
    const output = processCode(`${code}\n  ${marker}\n`, '/App.tsx');
    expect(output).toContain(code);
    expect(output).not.toContain(marker);
  });

  it('compiles a whitespace-heavy page after a side-effect stylesheet import', () => {
    // The old unbounded scans stall on long whitespace runs. Formatting alone
    // must not consume the preview's startup budget.
    const whitespace = ' '.repeat(500_000);
    const files = prepareSandpackFiles({
      '/src/App.tsx': `import './styles.css';
import {
  Hero
} from './components/Hero';
export default function App() { return <main>${whitespace}<Hero /></main>; }`,
      '/src/components/Hero.tsx': 'export function Hero() { return <h1>Preview regression</h1>; }',
      '/src/styles.css': 'main { color: red; }',
    });
    expect(files['/App.tsx']).toContain("import './styles.css';");
    expect(files['/App.tsx']).toContain('<Hero />');
    expect(files['/components/Hero.tsx']).toContain('Preview regression');
  }, 5_000);

  it('removes multiline self imports after a side-effect import without leaving invalid source', () => {
    const files = prepareSandpackFiles({
      '/src/App.tsx': `import './styles.css';
import App, {
  caption as selfCaption
} from './App';
import * as React from 'react';
export const caption = 'Preview';
export default function App() { return <main>{caption}</main>; }`,
      '/src/styles.css': 'main { color: red; }',
    });
    expect(files['/App.tsx']).not.toMatch(/^import App/m);
    expect(files['/App.tsx']).toContain("import './styles.css';");
    expect(files['/App.tsx']).toContain("import * as React from 'react';");
    expect(() => Babel.transform(files['/App.tsx'], {
      filename: 'App.tsx', presets: ['typescript', 'react'],
    })).not.toThrow();
  });
});
