import { describe, expect, it } from 'vitest';

import { extractDependencies } from '@/utils/dependencyExtractor';
import {
  PINNED_RUNTIME_PACKAGE_VERSIONS,
  resolvePinnedRuntimeVersion,
} from '@/utils/sandpackDependencies';
import { emitCompositionEnhancements } from '@/sections/compositionEnhancements';

const EXPERIENCE_PINS = ['three', '@react-three/fiber', '@react-three/drei'] as const;

describe('pinned runtime package versions', () => {
  it('pins the three.js experience capability against the React 19 profile', () => {
    for (const pkg of EXPERIENCE_PINS) {
      const pinned = resolvePinnedRuntimeVersion(pkg);
      expect(pinned, pkg).toBeTruthy();
      expect(pinned, pkg).not.toBe('latest');
    }
    expect(PINNED_RUNTIME_PACKAGE_VERSIONS['@react-three/fiber']).toMatch(/^\^?9\./);
  });

  it('extractDependencies heals a stale package.json that recorded latest', () => {
    const files = {
      '/src/main.tsx': "import '@react-three/fiber'; import 'three'; import '@react-three/drei';",
      '/package.json': JSON.stringify({
        dependencies: {
          '@react-three/fiber': 'latest',
          three: 'latest',
          '@react-three/drei': 'latest',
          react: '^19.2.0',
          'react-dom': '^19.2.0',
        },
      }),
    };
    const { dependencies } = extractDependencies(files);
    for (const pkg of EXPERIENCE_PINS) {
      expect(dependencies[pkg]).toBe(PINNED_RUNTIME_PACKAGE_VERSIONS[pkg]);
    }
  });

  it('still honors a deliberate non-floating package.json pin for other packages', () => {
    const files = {
      '/src/main.tsx': "import 'recharts';",
      '/package.json': JSON.stringify({ dependencies: { recharts: '2.15.0' } }),
    };
    const { dependencies } = extractDependencies(files);
    expect(dependencies['recharts']).toBe('2.15.0');
  });
});

describe('composition enhancement guards', () => {
  const activation = {
    policy: 'maximum-compatible' as const,
    version: '1.0',
    canvasRoots: 1,
    decisions: [
      { recipeId: 'immersive-hero', sectionId: 's-hero', reason: 'selected' as const },
      { recipeId: 'scene-backdrop', sectionId: 's-feature', reason: 'selected' as const },
      { recipeId: 'depth-gallery', sectionId: 's-gallery', reason: 'selected' as const },
      { recipeId: 'editorial-reveal', sectionId: 's-about', reason: 'selected' as const },
    ],
  };

  it('emits typeof guards so a failed experience module degrades instead of crashing', () => {
    const { source } = emitCompositionEnhancements(activation);
    expect(source).toContain("typeof ImmersiveHero === 'function'");
    expect(source).toContain("typeof SceneBackground === 'function'");
    expect(source).toContain("typeof DepthGallery === 'function'");
    expect(source).toContain("typeof Reveal === 'function'");
    expect(source).toContain('ExperienceTabs.Content');
  });
});
