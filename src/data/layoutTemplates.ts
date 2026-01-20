/**
 * Layout Templates
 * 
 * This file re-exports from the organized templates folder structure.
 * Templates are now organized by industry type and map to Business Systems:
 *   
 *   Business Systems → Template Categories:
 *      booking     → restaurant, contractor
 *      portfolio   → portfolio, agency  
 *      store       → ecommerce
 *      agency      → agency, startup
 *      content     → blog, landing
 *      saas        → landing, startup
 * 
 * @see src/data/templates/index.ts for the main aggregation
 * @see src/data/templates/types.ts for Business System definitions
 */

// Re-export everything from the templates folder
export type { 
  LayoutCategory, 
  LayoutTemplate,
  BusinessSystemType,
  BusinessSystem 
} from './templates';

export {
  // Utilities
  wrapInHtmlDoc,
  
  // Industry-specific template arrays
  landingTemplates,
  portfolioTemplates,
  restaurantTemplates,
  ecommerceTemplates,
  blogTemplates,
  contractorTemplates,
  agencyTemplates,
  startupTemplates,
  
  // Aggregated templates array
  layoutTemplates,
  
  // Helper functions
  getTemplatesByCategory,
  getTemplatesBySystem,
  getTemplateById,
  searchTemplates,
  getAllCategories,
  getAllSystems,
  
  // Business Systems
  businessSystems,
  getSystemById,
  getTemplatesForSystem,
} from './templates';
