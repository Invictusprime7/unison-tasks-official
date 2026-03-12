/**
 * Template Compositions Index
 * 
 * All templates as declarative section compositions.
 * Import and use via the composition registry.
 */

import type { TemplateComposition } from '../types';
import { salonDarkLuxury, salonLightWellness, salonBoldEditorial } from './salon';

// ============================================================================
// All Compositions
// ============================================================================

export const ALL_COMPOSITIONS: TemplateComposition[] = [
  // Salon
  salonDarkLuxury,
  salonLightWellness,
  salonBoldEditorial,
  
  // Future: restaurant, contractor, ecommerce, etc.
];

// ============================================================================
// Lookup Helpers
// ============================================================================

export const getCompositionById = (id: string): TemplateComposition | undefined => {
  return ALL_COMPOSITIONS.find(c => c.id === id);
};

export const getCompositionsByIndustry = (industry: string): TemplateComposition[] => {
  return ALL_COMPOSITIONS.filter(c => c.industry === industry);
};

export const getCompositionsByCategory = (category: string): TemplateComposition[] => {
  return ALL_COMPOSITIONS.filter(c => c.category === category);
};

export const getCompositionsBySystemType = (systemType: string): TemplateComposition[] => {
  return ALL_COMPOSITIONS.filter(c => c.systemType === systemType);
};

export { salonDarkLuxury, salonLightWellness, salonBoldEditorial };
