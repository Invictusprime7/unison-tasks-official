/**
 * PatchPlan — the canonical mutation proposal shape accepted by
 * VFSCommitService. Every mutation source (AI Builder, Playground edits,
 * layout fast path, GHL binding path, system restore) produces a PatchPlan;
 * the commit service is the only code path that turns one into a new
 * SiteBundleSnapshot.
 *
 * Legacy callers that still produce raw `Record<string,string>` file maps
 * should funnel through `legacyFilesToPatchPlan` so the commit service
 * remains the single legal writer.
 */

import type { BusinessSystemState } from '@/platform/core/capabilityRegistry';

export type PatchSource =
  | 'wizard-launch'
  | 'ai-builder'
  | 'playground-edit'
  | 'layout-fast-path'
  | 'preview-toolbar'
  | 'binding-fast-path'
  | 'ghl-binding'
  | 'theme-change'
  | 'republish'
  | 'system-restore';

export type FileOp =
  | { type: 'create'; path: string; contents: string }
  | { type: 'replace'; path: string; contents: string }
  | { type: 'delete'; path: string };

export interface PlaygroundOp {
  type:
    | 'updateSection'
    | 'addSection'
    | 'removeSection'
    | 'reorderSection'
    | 'updatePage'
    | 'addPage'
    | 'removePage'
    | 'updateTheme';
  pageId?: string;
  sectionId?: string;
  payload?: unknown;
}

export interface BindingOp {
  type: 'bindIntent' | 'unbindIntent';
  elementId: string;
  intent?: string;
  payload?: Record<string, unknown>;
}

export interface BackendOp {
  type: 'requireCapability' | 'seedCapability';
  capability: string;
  payload?: Record<string, unknown>;
}

/**
 * Snapshot-owned visual mutations. These never rewrite page JSX directly:
 * they mutate the sealed design intervention and the canonical compiler
 * re-projects the pages (see `@/services/builder/semanticPresentationOps`).
 */
export interface PresentationSectionCopy {
  headline?: string;
  subheadline?: string;
  description?: string;
}

export type PresentationOp =
  | { type: 'setVariant'; sectionId: string; variantId: string }
  | { type: 'setSectionCopy'; pageRole: string; sectionType: string; copy: PresentationSectionCopy }
  | { type: 'reorderSections'; pageRole: string; sectionOrder: string[] }
  | { type: 'removeSection'; pageRole: string; sectionType: string }
  | { type: 'setMotionBudget'; motionBudget: 'restrained' | 'expressive' }
  | { type: 'setLayoutRecipe'; layoutRecipe: 'floating-navbar' | 'collage-hero' | 'bento-features' | 'media-card-grid' | 'conversion-form' | 'rich-footer' };

export interface PatchPlan {
  themeEdit?: import('@/services/theme/themeEdit').ThemeEdit;
  summary: string;
  fileOps: FileOp[];
  playgroundOps: PlaygroundOp[];
  bindingOps: BindingOp[];
  backendOps: BackendOp[];
  presentationOps: PresentationOp[];
  /** Approved capability state to stamp into the resulting SiteBundleSnapshot. */
  businessSystem?: BusinessSystemState;
}

export function emptyPatchPlan(summary = ''): PatchPlan {
  return {
    summary,
    fileOps: [],
    playgroundOps: [],
    bindingOps: [],
    backendOps: [],
    presentationOps: [],
  };
}

/**
 * Adapter: wrap a legacy raw file map (the shape AIBuilderPanel currently
 * emits via `onApplyToVFS`) into a PatchPlan composed entirely of `replace`
 * ops. Lets us route legacy callers through the commit service while we
 * migrate prompts to emit structured PatchPlans.
 */
export function legacyFilesToPatchPlan(
  files: Record<string, string>,
  summary = 'legacy file-map patch',
): PatchPlan {
  const fileOps: FileOp[] = Object.entries(files ?? {}).map(([path, contents]) => ({
    type: 'replace' as const,
    path,
    contents,
  }));
  return {
    summary,
    fileOps,
    playgroundOps: [],
    bindingOps: [],
    backendOps: [],
    presentationOps: [],
  };
}

/** Lightweight runtime validator — throws on obvious shape violations. */
export function assertPatchPlan(plan: unknown, context = 'assertPatchPlan'): asserts plan is PatchPlan {
  if (!plan || typeof plan !== 'object') {
    throw new Error(`[${context}] PatchPlan must be an object`);
  }
  const p = plan as Partial<PatchPlan>;
  for (const key of ['fileOps', 'playgroundOps', 'bindingOps', 'backendOps', 'presentationOps'] as const) {
    if (!Array.isArray(p[key])) {
      throw new Error(`[${context}] PatchPlan.${key} must be an array`);
    }
  }
  for (const op of p.fileOps as FileOp[]) {
    if (!op || typeof op !== 'object' || typeof op.path !== 'string') {
      throw new Error(`[${context}] invalid FileOp: ${JSON.stringify(op)}`);
    }
    if (op.type !== 'create' && op.type !== 'replace' && op.type !== 'delete') {
      throw new Error(`[${context}] FileOp.type must be create|replace|delete`);
    }
    if ((op.type === 'create' || op.type === 'replace') && typeof (op as { contents?: unknown }).contents !== 'string') {
      throw new Error(`[${context}] FileOp.contents required for ${op.type}`);
    }
  }
  for (const op of p.presentationOps as PresentationOp[]) {
    if (!op || typeof op !== 'object' || !isValidPresentationOp(op)) {
      throw new Error(`[${context}] invalid PresentationOp: ${JSON.stringify(op)}`);
    }
  }
}

const COPY_FIELDS = ['headline', 'subheadline', 'description'] as const;

function isValidPresentationOp(op: PresentationOp): boolean {
  switch (op.type) {
    case 'setVariant':
      return typeof op.sectionId === 'string' && typeof op.variantId === 'string';
    case 'setSectionCopy': {
      if (typeof op.pageRole !== 'string' || typeof op.sectionType !== 'string') return false;
      if (!op.copy || typeof op.copy !== 'object') return false;
      const entries = Object.entries(op.copy);
      if (entries.length === 0) return false;
      return entries.every(([key, value]) =>
        (COPY_FIELDS as readonly string[]).includes(key) && typeof value === 'string');
    }
    case 'reorderSections':
      return typeof op.pageRole === 'string'
        && Array.isArray(op.sectionOrder)
        && op.sectionOrder.length > 0
        && op.sectionOrder.every((type) => typeof type === 'string');
    case 'removeSection':
      return typeof op.pageRole === 'string' && typeof op.sectionType === 'string';
    case 'setMotionBudget':
      return op.motionBudget === 'restrained' || op.motionBudget === 'expressive';
    case 'setLayoutRecipe':
      return typeof op.layoutRecipe === 'string';
    default:
      return false;
  }
}
