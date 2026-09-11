import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { ALL_COMPOSITIONS } from '@/sections/templates';
import stylexRecipes from '@/sections/recipes/stylexRecipes.generated.json';

/**
 * Phase 1 closure guard.
 *
 * A chosen variant that only exists as a recorded id is a lie: the preview
 * renders the deterministic fallback and every page looks the same. These
 * checks prove that for every composition the emitter ships the registered
 * implementation of each selected variant into the VFS, alongside its
 * resolver and its fallback, with nothing dangling.
 */
describe('registered variants are materialized into the VFS', () => {
  const FAMILY_FILE = /^\/src\/components\/([A-Za-z]+)\.tsx$/;

  it('emits recipe, base and resolver together for every recipe-backed family', () => {
    for (const composition of ALL_COMPOSITIONS) {
      const files = compositionToReactFileSet(composition, '/src/pages/Home.tsx');
      for (const path of Object.keys(files)) {
        const component = path.match(FAMILY_FILE)?.[1];
        if (!component) continue;
        const resolver = files[path];
        if (!resolver.includes('REGISTERED_VARIANTS')) continue;
        const recipe = files[`/src/components/recipes/${component}.ts`];
        const base = files[`/src/components/${component}Base.tsx`];
        expect(recipe, `${composition.id}: missing recipe module for ${component}`).toBeTruthy();
        expect(base, `${composition.id}: missing fallback module for ${component}`).toBeTruthy();
        expect(recipe).toContain('REGISTERED_VARIANTS');
        // Portable modules may only reach for React, the generated icon module
        // and the generated Radix facade — never a raw npm dependency.
        expect(recipe).not.toContain("from 'lucide-react'");
        expect(recipe).not.toContain("from '@radix-ui/");
      }
    }
  });

  it('resolves every selected variant id to a real implementation in the emitted recipe', () => {
    for (const composition of ALL_COMPOSITIONS) {
      const files = compositionToReactFileSet(composition, '/src/pages/Home.tsx');
      const page = files['/src/pages/Home.tsx'];
      const sections = JSON.parse(page.match(/const SECTIONS = ([\s\S]*?);\nconst HYDRATABLE/)![1]) as
        Array<{ type: string; variantId?: string }>;
      for (const section of sections) {
        if (!section.variantId) continue;
        const family = (stylexRecipes.families as Record<string, string>)[section.type];
        if (!family) continue;
        expect(family, `${composition.id}: ${section.variantId} is not in the emitted recipe`)
          .toContain(JSON.stringify(section.variantId));
      }
    }
  });

  it('keeps every family import in the emitted file set resolvable', () => {
    for (const composition of ALL_COMPOSITIONS) {
      const files = compositionToReactFileSet(composition, '/src/pages/Home.tsx');
      for (const [path, source] of Object.entries(files)) {
        if (!FAMILY_FILE.test(path)) continue;
        for (const match of source.matchAll(/from '\.\/([A-Za-z/]+)'/g)) {
          const target = `/src/components/${match[1]}`;
          const exists = [`${target}.ts`, `${target}.tsx`].some((candidate) => files[candidate]);
          expect(exists, `${composition.id}: ${path} imports missing ${match[1]}`).toBe(true);
        }
      }
    }
  });
});
