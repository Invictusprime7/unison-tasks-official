import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { getVariantsForSection } from '@/sections/variants/registry';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import { getSectionComponent } from '@/sections/registry';
import portableRecipes from '@/sections/recipes/stylexRecipes.generated.json';

/**
 * Phase 3 closure for the last placeholder families.
 *
 * logo-cloud, blog-preview and before-after previously borrowed other
 * semantics (Stats / About / Gallery). They are now first-class families with
 * three registered implementations each, travelling the portable-recipe path.
 */
const FAMILIES = [
  { sectionType: 'logo-cloud', component: 'LogoCloud', recipe: 'logo-cloud' },
  { sectionType: 'blog-preview', component: 'BlogPreview', recipe: 'blog-preview' },
  { sectionType: 'before-after', component: 'BeforeAfter', recipe: 'before-after' },
] as const;

const BORROWED_COMPONENT_NAMES = [
  'StatsSection',
  'AboutSection',
  'GallerySection',
  'ServicesSection',
];

describe.each(FAMILIES)('first-class $sectionType family', ({ sectionType, component, recipe }) => {
  const variants = getVariantsForSection(sectionType);

  it('registers at least three implementations', () => {
    expect(variants.length).toBeGreaterThanOrEqual(3);
  });

  it('resolves a dedicated runtime component, not a borrowed semantic', () => {
    const runtime = getSectionComponent(sectionType);
    expect(runtime).toBeDefined();
    expect(BORROWED_COMPONENT_NAMES).not.toContain(runtime!.name);
  });

  it.each(variants)('projects portable VFS metadata for $id', variant => {
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.vfs).toEqual(variant.vfs);
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
