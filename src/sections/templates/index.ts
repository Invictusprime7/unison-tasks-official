/**
 * Template Compositions Index — All 24 templates as declarative compositions
 */
import type { TemplateComposition } from '../types';

// Industry imports
import { salonDarkLuxury, salonLightWellness, salonBoldEditorial } from './salon';
import { restaurantFineDining, restaurantCasualBistro, restaurantFarmBold } from './restaurant';
import { contractorPro, contractorFriendly, contractorEmergency } from './localService';
import { ecommerceFashionDark, ecommerceCleanShowcase, ecommerceBoldLifestyle } from './ecommerce';
import { coachingExecutive, coachingWellness, coachingBoldMentor } from './coaching';
import { realEstateLuxury, realEstateResidential, realEstateCommercial } from './realEstate';
import { portfolioMinimal, portfolioCreative, portfolioPhotography } from './portfolio';
import { nonprofitImpact, nonprofitCommunity, nonprofitUrgent } from './nonprofit';

// ============================================================================
// All 24 Compositions
// ============================================================================

export const ALL_COMPOSITIONS: TemplateComposition[] = [
  // Salon (3)
  salonDarkLuxury, salonLightWellness, salonBoldEditorial,
  // Restaurant (3)
  restaurantFineDining, restaurantCasualBistro, restaurantFarmBold,
  // Local Service / Contractor (3)
  contractorPro, contractorFriendly, contractorEmergency,
  // E-commerce (3)
  ecommerceFashionDark, ecommerceCleanShowcase, ecommerceBoldLifestyle,
  // Coaching (3)
  coachingExecutive, coachingWellness, coachingBoldMentor,
  // Real Estate (3)
  realEstateLuxury, realEstateResidential, realEstateCommercial,
  // Portfolio (3)
  portfolioMinimal, portfolioCreative, portfolioPhotography,
  // Nonprofit (3)
  nonprofitImpact, nonprofitCommunity, nonprofitUrgent,
];

// ============================================================================
// Lookup Helpers
// ============================================================================

export const getCompositionById = (id: string): TemplateComposition | undefined =>
  ALL_COMPOSITIONS.find(c => c.id === id);

export const getCompositionsByIndustry = (industry: string): TemplateComposition[] =>
  ALL_COMPOSITIONS.filter(c => c.industry === industry);

export const getCompositionsByCategory = (category: string): TemplateComposition[] =>
  ALL_COMPOSITIONS.filter(c => c.category === category);

export const getCompositionsBySystemType = (systemType: string): TemplateComposition[] =>
  ALL_COMPOSITIONS.filter(c => c.systemType === systemType);

// Re-export all individual compositions
export {
  salonDarkLuxury, salonLightWellness, salonBoldEditorial,
  restaurantFineDining, restaurantCasualBistro, restaurantFarmBold,
  contractorPro, contractorFriendly, contractorEmergency,
  ecommerceFashionDark, ecommerceCleanShowcase, ecommerceBoldLifestyle,
  coachingExecutive, coachingWellness, coachingBoldMentor,
  realEstateLuxury, realEstateResidential, realEstateCommercial,
  portfolioMinimal, portfolioCreative, portfolioPhotography,
  nonprofitImpact, nonprofitCommunity, nonprofitUrgent,
};
