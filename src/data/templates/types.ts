/**
 * Layout Templates - Type Definitions
 * Shared types for layout templates across all industries
 */

export type LayoutCategory =
  | "landing"
  | "portfolio"
  | "restaurant"
  | "ecommerce"
  | "blog"
  | "contractor"
  | "agency"
  | "startup";

export interface LayoutTemplate {
  id: string;
  name: string;
  category: LayoutCategory;
  description: string;
  thumbnail?: string;
  code: string;
  tags?: string[];
}
