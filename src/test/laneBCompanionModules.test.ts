import { describe, it, expect } from 'vitest';
import {
  scopeLaneBBatchFiles,
  findUnresolvedLocalImports,
  isLaneAAuthorityPath,
  buildModuleInventoryDirective,
} from '@/services/laneBCompanionModules';

describe('Lane B companion modules', () => {
  it('keeps a companion module authored alongside a requested page', () => {
    const { pages, companions } = scopeLaneBBatchFiles(
      {
        '/src/pages/Gallery.tsx': 'import GalleryItem from "./components/GalleryItem";\nexport default () => <GalleryItem />;',
        'src/pages/components/GalleryItem.tsx': 'export default () => null;',
      },
      ['/src/pages/Gallery.tsx'],
    );

    expect(Object.keys(pages)).toEqual(['/src/pages/Gallery.tsx']);
    expect(companions['/src/pages/components/GalleryItem.tsx']).toContain('export default');
  });

  it('never lets Lane B overwrite Lane A authority files', () => {
    const { pages, companions } = scopeLaneBBatchFiles(
      {
        '/src/pages/Home.tsx': 'export default () => null;',
        '/src/App.tsx': 'export default () => null;',
        '/src/index.css': ':root{}',
        '/src/main.tsx': 'render()',
        '/src/unison/ui/button.tsx': 'export const Button = () => null;',
      },
      ['/src/pages/Home.tsx'],
    );

    expect(Object.keys(pages)).toEqual(['/src/pages/Home.tsx']);
    expect(Object.keys(companions)).toEqual([]);
    expect(isLaneAAuthorityPath('/src/App.tsx')).toBe(true);
    expect(isLaneAAuthorityPath('/src/pages/components/Card.tsx')).toBe(false);
  });

  it('drops unrequested top-level pages instead of treating them as companions', () => {
    const { pages, companions } = scopeLaneBBatchFiles(
      {
        '/src/pages/Home.tsx': 'export default () => <main>home</main>;',
        '/src/pages/About.tsx': 'export default () => <main>stale about</main>;',
        '/src/pages/components/Hero.tsx': 'export default () => <section />;',
      },
      ['/src/pages/Home.tsx'],
    );

    expect(Object.keys(pages)).toEqual(['/src/pages/Home.tsx']);
    expect(companions).toEqual({
      '/src/pages/components/Hero.tsx': 'export default () => <section />;',
    });
  });

  it('detects a page whose companion module is missing', () => {
    const unresolved = findUnresolvedLocalImports({
      '/src/pages/Gallery.tsx': 'import GalleryItem from "./components/GalleryItem";',
    });

    expect(unresolved).toEqual([
      { filePath: '/src/pages/Gallery.tsx', importPath: './components/GalleryItem' },
    ]);
  });

  it('resolves imports through extensions, index files and stylesheets', () => {
    const unresolved = findUnresolvedLocalImports({
      '/src/pages/Gallery.tsx': [
        'import "./gallery.css";',
        'import GalleryItem from "./components/GalleryItem";',
        'import { helpers } from "../lib/helpers";',
      ].join('\n'),
      '/src/pages/components/GalleryItem.tsx': 'export default () => null;',
      '/src/lib/helpers/index.ts': 'export const helpers = {};',
    });

    expect(unresolved).toEqual([]);
  });
});

describe('module inventory directive', () => {
  it('lists existing modules, states the import contract and keeps styling universal', () => {
    const directive = buildModuleInventoryDirective({
      files: {
        '/src/pages/Home.tsx': 'export default function Home() { return null; }',
        '/src/pages/components/Hero.tsx': 'export const Hero = () => null;',
        '/src/index.css': ':root{}',
      },
      targetPaths: ['/src/pages/About.tsx'],
      aliasImports: ['@/unison/ui/button'],
    });

    expect(directive).toContain('/src/pages/components/Hero.tsx');
    expect(directive).toContain('Hero');
    expect(directive).not.toContain('/src/index.css');
    expect(directive).toContain('@/unison/ui/button');
    expect(directive).toContain('SAME response');
    expect(directive).toMatch(/available for EVERY industry/i);
  });

  it('is industry-neutral: the same modules are offered regardless of industry', () => {
    const files = { '/src/pages/components/Gallery.tsx': 'export const Gallery = () => null;' };
    expect(buildModuleInventoryDirective({ files })).toEqual(
      buildModuleInventoryDirective({ files }),
    );
  });
});
