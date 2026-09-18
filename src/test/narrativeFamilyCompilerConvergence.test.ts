import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants/registry';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

/**
 * Milestone 1 closure for the remaining narrative families.
 *
 * About, FAQ, Stats and Team used to emit hard-coded compiler modules while the
 * Variant Registry advertised three implementations each. They now travel the
 * same portable-recipe path as the proof families: registry -> certified recipe
 * -> canonical VFS, with the legacy module demoted to a fallback.
 */
const FAMILIES = [
  { sectionType: 'about', component: 'About', recipe: 'about' },
  { sectionType: 'faq', component: 'FAQ', recipe: 'faq' },
  { sectionType: 'stats', component: 'Stats', recipe: 'stats' },
  { sectionType: 'team', component: 'Team', recipe: 'team' },
] as const;

describe.each(FAMILIES)('registered $sectionType compiler convergence', ({ sectionType, component, recipe }) => {
  const variants = getVariantsForSection(sectionType);

  it('registers at least three implementations', () => {
    expect(variants.length).toBeGreaterThanOrEqual(3);
  });

  it.each(variants)('projects portable VFS metadata for $id', variant => {
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.vfs).toMatchObject({ mode: 'portable-recipe' });
    expect(implementation.vfs).toEqual(variant.vfs);
  });

  it.each(variants)('emits the registered recipe and identity for $id', variant => {
    const template = getCompositionById('salon-premium')!;
    const anchor = template.sections.find(section => section.type === 'cta') ?? template.sections[1];
    const files = compositionToReactFileSet({
      ...template,
      sections: template.sections.map(section => section === anchor
        ? { ...section, type: sectionType, variantId: variant.id }
        : section),
    }, '/src/pages/Home.tsx');

    expect(files[`/src/components/recipes/${component}.ts`]).toBe(
      (portableRecipes.families as Record<string, string>)[recipe],
    );
    expect(files[`/src/components/${component}.tsx`]).toContain(`from './recipes/${component}'`);
    expect(files[`/src/components/${component}.tsx`]).toContain('REGISTERED_VARIANTS[resolvedId]');
    expect(files['/src/pages/Home.tsx']).toContain(variant.id);
    expect(files[`/src/components/recipes/${component}.ts`]).toContain(variant.component.name);
  });
});
