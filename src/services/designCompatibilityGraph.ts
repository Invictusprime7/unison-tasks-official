import type { WizardExperiencePreference } from '@/services/wizardDesignSelection';
import type { ImplementationVisualSignature } from '@/services/implementationVisualSignature';

const EXPERIENCE_COMPATIBILITY: Record<WizardExperiencePreference, readonly ImplementationVisualSignature['experienceLevel'][]> = {
  standard: ['standard'],
  'motion-rich': ['standard', 'motion-rich'],
  immersive: ['standard', 'motion-rich', 'immersive'],
};

export function isImplementationExperienceCompatible(signature: ImplementationVisualSignature, preference: WizardExperiencePreference): boolean {
  return EXPERIENCE_COMPATIBILITY[preference].includes(signature.experienceLevel);
}

export function compatibleExperiencePreferences(signature: ImplementationVisualSignature): WizardExperiencePreference[] {
  return (Object.keys(EXPERIENCE_COMPATIBILITY) as WizardExperiencePreference[])
    .filter(preference => isImplementationExperienceCompatible(signature, preference));
}