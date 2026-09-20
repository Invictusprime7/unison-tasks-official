import { describe, expect, it } from 'vitest';
import { deriveImplementationVisualSignature } from '@/services/implementationVisualSignature';
import { compatibleExperiencePreferences, isImplementationExperienceCompatible } from '@/services/designCompatibilityGraph';
import { getVariantById } from '@/sections/variants/registry';

describe('certified implementation visual signatures', () => {
  it('derives deterministic structured metadata from registry-owned fields', () => {
    const variant = getVariantById('hero:prisma-cinematic');
    expect(variant).toBeDefined();
    if (!variant) return;
    const first = deriveImplementationVisualSignature(variant);
    expect(deriveImplementationVisualSignature(variant)).toEqual(first);
    expect(first).toEqual(expect.objectContaining({
      geometry: expect.any(String), mediaDominance: expect.any(String), typographyScale: expect.any(String),
      density: expect.any(String), motion: expect.any(Array), composition: variant.description,
      experienceLevel: expect.any(String),
    }));
  });

  it('uses one compatibility graph for standard, motion-rich, and immersive selection', () => {
    const standard = { geometry: 'centered', mediaDominance: 'low', typographyScale: 'restrained', density: 'balanced', motion: [], composition: 'Static', experienceLevel: 'standard' } satisfies import('@/services/implementationVisualSignature').ImplementationVisualSignature;
    const immersive = { ...standard, experienceLevel: 'immersive' } satisfies import('@/services/implementationVisualSignature').ImplementationVisualSignature;
    expect(compatibleExperiencePreferences(standard)).toEqual(['standard', 'motion-rich', 'immersive']);
    expect(isImplementationExperienceCompatible(immersive, 'standard')).toBe(false);
    expect(isImplementationExperienceCompatible(immersive, 'immersive')).toBe(true);
  });
});