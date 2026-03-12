/**
 * Layout Templates
 * Re-exports from the organized templates folder.
 */

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
  wrapInHtmlDoc,
  getTemplateReactCode,
  
  // Aggregated templates
  layoutTemplates,
  
  // Helpers
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
  
  // System Contracts
  systemContracts,
  getSystemContract,
  isRequiredIntent,
  getDemoResponse,
} from './templates';
