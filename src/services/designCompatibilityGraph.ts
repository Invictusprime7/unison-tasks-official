import type { WizardExperiencePreference } from '@/services/wizardDesignSelection';
import type { ImplementationVisualSignature } from '@/services/implementationVisualSignature';

/**
 * The experience preference is a ceiling on the runtime capability an
 * implementation requires, not an exact match on how animated it looks.
 * Immersive implementations need a WebGL/spatial budget, so they are offered
 * only when the user asked for Immersive. Motion-rich implementations remain
 * available under Standard because their motion is token-driven and every
 * certified implementation documents a reduced-motion state.
 */
const EXPERIENCE_COMPATIBILITY: Record<WizardExperiencePreference, readonly ImplementationVisualSignature['experienceLevel'][]> = {
  standard: ['standard', 'motion-rich'],
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