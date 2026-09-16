import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants/registry';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('registered Services compiler convergence', () => {
  it.each(getVariantsForSection('services'))('projects portable VFS metadata for $id', variant => {
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.vfs).toEqual({ mode: 'portable-recipe' });
    expect(implementation.vfs).toEqual(variant.vfs);
  });

  it.each(getVariantsForSection('services'))('emits the registered recipe and identity for $id', variant => {
    const template = getCompositionById('salon-premium')!;
    const files = compositionToReactFileSet({
      ...template,
      sections: template.sections.map(section => section.type === 'services'
        ? { ...section, variantId: variant.id }
        : section),
    }, '/src/pages/Home.tsx');

    expect(files['/src/components/recipes/Services.ts']).toBe(portableRecipes.families.services);
    expect(files['/src/components/Services.tsx']).toContain("from './recipes/Services'");
    expect(files['/src/components/Services.tsx']).toContain('REGISTERED_VARIANTS[resolvedId]');
    expect(files['/src/pages/Home.tsx']).toContain(variant.id);
    expect(files['/src/components/recipes/Services.ts']).toContain(variant.component.name);
  });
});