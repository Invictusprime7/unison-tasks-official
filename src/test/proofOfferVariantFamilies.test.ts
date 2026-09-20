import { describe, it, expect } from 'vitest';
import { compositionToReactFileSet } from '@/sections/compositionToFileSet';
import { getVariantById, getVariantsForSection, getDefaultVariant, getVariantIdForLayout } from '@/sections/variants';
import type { TemplateComposition } from '@/sections/types';

function build(sectionVariants: string[], sections: unknown[]) {
  const template = {
    id: 'fixture', name: 'Fixture', industry: 'consulting', sections,
  } as unknown as TemplateComposition;
  return compositionToReactFileSet(template, '/src/pages/Home.tsx', {
    designIntervention: { sectionVariants } as never,
  });
}

describe('Phase 3 — testimonials and pricing are first-class variant families', () => {
  it('registers the executable testimonials variants', () => {
    const variants = getVariantsForSection('testimonials');
    expect(variants.map((v) => v.id).sort()).toEqual([
      'testimonials:columns', 'testimonials:grid', 'testimonials:marquee', 'testimonials:rail', 'testimonials:spotlight',
    ]);
    variants.forEach((variant) => {
      expect(variant.component).toBeTruthy();
      expect(typeof variant.renderJSX).toBe('function');
      if (variant.id !== 'testimonials:columns') expect(variant.renderJSX({ heading: 'Proof', listItems: ['Great work'] })).toContain(variant.id);
    });
    expect(getDefaultVariant('testimonials')?.id).toBe('testimonials:grid');
  });

  it('registers the executable pricing variants', () => {
    const variants = getVariantsForSection('pricing');
    expect(variants.map((v) => v.id).sort()).toEqual([
      'pricing:accordion', 'pricing:billing-toggle', 'pricing:comparison', 'pricing:feature-table', 'pricing:spotlight', 'pricing:tiers',
    ]);
    variants.forEach((variant) => {
      expect(variant.component).toBeTruthy();
      const files = build([], [{ id: 'plan', type: 'pricing', variantId: variant.id, props: { headline: 'Plans', tiers: [] } }]);
      expect(files['/src/pages/Home.tsx']).toContain(variant.id);
      expect(files['/src/components/recipes/Pricing.ts']).toContain(variant.id);
    });
    expect(getDefaultVariant('pricing')?.id).toBe('pricing:tiers');
  });

  it('maps legacy layout tokens back onto the new families', () => {
    expect(getVariantIdForLayout('testimonials', 'carousel')).toBe('testimonials:rail');
    expect(getVariantIdForLayout('testimonials', 'single')).toBe('testimonials:spotlight');
    expect(getVariantIdForLayout('pricing', 'accordion')).toBe('pricing:accordion');
  });

  it('testimonial-rail recipe resolves to an executable variant, not a layout word', () => {
    const page = build(['testimonial-rail'], [{ id: 't-1', type: 'testimonials', props: { items: [] } }])['/src/pages/Home.tsx'];
    expect(page).toContain('"variantId": "testimonials:rail"');
    expect(getVariantById('testimonials:rail')).toBeTruthy();
  });

  it('pricing-accordion binds pricing sections to pricing:accordion and leaves faq on the layout contract', () => {
    const pricing = build(['pricing-accordion'], [{ id: 'p-1', type: 'pricing', props: { tiers: [] } }])['/src/pages/Home.tsx'];
    expect(pricing).toContain('"variantId": "pricing:accordion"');
    const faq = build(['pricing-accordion'], [{ id: 'q-1', type: 'faq', props: { items: [] } }])['/src/pages/Home.tsx'];
    expect(faq).not.toContain('"variantId": "pricing:accordion"');
    expect(faq).toContain('"layout": "accordion"');
  });

  it('generated VFS modules can execute the new layouts', () => {
    const files = build(['pricing-accordion'], [{ id: 'p-1', type: 'pricing', props: { tiers: [] } }]);
    const pricingModule = files['/src/components/Pricing.tsx'];
    expect(pricingModule).toContain('pricing:accordion');
    expect(pricingModule).toContain('pricing:comparison');

    const proof = build(['testimonial-rail'], [{ id: 't-1', type: 'testimonials', props: { items: [] } }]);
    expect(proof['/src/components/Testimonials.tsx']).toContain("from './recipes/Testimonials'");
    expect(proof['/src/components/Testimonials.tsx']).toContain('REGISTERED_VARIANTS[resolvedId]');
    expect(proof['/src/components/recipes/Testimonials.ts']).toBeTruthy();
  });
});
