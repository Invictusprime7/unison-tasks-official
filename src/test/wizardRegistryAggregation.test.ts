import { describe, it, expect } from 'vitest';
import {
  buildWizardAggregatedRegistryContext,
  WIZARD_REGISTRY_CONTEXT_VERSION,
} from '@/services/launch/wizardRegistryAggregation';

describe('wizardRegistryAggregation', () => {
  it('builds an aggregated context with complete sections, artifacts, and catalog surfaces', () => {
    const context = buildWizardAggregatedRegistryContext({
      industry: 'salon',
      templateId: 'salon-premium',
      themePresetId: 'editorial',
    });

    expect(context.version).toBe(WIZARD_REGISTRY_CONTEXT_VERSION);
    expect(context.industry).toBe('salon');
    expect(context.templateId).toBe('salon-premium');
    expect(context.themePresetId).toBe('editorial');
    expect(context.artDirectionPackId).toBeDefined();
    expect(context.designRegistrySignature).toMatch(/^dr_/);

    // All 17 sections are indexed
    expect(context.sections.length).toBe(17);
    const heroSection = context.sections.find((s) => s.type === 'hero');
    expect(heroSection).toBeDefined();
    expect(heroSection?.isFirstClass).toBe(true);
    expect(heroSection?.artifactId).toBe('hero');
    expect(heroSection?.allowedVariantIds.length).toBeGreaterThan(0);

    // Placeholder sections are correctly flagged
    const logoCloud = context.sections.find((s) => s.type === 'logo-cloud');
    expect(logoCloud?.isFirstClass).toBe(false);

    // Artifacts cover catalog, business-profile, authored, and behavioral
    expect(context.artifacts.length).toBeGreaterThanOrEqual(17);
    const servicesArtifact = context.artifacts.find((a) => a.artifactId === 'services');
    expect(servicesArtifact?.dataSourceKind).toBe('catalog');
    expect(servicesArtifact?.sourceTable).toBe('services');

    const heroArtifact = context.artifacts.find((a) => a.artifactId === 'hero');
    expect(heroArtifact?.dataSourceKind).toBe('business-profile');

    const availabilityArtifact = context.artifacts.find((a) => a.artifactId === 'availability');
    expect(availabilityArtifact?.dataSourceKind).toBe('catalog');
    expect(availabilityArtifact?.sourceTable).toBe('availability_slots');

    // Catalog surfaces
    expect(context.catalogSurfaces.length).toBeGreaterThanOrEqual(8);
    expect(context.catalogSurfaces.map((s) => s.surfaceId)).toContain('services');
    expect(context.catalogSurfaces.map((s) => s.surfaceId)).toContain('products');
    expect(context.catalogSurfaces.map((s) => s.surfaceId)).toContain('availability');

    // Motion primitives
    expect(context.motionPrimitives).toContain('MarqueeBand');
    expect(context.motionPrimitives).toContain('HoverDepth');
    expect(context.motionPrimitives).toContain('ParallaxMedia');
  });

  it('clamps allowed variants to the resolved ArtDirectionPack', () => {
    const editorialContext = buildWizardAggregatedRegistryContext({
      industry: 'salon',
      templateId: 'salon-premium',
      themePresetId: 'editorial',
    });

    const gallerySection = editorialContext.sections.find((s) => s.type === 'gallery');
    expect(gallerySection).toBeDefined();
    // editorial pack allows specific gallery variants
    expect(gallerySection?.allowedVariantIds.length).toBeGreaterThan(0);
    for (const variantId of gallerySection?.allowedVariantIds || []) {
      expect(variantId.startsWith('gallery:')).toBe(true);
    }
  });

  it('traces all eligible registry capabilities across multiple industry configurations', () => {
    const testCases = [
      { industry: 'saas', templateId: 'saas-dark', themePresetId: 'futuristic' },
      { industry: 'restaurant', templateId: 'restaurant-premium', themePresetId: 'warm' },
      { industry: 'local-service', templateId: 'local-service-premium', themePresetId: 'modern' },
      { industry: 'real-estate', templateId: 'real-estate-premium', themePresetId: 'minimalist' },
      { industry: 'agency', templateId: 'agency-bold', themePresetId: 'bold' },
    ];

    for (const tc of testCases) {
      const context = buildWizardAggregatedRegistryContext(tc);
      expect(context.industry).toBe(tc.industry);
      expect(context.templateId).toBe(tc.templateId);
      expect(context.sections.length).toBe(17);
      expect(context.artifacts.length).toBeGreaterThanOrEqual(21);
      expect(context.catalogSurfaces.length).toBeGreaterThanOrEqual(8);
      expect(context.motionPrimitives.length).toBeGreaterThanOrEqual(7);
      expect(context.designRegistrySignature).toMatch(/^dr_/);
    }
  });
});
