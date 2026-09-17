import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants/registry';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('registered Navbar compiler convergence', () => {
  it.each(getVariantsForSection('navbar'))('projects portable VFS metadata for $id', variant => {
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.vfs).toEqual({ mode: 'portable-recipe' });
    expect(implementation.vfs).toEqual(variant.vfs);
    expect(implementation.radixPrimitives).toEqual(['dialog']);
  });

  it.each(getVariantsForSection('navbar'))('emits the registered recipe and identity for $id', variant => {
    const template = getCompositionById('salon-premium')!;
    const files = compositionToReactFileSet({
      ...template,
      sections: template.sections.map(section => section.type === 'navbar'
        ? { ...section, variantId: variant.id }
        : section),
    }, '/src/pages/Home.tsx');

    expect(files['/src/components/recipes/Navbar.ts']).toBe(portableRecipes.families.navbar);
    expect(files['/src/components/Navbar.tsx']).toContain("from './recipes/Navbar'");
    expect(files['/src/components/Navbar.tsx']).toContain('REGISTERED_VARIANTS[resolvedId]');
    expect(files['/src/pages/Home.tsx']).toContain(variant.id);
    expect(files['/src/components/recipes/Navbar.ts']).toContain(variant.component.name);
  });
});