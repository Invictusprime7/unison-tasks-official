import { describe, expect, it } from 'vitest';
import { prepareSandpackFiles, processCode } from '@/utils/sandpackFilePrep';
import { buildPreviewArtifacts } from '@/utils/previewArtifacts';
import { getDependenciesForSandpack } from '@/utils/dependencyExtractor';

describe('Sandpack local module resolution', () => {
  it('resolves multiline aliased component imports after flattening /src', () => {
    const files = prepareSandpackFiles({
      '/src/App.tsx': `import {
  Hero
} from '@/components/Hero';
export default function App() { return <Hero />; }`,
      '/src/components/Hero.tsx': 'export function Hero() { return <h1>Authored hero</h1>; }',
      '/src/index.css': ':root { --primary: 0 0% 10%; }',
    });
    expect(files['/App.tsx']).toContain("from './components/Hero'");
    expect(files['/App.tsx']).not.toContain('@/');
    expect(files['/components/Hero.tsx']).toContain('Authored hero');
  });

  it('resolves alias re-exports and dynamic imports without altering ordinary strings', () => {
    const code = `export { Hero } from '@/components/Hero';
export * from '@/components/content';
export const load = () => import('@/components/Detail');
export const example = "import('@/components/example')";`;
    const prepared = processCode(code, '/pages/index.ts');
    expect(prepared).toContain("from '../components/Hero'");
    expect(prepared).toContain("from '../components/content'");
    expect(prepared).toContain("import('../components/Detail')");
    expect(prepared).toContain('"import(\'@/components/example\')"');
  });

  it('projects a sealed Wizard snapshot using multiline absolute imports and re-exports', () => {
    const authoredFiles = {
      '/src/App.tsx': `import {
  Hero
} from '/src/components';
export default function App() { return <Hero />; }`,
      '/src/components/index.ts': "export { Hero } from '@/components/Hero';",
      '/src/components/Hero.tsx': 'export function Hero() { return <h1>Selected design</h1>; }',
      '/src/index.css': ':root { --primary: 0 0% 10%; }',
    };
    const snapshot = {
      snapshotId: 'module-resolution', pageRegistry: { pages: {} }, vfsFiles: authoredFiles,
      meta: {
        themePresetId: 'modern',
        themeInjection: { version: '1.0', stage: '4b', presetId: 'modern', cssPath: '/src/index.css' },
        seal: { version: '1.0', sealedAt: '2026-10-04T00:00:00Z', sealedBy: 'wizard-launch', compileArtifactId: 'module-resolution', fileCount: 4 },
      },
    };
    const result = buildPreviewArtifacts({ sourceFiles: { '/.unison/site-bundle-snapshot.json': JSON.stringify(snapshot) } });
    expect(result.sandpackFiles['/App.tsx']).toContain("from './components'");
    expect(result.sandpackFiles['/components/index.ts']).toContain("from './Hero'");
    expect(result.sandpackFiles['/components/Hero.tsx']).toContain('Selected design');
    expect(authoredFiles['/src/App.tsx']).toContain("from '/src/components'");
  });

  it('installs packages reached through a namespace re-export', () => {
    const result = getDependenciesForSandpack({
      '/index.tsx': "import { Content } from './components'; export default Content;",
      '/components/index.ts': "export * as Content from './content';",
      '/components/content.tsx': "import { clsx } from 'clsx'; export const title = clsx('Title');",
    }, {}, { entryPoints: ['/index.tsx'] });
    expect(result.dependencies.clsx).toBeTruthy();
  });

  it('uses the existing runtime facades for multiline UI and utility imports', () => {
    const files = prepareSandpackFiles({
      '/src/App.tsx': `import {
  Button
} from '@/components/ui/button';
import {
  cn
} from '@/lib/utils';
export default function App() { return <Button className={cn('action')}>Continue</Button>; }`,
      '/src/index.css': ':root { --primary: 0 0% 10%; }',
    });
    expect(files['/App.tsx']).toContain("from './ui-shim'");
    expect(files['/App.tsx']).toContain("from './lib-utils-shim'");
    expect(files['/App.tsx']).not.toContain('@/');
  });

  it('resolves a declared sibling component before trusting an external export-star', () => {
    const files = prepareSandpackFiles({
      '/src/App.tsx': `import { Reveal as Panel, RevealGroup, AnimatePresence as Presence } from './components/animation';
export default function App() { return <RevealGroup><Presence><Panel>Ready</Panel></Presence></RevealGroup>; }`,
      '/src/components/animation.tsx': "export * from 'framer-motion'; export function RevealGroup({ children }) { return <div>{children}</div>; }",
      '/src/components/motion.tsx': 'export function Reveal({ children }) { return <section>{children}</section>; }',
    });
    expect(files['/App.tsx']).toContain("import { Reveal as Panel } from './components/motion';");
    expect(files['/App.tsx']).toContain("import { RevealGroup, AnimatePresence as Presence } from './components/animation';");
    expect(files['/App.tsx']).toContain('<Panel>Ready</Panel>');
  });
});
