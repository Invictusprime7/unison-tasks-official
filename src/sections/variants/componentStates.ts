/**
 * Component State Contracts (V4 Milestone 6)
 *
 * 21st-derived implementations are imported for their interaction quality, not
 * only their static markup. This module makes the states they support
 * first-class and *derivable*, so Lane B, the composition planner and the
 * future Property Inspector reason about real states instead of inventing
 * them.
 *
 * Ownership rules:
 *  - The certified implementation owns which states exist (`variant.states`).
 *  - Art Direction Packs may influence motion/interaction posture only.
 *  - This module never renders, never writes VFS and never adds a registry:
 *    it derives a contract from the Variant Registry entry it is given.
 */

import type { SectionType } from '../types';
import type { SectionVariant } from './types';

export type ComponentState =
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'pressed'
  | 'selected'
  | 'expanded'
  | 'collapsed'
  | 'disabled'
  | 'loading'
  | 'success'
  | 'error'
  | 'empty';

export type ResponsiveStateId = 'mobile' | 'tablet' | 'desktop' | 'reduced-motion';

export interface InteractionContract {
  hover: string;
  focus: string;
  active: string;
  reducedMotion: string;
}

export interface ComponentStateContract {
  /** States the certified implementation is known to express. */
  supported: readonly ComponentState[];
  /** Named interaction posture per pointer/keyboard state. */
  interaction: InteractionContract;
  /** Responsive/preference states the implementation was certified against. */
  responsive: readonly ResponsiveStateId[];
}

/** Every certified implementation must express at least these. */
export const BASELINE_COMPONENT_STATES: readonly ComponentState[] = ['default', 'hover', 'focus'];

export const BASELINE_RESPONSIVE_STATES: readonly ResponsiveStateId[] = [
  'mobile',
  'tablet',
  'desktop',
  'reduced-motion',
];

const BASELINE_INTERACTION: InteractionContract = {
  hover: 'surface-lift',
  focus: 'ring',
  active: 'press-scale',
  reducedMotion: 'fade-only',
};

/**
 * Family posture defaults. These describe what the family's certified
 * implementations already do today; a variant may override any of it through
 * `variant.states`.
 */
const FAMILY_STATES: Partial<Record<SectionType, Partial<ComponentStateContract>>> = {
  navbar: {
    supported: ['default', 'hover', 'focus', 'active', 'expanded', 'collapsed', 'selected'],
    interaction: { hover: 'link-underline', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  hero: {
    supported: ['default', 'hover', 'focus', 'pressed', 'loading'],
    interaction: { hover: 'media-shift', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  gallery: {
    supported: ['default', 'hover', 'focus', 'selected', 'expanded', 'loading', 'empty'],
    interaction: { hover: 'media-zoom', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  services: {
    supported: ['default', 'hover', 'focus', 'selected', 'loading', 'empty'],
    interaction: { hover: 'card-raise', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  features: {
    supported: ['default', 'hover', 'focus', 'selected'],
    interaction: { hover: 'card-raise', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  pricing: {
    supported: ['default', 'hover', 'focus', 'selected', 'disabled', 'loading'],
    interaction: { hover: 'card-raise', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  testimonials: {
    supported: ['default', 'hover', 'focus', 'selected', 'empty'],
    interaction: { hover: 'marquee-pause', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  faq: {
    supported: ['default', 'hover', 'focus', 'expanded', 'collapsed'],
    interaction: { hover: 'row-tint', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  contact: {
    supported: ['default', 'hover', 'focus', 'disabled', 'loading', 'success', 'error'],
    interaction: { hover: 'field-tint', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  cta: {
    supported: ['default', 'hover', 'focus', 'pressed', 'disabled', 'loading'],
    interaction: { hover: 'glow-shift', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
  footer: {
    supported: ['default', 'hover', 'focus'],
    interaction: { hover: 'link-underline', focus: 'ring', active: 'press-scale', reducedMotion: 'fade-only' },
  },
};

/** Derive the canonical state contract for a certified implementation. */
export function resolveComponentStateContract(variant: SectionVariant): ComponentStateContract {
  const family = FAMILY_STATES[variant.sectionType] ?? {};
  const declared = variant.states ?? {};
  const supported = new Set<ComponentState>([
    ...BASELINE_COMPONENT_STATES,
    ...(family.supported ?? []),
    ...(declared.supported ?? []),
  ]);
  return {
    supported: [...supported],
    interaction: { ...BASELINE_INTERACTION, ...(family.interaction ?? {}), ...(declared.interaction ?? {}) },
    responsive: [...new Set<ResponsiveStateId>([
      ...(declared.responsive ?? family.responsive ?? BASELINE_RESPONSIVE_STATES),
    ])],
  };
}

/** Structural check used by the generation coverage gate. */
export function componentStateContractIssues(variant: SectionVariant): string[] {
  const contract = resolveComponentStateContract(variant);
  const issues: string[] = [];
  for (const state of BASELINE_COMPONENT_STATES) {
    if (!contract.supported.includes(state)) issues.push(`${variant.id}: missing required state "${state}"`);
  }
  if (!contract.responsive.includes('reduced-motion')) {
    issues.push(`${variant.id}: no reduced-motion state recorded`);
  }
  for (const key of ['hover', 'focus', 'active', 'reducedMotion'] as const) {
    if (!contract.interaction[key]) issues.push(`${variant.id}: interaction contract missing "${key}"`);
  }
  return issues;
}
