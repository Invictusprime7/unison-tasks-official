/**
 * Section Variant Types
 * 
 * Defines the variant system that lets creators pick different visual layouts
 * for each section type while preserving the same data contract (props).
 * 
 * All rendering uses JSX/React source strings — consistent with the
 * SystemLauncher pipeline that generates React VFS files.
 */

import type { ComponentType } from 'react';
import type { RadixPrimitiveId } from '@/platform/core/generatedUiFoundation';
import type { VocabularyCategory } from '@/platform/core/designVocabulary';
import type { SectionType, BaseSectionProps } from '../types';

/** Unique identifier for a variant: "hero:split-image", "cta:gradient-banner", etc. */
export type VariantId = `${SectionType}:${string}`;
/** Points at a design vocabulary entry; ids are unique per category only. */
export interface VocabularyRef {
  category: VocabularyCategory;
  id: string;
}
/**
 * How a registered variant relates to the experience (WebGL) layer.
 *
 * `declared` records the dependency a future Phase 6A implementation will need
 * and grants no runtime capability; only `enabled` variants may reach live 3D.
 * The primitives are never restated here — they are derived from the named
 * design vocabulary entry, which owns them.
 */
export interface VariantExperienceDeclaration {
  status: 'declared' | 'enabled';
  vocabulary: { category: VocabularyCategory; id: string };
}

/** Content extracted from an existing JSX section for re-rendering in a new layout */
export interface ExtractedSectionContent {
  heading?: string;
  subheading?: string;
  ctaButtons?: Array<{ text: string; href: string; isPrimary: boolean }>;
  navLinks?: Array<{ text: string; href: string }>;
  brandName?: string;
  imageSrc?: string;
  imageAlt?: string;
  badge?: string;
  listItems?: string[];
}

/** Metadata for a single section layout variant */
export interface SectionVariant<T extends SectionType = SectionType> {
  /** Unique ID: "hero:centered", "hero:split-image", "hero:full-bleed" */
  id: VariantId;
  /** The parent section type this variant belongs to */
  sectionType: T;
  /** Short slug for this variant style */
  slug: string;
  /** Display name shown in the variant picker */
  name: string;
  /** Brief description of the layout style */
  description: string;
  /** The React component that renders this variant (used by PageRenderer) */
  component: ComponentType<BaseSectionProps<T>>;
  vfs?: { mode: 'portable-recipe' | 'legacy-jsx' };
  /** Static thumbnail path for the variant picker grid */
  thumbnail: string;
  /** Tags for filtering (e.g., "modern", "minimal", "bold") */
  tags?: string[];
  pageRoles?: readonly import('../types').TemplatePageRole[];
  /** Whether this is the default variant for the section type */
  isDefault?: boolean;
  /** Radix behavior facades required by this variant's generated JSX */
  radixPrimitives?: readonly RadixPrimitiveId[];
  /** Design vocabulary pattern this variant already executes today */
  vocabulary?: VocabularyRef;
  /** Experience-layer dependency this variant declares or enables */
  experience?: VariantExperienceDeclaration;
  /** Generates JSX source string for this variant layout using extracted content */
  renderJSX: (content: ExtractedSectionContent) => string;
}

/** Map of section type → array of available variants */
export type VariantRegistry = Partial<Record<SectionType, SectionVariant[]>>;

/** Tracks which variant is active for each section instance in a template */
export type ActiveVariantMap = Record<string, VariantId>;
