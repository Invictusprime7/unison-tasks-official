import type { ArtDirectionPackId } from '@/sections/variants/artDirectionPacks';
import type { VariantId } from '@/sections/variants/types';

export const WIZARD_DESIGN_SELECTION_VERSION = '1.0' as const;

export type WizardDesignSelectionMode = 'auto' | 'guided' | 'custom';
export type WizardExperiencePreference = 'standard' | 'motion-rich' | 'immersive';

/**
 * Canonical Wizard control layer over the existing Variant Registry.
 * It is selection state only: packs and variants remain registry-owned.
 */
export interface WizardDesignSelection {
  version: typeof WIZARD_DESIGN_SELECTION_VERSION;
  mode: WizardDesignSelectionMode;
  artDirectionPackId?: ArtDirectionPackId;
  experience: WizardExperiencePreference;
  /** Stable section instance id -> certified registry implementation id. */
  sectionPins: Record<string, VariantId>;
}

export function createWizardDesignSelection(
  input: Partial<Omit<WizardDesignSelection, 'version'>> = {},
): WizardDesignSelection {
  return {
    version: WIZARD_DESIGN_SELECTION_VERSION,
    mode: input.mode ?? (input.artDirectionPackId ? 'guided' : 'auto'),
    artDirectionPackId: input.artDirectionPackId,
    experience: input.experience ?? 'standard',
    sectionPins: { ...(input.sectionPins ?? {}) },
  };
}