/**
 * Layout Templates - Main Index
 * Re-exports all templates organized by industry type
 */

// Types
export { LayoutCategory, LayoutTemplate } from './types';

// Utilities
export { wrapInHtmlDoc } from './utils';

// Industry Templates
export { landingTemplates } from './landing';
export { portfolioTemplates } from './portfolio';
export { restaurantTemplates } from './restaurant';
export { ecommerceTemplates } from './ecommerce';
export { blogTemplates } from './blog';
export { contractorTemplates } from './contractor';
export { agencyTemplates } from './agency';
export { startupTemplates } from './startup';

// Import all templates for aggregation
import { landingTemplates } from './landing';
import { portfolioTemplates } from './portfolio';
import { restaurantTemplates } from './restaurant';
import { ecommerceTemplates } from './ecommerce';
import { blogTemplates } from './blog';
import { contractorTemplates } from './contractor';
import { agencyTemplates } from './agency';
import { startupTemplates } from './startup';
import type { LayoutCategory, LayoutTemplate } from './types';

/**
 * All layout templates aggregated from industry folders
 */
export const layoutTemplates: LayoutTemplate[] = [
  ...landingTemplates,
  ...portfolioTemplates,
  ...restaurantTemplates,
  ...ecommerceTemplates,
  ...blogTemplates,
  ...contractorTemplates,
  ...agencyTemplates,
  ...startupTemplates,
];

/**
 * Get templates filtered by category
 */
export const getTemplatesByCategory = (category: LayoutCategory): LayoutTemplate[] => {
  return layoutTemplates.filter(t => t.category === category);
};

/**
 * Get a single template by ID
 */
export const getTemplateById = (id: string): LayoutTemplate | undefined => {
  return layoutTemplates.find(t => t.id === id);
};

/**
 * Search templates by name, description, or tags
 */
export const searchTemplates = (query: string): LayoutTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return layoutTemplates.filter(t => 
    t.name.toLowerCase().includes(lowercaseQuery) ||
    t.description.toLowerCase().includes(lowercaseQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Get all unique categories
 */
export const getAllCategories = (): LayoutCategory[] => {
  return Array.from(new Set(layoutTemplates.map(t => t.category)));
};
