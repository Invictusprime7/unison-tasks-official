/**
 * AI Site Elements Library — Public API
 *
 * @deprecated RETIRED AS AN AUTHORITY (M2).
 * The canonical section/intent context for the AI Builder now comes from
 * `src/sections/promptContext/canonicalDesignPrompt.ts`, which derives from the
 * registered variant registry and the canonical intent registry. Do not import
 * this module from application source; `src/test/canonicalDesignPromptAuthority.test.ts`
 * enforces that rule. These files remain only for historical reference and are
 * scheduled for deletion.
 */

// Types
export type {
  SiteElement,
  SiteElementsLibrary,
  ElementCategory,
  ElementSubCategory,
  StyleArchetype,
  LayoutPattern,
  IndustryAffinity,
  ContentSlot,
  ElementVariation,
  ConversionIntelligence,
  PageBlueprint,
} from './types';

// Registry & Resolver
export {
  siteElementsLibrary,
  getAllElements,
  getElementById,
  getElementsByCategory,
  getElementsByIndustry,
  getElementsByTag,
  searchElements,
  getPageBlueprint,
  getPageBlueprintsForIndustry,
  resolveBlueprint,
  getMostCommonElements,
  getRecommendedForPosition,
  getVariationsForStyle,
  systemTypeToIndustry,
} from './registry';

// Prompt Generators
export {
  generateLibraryPrompt,
  generateElementPrompt,
  generateBlueprintPrompt,
} from './promptGenerator';

// Intent Wiring
export type {
  WiringPoint,
  ElementWiring,
} from './intentWiring';

export {
  ELEMENT_INTENT_MAP,
  getElementWiring,
  getBlueprintWiring,
  resolveIndustryWiring,
  generateWiringPrompt,
  generateIndustryIntentSheet,
} from './intentWiring';
