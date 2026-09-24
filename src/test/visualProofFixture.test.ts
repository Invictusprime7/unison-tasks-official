import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { expect, it } from 'vitest';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';
import { LAUNCHER_BASE_THEME } from '@/sections/themes';
import recipes from '@/sections/recipes/stylexRecipes.generated.json';

// Render the actual exported recipes, including their generated Radix facades.
// Opt-in artifacts stay outside the application and do not bypass generation eligibility.
it.runIf(process.env.VISUAL_PROOF_ARTIFACTS === '1')('exports the five visual proof recipes for browser verification', () => {
  const variants = ['gallery:cinematic-grid', 'gallery:masonry', 'gallery:lightbox-grid', 'before-after:slider', 'before-after:grid'];
  const image = (label: string, color: string, height = 600) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${height}" viewBox="0 0 800 ${height}"><rect width="800" height="${height}" fill="${color}"/><circle cx="400" cy="${height / 2}" r="150" fill="#ffffff" fill-opacity=".15"/><text x="400" y="${height / 2}" text-anchor="middle" fill="white" font-family="sans-serif" font-size="48">${label}</text></svg>`);
  const items = [
    { src: image('Kitchen', '#416065'), alt: 'Kitchen result', caption: 'Kitchen renovation', category: 'Interiors' },
    { src: image('Studio', '#735855', 1000), alt: 'Studio result', caption: 'Studio renovation', category: 'Interiors' },
    { src: image('Garden', '#475e45'), alt: 'Garden result', caption: 'Garden renovation', category: 'Outdoors' },
  ];
  const pairs = [
    { before: image('Kitchen before', '#735855'), after: items[0].src, label: 'Kitchen' },
    { before: image('Garden before', '#735855'), after: items[2].src, label: 'Garden' },
  ];
  for (const id of variants) {
    const family = id.startsWith('gallery:') ? 'gallery' : 'before-after';
    expect(recipes.families[family]).toContain(id);
    const files = {
      ...buildGeneratedUiFoundation({ themePresetId: 'editorial' }).files,
      '/src/recipe.ts': recipes.families[family],
      '/src/index.css': '@tailwind base; @tailwind components; @tailwind utilities; :root { --ut-overlay-block: calc(100dvh - 10rem); } body { margin: 0; }',
      '/src/main.tsx': `import React from 'react'; import { createRoot } from 'react-dom/client'; import { REGISTERED_VARIANTS } from './recipe'; import './index.css';
        const Component = REGISTERED_VARIANTS[${JSON.stringify(id)}];
        const theme = ${JSON.stringify(LAUNCHER_BASE_THEME)};
        const section = ${JSON.stringify({ id: 'proof', type: family, props: { headline: 'Recent transformations', subheadline: 'Explore our work', filterable: true, items: family === 'gallery' ? items : pairs } })};
        createRoot(document.getElementById('root')!).render(<main><h1 style={{padding:24}}>Visual proof verification</h1><Component section={section} theme={theme} /></main>);`,
      '/index.html': '<!doctype html><html lang="en"><head><title>Visual proof verification</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="./src/main.tsx"></script></body></html>',
    };
    for (const [path, content] of Object.entries(files)) {
      const target = resolve('.artifacts/composition/browser', id.replace(':', '-'), path.slice(1));
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }
});
