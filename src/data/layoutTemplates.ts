/**
 * Layout Templates
 * 
 * This file re-exports from the organized templates folder structure.
 * Templates are now organized by industry type and map to Business Systems.
 * 
 * @see src/data/templates/index.ts for the main aggregation
 * @see src/data/templates/types.ts for Business System definitions
 * @see src/contracts/ for the canonical contract-first architecture
 */

// Re-export everything from the templates folder
export type { 
  LayoutCategory, 
  LayoutTemplate,
  BusinessSystemType,
  BusinessSystem,
  SystemContract,
  PublishCheck,
  DemoResponse,
} from './templates';

export {
  // Utilities
  wrapInReactComponent,
  wrapInHtmlDoc, // deprecated alias
  getTemplateReactCode,
  
  // Salon templates only
  salonTemplates,
  
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
  
  // System Contracts (Phase 6)
  systemContracts,
  getSystemContract,
  isRequiredIntent,
  getDemoResponse,

  // Advanced CSS System
  ADVANCED_CSS,
  INDUSTRY_COLOR_PALETTES,
  generateIndustryCss,
  SCROLL_REVEAL_SCRIPT,
  INTERACTIVE_SCRIPT,
} from './templates';
