import type { ArtDirectionPackId } from '../../variants/artDirectionPacks';
import type { UnisonBrandOverrides } from './brand';
import type { WizardExperiencePreference } from '../../../services/wizardDesignSelection';
import type { ThemeFamilyId } from './theme-family';

export interface UnisonProjectBrief {
  /** Design system release the brief was authored against. */
  designSystemVersion?: string;
  projectName: string;
  industry: string;
  /** User-facing creative language. Classifies; never fixes colours. */
  themeFamilyId?: ThemeFamilyId;
  /** Optional explicit pack — wins over the family and is sealed. */
  artDirectionPackId?: ArtDirectionPackId;
  /** Pack sealed by a previous compilation. Always wins. */
  sealedArtDirectionPackId?: ArtDirectionPackId;
  experience?: WizardExperiencePreference;
  designSeed?: string;
  pageRoles: string[];
  audience: string[];
  goals: string[];
  primaryIntents?: string[];
  contentPriorities?: string[];
  negativeVocabulary?: string[];
  /** Post-composition only. Never influences pack or variant selection. */
  brand?: UnisonBrandOverrides;
}
