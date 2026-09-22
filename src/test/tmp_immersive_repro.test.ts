import { describe, it } from 'vitest';
import { prepareSandpackFiles } from '@/utils/sandpackFilePrep';
import { getDependenciesForSandpack } from '@/utils/dependencyExtractor';
import { buildGeneratedUiFoundation } from '@/platform/core/generatedUiFoundation';

describe('immersive repro', () => {
  it('prepares an immersive page', () => {
    const foundation = buildGeneratedUiFoundation({ themePresetId: 'modern' });
    const files: Record<string, string> = {
      ...foundation.files,
      '/src/main.tsx': `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './index.css';\ncreateRoot(document.getElementById('root')!).render(<App />);\n`,
      '/src/App.tsx': `import Home from './pages/Home.tsx';\nexport default function App() { return <Home />; }\n`,
      '/src/pages/Home.tsx': `import { ImmersiveHero } from '@/unison/ui/experience/scene';\nexport default function Home() { return <ImmersiveHero title="Hi" />; }\n`,
    };
    const deps = getDependenciesForSandpack(files, {});
    console.log('DEPS three?', deps.dependencies['three'], deps.dependencies['@react-three/fiber'], deps.dependencies['@react-three/drei']);
    const prepared = prepareSandpackFiles(files);
    const keys = Object.keys(prepared).filter((k) => k.includes('experience'));
    console.log('EXPERIENCE FILES', keys);
    const home = Object.entries(prepared).find(([k]) => k.toLowerCase().includes('home'));
    console.log('HOME', home?.[0], home?.[1]?.slice(0, 400));
    const scene = Object.entries(prepared).find(([k]) => k.includes('experience/scene'));
    console.log('SCENE HEAD', scene?.[1]?.slice(0, 600));
    const depsAfter = getDependenciesForSandpack(prepared, {});
    console.log('DEPS AFTER', depsAfter.dependencies['three'], depsAfter.dependencies['@react-three/fiber']);
  });
});
