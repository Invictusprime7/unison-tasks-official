/**
 * inspectorPatchExecution — P0.2 of the canonical closure plan.
 *
 * The Property Inspector used to describe its canonical patch plan back to the
 * AI Builder as a prompt ("apply this patch plan exactly..."), which meant a
 * deterministic, already-validated mutation took a non-deterministic detour
 * through a language model.
 *
 * This module turns an `InspectorPatchPlan` into a concrete execution route
 * against the existing canonical rails — no new writer, no new registry:
 *
 *   set-variant      → PresentationOp (snapshot-owned, VFSCommitService)
 *   set-theme-token  → ThemeEdit      (theme lane, VFSCommitService)
 *   set-slot-text    → FileOp on the source that owns the slot
 *   set-slot-asset   → FileOp on the source that owns the slot
 *   set-intent       → FileOp on the source that owns the slot
 *
 * Source mutations are deterministic attribute/text rewrites scoped to the
 * canonical `data-ut-slot` identity. Anything that cannot be rewritten without
 * guessing is rejected with a reason instead of being handed to the AI.
 */

import type { InspectorPatchOp, InspectorPatchPlan } from './propertyInspectorModel';
import type { FileOp, PresentationOp } from '@/types/patchPlan';
import type { ThemeEdit } from '@/services/theme/themeEdit';

export type InspectorExecution =
  | { kind: 'presentation'; summary: string; ops: PresentationOp[] }
  | { kind: 'theme'; summary: string; themeEdit: ThemeEdit }
  | { kind: 'source'; summary: string; fileOps: FileOp[] }
  | { kind: 'rejected'; reason: string };

export interface InspectorExecutionContext {
  files: Record<string, string>;
  /** Canonical snapshot identity — required for the theme lane. */
  snapshotId?: string | null;
  revisionId?: string | null;
}

const SOURCE_FILE_RE = /\.(tsx|jsx)$/;

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Locate the opening JSX tag that carries `data-ut-slot="<slotId>"`. */
function findSlotTag(
  files: Record<string, string>,
  sectionId: string | null,
  slotId: string,
): { path: string; content: string; start: number; end: number } | null {
  const attr = new RegExp(`data-ut-slot=["']${escapeRe(slotId)}["']`);
  const candidates = Object.entries(files).filter(
    ([path, content]) => SOURCE_FILE_RE.test(path) && typeof content === 'string' && attr.test(content),
  );
  if (candidates.length === 0) return null;

  const preferred = sectionId
    ? candidates.find(([, content]) => content.includes(sectionId)) ?? candidates[0]
    : candidates[0];

  const [path, content] = preferred;
  const match = attr.exec(content);
  if (!match) return null;

  let start = match.index;
  while (start > 0 && content[start] !== '<') start -= 1;
  let end = match.index;
  while (end < content.length && content[end] !== '>') end += 1;
  if (content[start] !== '<' || content[end] !== '>') return null;
  return { path, content, start, end };
}

function setAttribute(tag: string, name: string, value: string): string {
  const existing = new RegExp(`\\s${escapeRe(name)}=["'][^"']*["']`);
  if (existing.test(tag)) return tag.replace(existing, ` ${name}="${value}"`);
  return tag.replace(/\s*(\/?>)$/, ` ${name}="${value}"$1`);
}

function safeAttrValue(value: string): string | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  if (/["'<>{}\n]/.test(trimmed)) return null;
  return trimmed;
}

function replaceFileRange(content: string, start: number, end: number, next: string): string {
  return content.slice(0, start) + next + content.slice(end);
}

export function planInspectorExecution(
  plan: Extract<InspectorPatchPlan, { ok: true }>,
  context: InspectorExecutionContext,
): InspectorExecution {
  const op: InspectorPatchOp = plan.op;

  if (op.type === 'set-variant') {
    if (!op.sectionId || !op.variantId) {
      return { kind: 'rejected', reason: 'This selection has no canonical section identity to restyle.' };
    }
    return {
      kind: 'presentation',
      summary: plan.description,
      ops: [{ type: 'setVariant', sectionId: op.sectionId, variantId: op.variantId }],
    };
  }

  if (op.type === 'set-theme-token') {
    if (!op.token || typeof op.value !== 'string') {
      return { kind: 'rejected', reason: 'This style change has no theme token to write.' };
    }
    if (!context.snapshotId) {
      return { kind: 'rejected', reason: 'Save or open a site before changing its theme tokens.' };
    }
    return {
      kind: 'theme',
      summary: plan.description,
      themeEdit: {
        version: '1.0',
        snapshotId: context.snapshotId,
        revisionId: context.revisionId ?? null,
        set: { [op.token]: op.value },
        reset: [],
      },
    };
  }

  if (!op.slotId) {
    return { kind: 'rejected', reason: 'This selection is not bound to a canonical slot.' };
  }

  const target = findSlotTag(context.files, op.sectionId, op.slotId);
  if (!target) {
    return {
      kind: 'rejected',
      reason: `Slot "${op.slotId}" was not found in the site source. Regenerate the page before editing it.`,
    };
  }

  const tag = target.content.slice(target.start, target.end + 1);

  if (op.type === 'set-intent') {
    const intent = safeAttrValue(op.intent ?? '');
    if (!intent) return { kind: 'rejected', reason: 'That action name cannot be written safely.' };
    const nextTag = setAttribute(tag, 'data-ut-intent', intent);
    return {
      kind: 'source',
      summary: plan.description,
      fileOps: [{
        type: 'replace',
        path: target.path,
        contents: replaceFileRange(target.content, target.start, target.end + 1, nextTag),
      }],
    };
  }

  if (op.type === 'set-slot-asset') {
    const url = safeAttrValue(op.value ?? '');
    if (!url) return { kind: 'rejected', reason: 'That image address cannot be written safely.' };
    if (!/^<img\b/i.test(tag) && !/\bsrc=/.test(tag)) {
      return {
        kind: 'rejected',
        reason: `Slot "${op.slotId}" renders media from its design recipe. Change it from the media panel.`,
      };
    }
    let nextTag = setAttribute(tag, 'src', url);
    const alt = op.alt ? safeAttrValue(op.alt) : null;
    if (alt) nextTag = setAttribute(nextTag, 'alt', alt);
    return {
      kind: 'source',
      summary: plan.description,
      fileOps: [{
        type: 'replace',
        path: target.path,
        contents: replaceFileRange(target.content, target.start, target.end + 1, nextTag),
      }],
    };
  }

  // set-slot-text — only a literal text child may be rewritten in place.
  const text = String(op.value ?? '');
  if (!text.trim()) return { kind: 'rejected', reason: 'Enter some text before applying this change.' };
  if (/[<>{}]/.test(text)) {
    return { kind: 'rejected', reason: 'Text cannot contain code or markup characters.' };
  }
  const after = target.content.slice(target.end + 1);
  const literal = /^([^<>{}]*)</.exec(after);
  if (!literal) {
    return {
      kind: 'rejected',
      reason: `Slot "${op.slotId}" renders text from data, not literal copy. Edit it from the content panel.`,
    };
  }
  const textStart = target.end + 1;
  const textEnd = textStart + literal[1].length;
  return {
    kind: 'source',
    summary: plan.description,
    fileOps: [{
      type: 'replace',
      path: target.path,
      contents: replaceFileRange(target.content, textStart, textEnd, text),
    }],
  };
}
