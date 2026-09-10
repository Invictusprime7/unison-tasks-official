import { describe, expect, it } from 'vitest';
import { VARIANT_REGISTRY, resolveExperienceRequirement } from '@/sections/variants';
import type { SectionVariant, VariantId } from '@/sections/variants';
import { getDesignImplementation } from '@/services/designImplementationRegistry';
import { resolveApprovedExperienceCapabilities } from '@/services/experienceCapabilityResolver';
import { buildWizardDesignIntervention } from '@/services/wizardDesignIntervention';
import { getVocabularyEntry } from '@/platform/core/designVocabulary';
import { EXPERIENCE_CAPABILITY_ID } from '@/platform/core/generatedRuntimeCapabilities';

const allVariants = Object.values(VARIANT_REGISTRY).flat() as SectionVariant[];
const allVariantIds = allVariants.map((variant) => variant.id);
const declaredVariants = allVariants.filter((variant) => variant.experience);
const foundation = [EXPERIENCE_CAPABILITY_ID];

describe('registered experience declarations', () => {
  it('declares future dependencies without enabling live 3D anywhere in the registry', () => {
    const enabled = allVariants.filter((variant) => variant.experience?.status === 'enabled');
    expect(enabled).toEqual([]);

    const requirement = resolveExperienceRequirement(allVariantIds);
    expect(requirement.enabledPrimitives).toEqual([]);
    expect(requirement.capabilities).toEqual([]);
    expect(requirement.declaredPrimitives).toContain('DepthGallery');
  });

  it.each(declaredVariants)(
    'resolves $id against a vocabulary entry that owns experience primitives',
    (variant) => {
      const { category, id } = variant.experience!.vocabulary;
      const entry = getVocabularyEntry(category, id);
      expect(entry, `unknown vocabulary entry ${category}:${id}`).toBeDefined();
      expect(entry!.experience).not.toBe('none');
      expect(entry!.primitives.length).toBeGreaterThan(0);
      expect(resolveExperienceRequirement([variant.id]).declaredPrimitives)
        .toEqual(expect.arrayContaining([...entry!.primitives]));
    },
  );

  it('projects a variant declaration into the derived registry as a clone', () => {
    const variant = declaredVariants[0];
    const implementation = getDesignImplementation(variant.id)!;
    expect(implementation.experience).toEqual(variant.experience);
    expect(implementation.experience).not.toBe(variant.experience);
    expect(implementation.experience?.vocabulary).not.toBe(variant.experience?.vocabulary);
  });

  it('ignores unregistered variant ids instead of inventing a requirement', () => {
    expect(resolveExperienceRequirement(['gallery:not-registered' as VariantId])).toEqual({
      enabledPrimitives: [],
      declaredPrimitives: [],
      capabilities: [],
    });
  });
});

describe('resolveApprovedExperienceCapabilities', () => {
  it('denies approval when the envelope is ineligible or absent', () => {
    expect(resolveApprovedExperienceCapabilities({
      webgl: 'ineligible',
      foundationCapabilities: foundation,
      requiredCapabilities: [EXPERIENCE_CAPABILITY_ID],
      reachesExperienceLayer: true,
    })).toEqual([]);
    expect(resolveApprovedExperienceCapabilities({ foundationCapabilities: foundation })).toEqual([]);
  });

  it('does not approve a capability that eligibility alone would have granted', () => {
    expect(resolveApprovedExperienceCapabilities({
      webgl: 'eligible',
      foundationCapabilities: foundation,
      requiredCapabilities: [],
      reachesExperienceLayer: false,
    })).toEqual([]);
  });

  it('approves a capability a registered implementation requires', () => {
    expect(resolveApprovedExperienceCapabilities({
      webgl: 'accent',
      foundationCapabilities: foundation,
      requiredCapabilities: [EXPERIENCE_CAPABILITY_ID],
    })).toEqual([EXPERIENCE_CAPABILITY_ID]);
  });

  it('approves a capability the sealed VFS already reaches', () => {
    expect(resolveApprovedExperienceCapabilities({
      webgl: 'eligible',
      foundationCapabilities: foundation,
      reachesExperienceLayer: true,
    })).toEqual([EXPERIENCE_CAPABILITY_ID]);
  });

  it('never approves a capability the emitted foundation does not support', () => {
    expect(resolveApprovedExperienceCapabilities({
      webgl: 'eligible',
      foundationCapabilities: [],
      requiredCapabilities: [EXPERIENCE_CAPABILITY_ID],
      reachesExperienceLayer: true,
    })).toEqual([]);
  });
});

describe('sealed AI directive', () => {
  const launch = {
    businessName: 'Northstar Store',
    businessModel: 'ecommerce' as const,
    industryOverlay: 'ecommerce' as const,
    templateId: 'store-boutique',
    themePresetId: 'organic',
    wizardSeedId: 'wizard-store-1',
    sellsProducts: true,
  };

  it('does not invite an immersive layer the launch would reject', () => {
    const intervention = buildWizardDesignIntervention(launch);

    expect(resolveExperienceRequirement(Object.values(intervention.activeVariants)).capabilities)
      .toEqual([]);
    expect(intervention.aiDirective).toContain('not approved for this launch');
    expect(intervention.aiDirective).not.toContain('compose the immersive layer');
    expect(intervention.aiDirective).toContain('snapshot-owned UI primitives');
  });

  it('keeps the eligibility plan separate from the approval decision', () => {
    const intervention = buildWizardDesignIntervention(launch);

    // The model's candidate plan is retained; only the instruction is gated,
    // so a later Phase 6A launch does not read this as a WebGL opt-out.
    expect(intervention.experienceBudget).toBe('immersive');
    expect(intervention.experienceRecipes).toContain('product-stage');
    expect(intervention.envelope.webgl).not.toBe('ineligible');
  });
});
