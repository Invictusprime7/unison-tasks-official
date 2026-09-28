import { describe, expect, it } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getCompositionById } from '@/sections/templates';
import { createIndustryStarterSection } from '@/sections/templates/industryDefaultRegistry';
import { getArtifact } from '@/platform/core/artifactRegistry';
import { getGenerationVariantsForSection } from '@/sections/variants';

describe('Imported Unison section integration', () => {
  it.each([
    ['auth-form', 'auth', 'AuthForm'],
    ['data-table', 'dashboard', 'DataTable'],
  ] as const)('emits %s through the canonical compiler', (type, role, component) => {
    const template = getCompositionById('salon-premium')!;
    const section = createIndustryStarterSection('saas', type, { businessName: 'Test', idPrefix: 'imported' })!;
    expect(section?.type).toBe(type);
    expect(getArtifact(type)?.sectionType).toBe(type);
    const variants = getGenerationVariantsForSection(type, undefined, role);
    expect(variants.length).toBeGreaterThan(0);
    for (const variant of variants) {
      const files = compositionToReactFileSet({
        ...template,
        sections: [{ ...section, variantId: variant.id }],
      }, '/src/pages/Imported.tsx');
      expect(files[`/src/components/${component}.tsx`]).toContain('REGISTERED_VARIANTS');
      expect(files[`/src/components/recipes/${component}.ts`]).toContain(variant.id);
      expect(files['/src/pages/Imported.tsx']).toContain(variant.id);
    }
  });
});
