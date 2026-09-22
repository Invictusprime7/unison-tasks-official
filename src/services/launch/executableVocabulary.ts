/**
 * Executable Design Vocabulary (Phase 5 — make the vocabulary executable).
 *
 * AUTHORITY
 *   The design vocabulary describes visual patterns. This module is the single
 *   place that answers the only question the Launcher may ask of it: *can the
 *   compiler actually build this today?* An entry is executable when at least
 *   one of these is true:
 *
 *     1. `implementation` — a registered section implementation claims it
 *        (`SectionVariant.vocabulary` / `vocabularyRefs`).
 *     2. `adapter`        — a composition enhancement recipe mounts it.
 *     3. `primitive`      — the generated UI foundation emits every primitive
 *        the entry composes from (motion / background facades, or the
 *        experience facade for WebGL entries).
 *
 *   Everything else is *descriptive only* and must never be offered to Lane B:
 *   naming an unbuildable pattern in a prompt is exactly how a launch ends up
 *   with invented imports or a section that silently degrades to a card grid.
 *   Phase 5 closes the gap by registering implementations and recipes, never by
 *   trimming the vocabulary — so `unexecutable()` is a shrinking backlog.
 */

import {
  DESIGN_VOCABULARY,
  type DesignVocabularyEntry,
  type VocabularyCategory,
} from '@/platform/core/designVocabulary';
import {
  EXPERIENCE_PRIMITIVES,
  type ExperiencePrimitive,
} from '@/platform/core/experiencePrimitives';
import {
  GENERATED_BACKGROUND_PRIMITIVES,
  GENERATED_MOTION_PRIMITIVES,
} from '@/platform/core/generatedUiFoundation';
import { COMPOSITION_ENHANCEMENTS } from '@/sections/compositionEnhancements';
import {
  isExecutableVocabulary,
  listImplementationsForVocabulary,
  vocabularyKey,
} from '@/services/designImplementationRegistry';
import type { VocabularyRef } from '@/sections/variants/types';

/**
 * Primitives the platform emits but cannot feed: `ModelViewer` needs a real
 * `.glb` asset no business profile supplies, so entries that depend on it stay
 * unexecutable until an asset pipeline exists.
 */
export const ASSET_DEPENDENT_PRIMITIVES: readonly ExperiencePrimitive[] = ['ModelViewer'];

/**
 * Non-experience vocabulary executed directly by a generated foundation
 * primitive. Names are validated against the emitted facades by test, so this
 * table can never claim a component the foundation does not ship.
 */
export const VOCABULARY_PRIMITIVE_RECIPES: Readonly<Record<string, readonly string[]>> = {
  'hero:scroll-reveal': ['Reveal', 'MaskReveal'],
  'content:marquee': ['MarqueeBand'],
  'content:horizontal-scroll': ['HorizontalRail'],
  'media:parallax-gallery': ['ParallaxMedia'],
  'motion:stagger': ['StaggerGroup', 'StaggerItem'],
  'motion:scroll-linked': ['Reveal', 'RevealGroup'],
  'motion:mask-reveal': ['MaskReveal'],
  'motion:parallax': ['ParallaxMedia'],
  'motion:hover-depth': ['HoverDepth'],
  'background:animated-grid': ['AnimatedGrid'],
  'background:noise-field': ['NoiseField'],
  'background:glow-field': ['GlowField'],
  'background:gradient-orbs': ['GradientOrbs'],
  'background:media-canvas': ['MediaCanvas'],
};

const FOUNDATION_PRIMITIVES = new Set<string>([
  ...GENERATED_MOTION_PRIMITIVES,
  ...GENERATED_BACKGROUND_PRIMITIVES,
]);
const EMITTED_EXPERIENCE_PRIMITIVES = new Set<string>(EXPERIENCE_PRIMITIVES);
const ADAPTER_KEYS = new Set(
  COMPOSITION_ENHANCEMENTS
    .filter((recipe) => recipe.vocabularyId)
    .map((recipe) => `${recipe.category}:${recipe.vocabularyId}`),
);

export type VocabularyExecutionKind = 'implementation' | 'adapter' | 'primitive' | 'none';

