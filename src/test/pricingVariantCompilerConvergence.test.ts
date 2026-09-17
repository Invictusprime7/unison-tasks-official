import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants/registry';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

describe('registered Pricing compiler convergence', () => {
  it.each(getVariantsForSection('pricing'))('projects portable VFS metadata for $id', variant => {
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.vfs).toEqual({ mode: 'portable-recipe' });
    expect(implementation.vfs).toEqual(variant.vfs);
  });

  it.each(getVariantsForSection('pricing'))('emits the registered recipe and identity for $id', variant => {
    const template = getCompositionById('salon-premium')!;
    const pricingTemplate = { ...template, sections: template.pageCompositions!.pricing!.sections };
    const files = compositionToReactFileSet({
      ...pricingTemplate,
      sections: pricingTemplate.sections.map(section => section.type === 'pricing'
        ? { ...section, variantId: variant.id }
        : section),
    }, '/src/pages/Pricing.tsx');

    expect(files['/src/components/recipes/Pricing.ts']).toBe(portableRecipes.families.pricing);
    expect(files['/src/components/Pricing.tsx']).toContain("from './recipes/Pricing'");
    expect(files['/src/components/Pricing.tsx']).toContain('REGISTERED_VARIANTS[resolvedId]');
    expect(files['/src/pages/Pricing.tsx']).toContain(variant.id);
    expect(files['/src/components/recipes/Pricing.ts']).toContain(variant.component.name);
  });
});