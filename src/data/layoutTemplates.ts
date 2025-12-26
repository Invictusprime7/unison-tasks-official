/**
 * Layout Templates
 * 
 * This file re-exports from the organized templates folder structure.
 * Templates are now organized by industry type in:
 *   src/data/templates/
 *      landing/      - SaaS & landing page templates
 *      portfolio/    - Designer portfolio templates
 *      restaurant/   - Restaurant & dining templates
 *      ecommerce/    - Online store templates
 *      blog/         - Blog & content templates
 *      contractor/   - Construction & services templates
 *      agency/       - Creative agency templates
 *      startup/      - Product launch templates
 * 
 * @see src/data/templates/index.ts for the main aggregation
 */

// Re-export everything from the templates folder
export type { LayoutCategory, LayoutTemplate } from './templates';
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
  getTemplateById,
  searchTemplates,
  getAllCategories,
} from './templates';
