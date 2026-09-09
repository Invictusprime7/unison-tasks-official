import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { ALL_COMPOSITIONS, getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants/registry';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('registered Gallery compiler convergence', () => {
  it.each(getVariantsForSection('gallery'))('projects emitter and primitive requirements for $id', variant => {
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.vfs).toEqual({ mode: 'portable-recipe' });
    expect(implementation.vfs).toEqual(variant.vfs);
    expect(implementation.radixPrimitives).toEqual(variant.radixPrimitives);
    expect(implementation.radixPrimitives).toContain('dialog');
    expect(implementation.radixPrimitives).not.toBe(variant.radixPrimitives);
  });

  it.each(ALL_COMPOSITIONS.filter(template => template.sections.some(section => section.type === 'gallery')))(
    'preserves the registered Gallery module and identity for $industry / $id', template => {
      for (const variant of getVariantsForSection('gallery')) {
        const sections = template.sections.map(section => section.type === 'gallery'
          ? { ...section, variantId: variant.id }
          : section);
        const files = compositionToReactFileSet({ ...template, sections }, '/src/pages/Home.tsx');
        expect(files['/src/components/recipes/Gallery.ts']).toBe(portableRecipes.families.gallery);
        expect(files['/src/pages/Home.tsx']).toContain(variant.id);
        expect(files['/src/components/Gallery.tsx']).toContain("from './recipes/Gallery'");
      }
    },
  );

  it.each(getVariantsForSection('gallery'))('emits the shared registered implementation for $id', (variant) => {
    const template = getCompositionById('salon-premium')!;
    const files = compositionToReactFileSet({
      ...template,
      sections: template.sections.filter(section => section.type === 'gallery').map(section => ({
        ...section,
        variantId: variant.id,
      })),
    }, '/src/pages/Home.tsx');

    expect(files['/src/components/Gallery.tsx']).toContain("from './recipes/Gallery'");
    expect(files['/src/components/recipes/Gallery.ts']).toContain('GalleryFrame');
    expect(files['/src/components/recipes/Gallery.ts']).toContain(variant.component.name);
    expect(files['/src/pages/Home.tsx']).toContain(variant.id);
  });
});