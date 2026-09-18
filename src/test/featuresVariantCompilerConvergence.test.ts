import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants/registry';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('registered Features compiler convergence', () => {
  it.each(getVariantsForSection('features'))('projects portable VFS metadata for $id', variant => {
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.vfs).toMatchObject({ mode: 'portable-recipe' });
    expect(implementation.vfs).toEqual(variant.vfs);
  });

  it.each(getVariantsForSection('features'))('emits the registered recipe and identity for $id', variant => {
    const template = getCompositionById('saas-dark')!;
    const files = compositionToReactFileSet({
      ...template,
      sections: template.sections.map(section => section.type === 'features'
        ? { ...section, variantId: variant.id }
        : section),
    }, '/src/pages/Home.tsx');

    expect(files['/src/components/recipes/Features.ts']).toBe(portableRecipes.families.features);
    expect(files['/src/components/Features.tsx']).toContain("from './recipes/Features'");
    expect(files['/src/components/Features.tsx']).toContain('REGISTERED_VARIANTS[resolvedId]');
    expect(files['/src/pages/Home.tsx']).toContain(variant.id);
    expect(files['/src/components/recipes/Features.ts']).toContain(variant.component.name);
  });
});