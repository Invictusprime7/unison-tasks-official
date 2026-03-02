/**
 * AI Site Elements Library — Public API
 *
 * Single entry point for the entire library system.
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