export interface VocabularyExecution {
  key: string;
  kind: VocabularyExecutionKind;
  /** Registered implementation ids that execute the entry (kind `implementation`). */
  implementationIds: string[];
  /** Foundation / experience primitives that execute the entry (kind `primitive`). */
  primitives: string[];
  /** Enhancement recipe ids that mount the entry (kind `adapter`). */
  adapterIds: string[];
  /** Why an entry is not executable — the Phase 5 backlog reason. */
  reason?: 'no-implementation' | 'asset-dependency';
}

function entryFor(ref: VocabularyRef): DesignVocabularyEntry | undefined {
  return DESIGN_VOCABULARY.find(
    (candidate) => candidate.category === ref.category && candidate.id === ref.id,
  );
}

/** How (and whether) the compiler can build a vocabulary entry today. */
export function resolveVocabularyExecution(ref: VocabularyRef): VocabularyExecution {
  const key = vocabularyKey(ref);
  const base: VocabularyExecution = { key, kind: 'none', implementationIds: [], primitives: [], adapterIds: [] };

  if (isExecutableVocabulary(ref)) {
    return {
      ...base,
      kind: 'implementation',
      implementationIds: listImplementationsForVocabulary(ref).map((impl) => impl.implementationId),
    };
  }

  const adapterIds = COMPOSITION_ENHANCEMENTS
    .filter((recipe) => `${recipe.category}:${recipe.vocabularyId}` === key)
    .map((recipe) => recipe.id as string);
  if (adapterIds.length > 0) return { ...base, kind: 'adapter', adapterIds };

  const entry = entryFor(ref);
  const declared = entry?.primitives ?? [];
  if (declared.length > 0) {
    if (declared.some((primitive) => ASSET_DEPENDENT_PRIMITIVES.includes(primitive))) {
      return { ...base, reason: 'asset-dependency' };
    }
    if (declared.every((primitive) => EMITTED_EXPERIENCE_PRIMITIVES.has(primitive))) {
      return { ...base, kind: 'primitive', primitives: [...declared] };
    }
    return { ...base, reason: 'no-implementation' };
  }

  const recipe = VOCABULARY_PRIMITIVE_RECIPES[key];
  if (recipe && recipe.every((name) => FOUNDATION_PRIMITIVES.has(name))) {
    return { ...base, kind: 'primitive', primitives: [...recipe] };
  }

  return { ...base, reason: 'no-implementation' };
}

/**
 * The single predicate the Launcher uses. Descriptive-only vocabulary is never
 * offered to Lane B, for any industry or business model.
 */
export function isOfferableVocabulary(ref: VocabularyRef): boolean {
  return resolveVocabularyExecution(ref).kind !== 'none';
}

export interface ExecutableVocabularyReport {
  version: '1.0';
  total: number;
  byKind: Record<Exclude<VocabularyExecutionKind, 'none'>, string[]>;
  /** Entries the vocabulary still describes but nothing can build. */
  unexecutable: Array<{ key: string; reason: NonNullable<VocabularyExecution['reason']> }>;
  /** Categories with no executable entry at all — a launch-blocking gap. */
  emptyCategories: VocabularyCategory[];
}

export function buildExecutableVocabularyReport(): ExecutableVocabularyReport {
  const byKind: ExecutableVocabularyReport['byKind'] = { implementation: [], adapter: [], primitive: [] };
  const unexecutable: ExecutableVocabularyReport['unexecutable'] = [];
  const executableCategories = new Set<VocabularyCategory>();

  for (const entry of DESIGN_VOCABULARY) {
    const execution = resolveVocabularyExecution(entry);
    if (execution.kind === 'none') {
      unexecutable.push({ key: execution.key, reason: execution.reason ?? 'no-implementation' });
      continue;
    }
    byKind[execution.kind].push(execution.key);
    executableCategories.add(entry.category);
  }

  const categories = [...new Set(DESIGN_VOCABULARY.map((entry) => entry.category))];
  return {
    version: '1.0',
    total: DESIGN_VOCABULARY.length,
    byKind,
    unexecutable,
    emptyCategories: categories.filter((category) => !executableCategories.has(category)),
  };
}
