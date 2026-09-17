/**
 * Section Swapper Utility
 * 
 * Parses a compositionToReactCode-generated VFS file to identify and reorder
 * sections from its serialized `SECTIONS` array.
 */

import type { SectionType } from '@/sections/types';
import { VARIANT_REGISTRY } from '@/sections/variants/registry';

/** Detected section in current preview code */
export interface DetectedSection {
  id: string;
  type: SectionType;
  index: number; // position in SECTIONS array
  props: Record<string, any>;
}

/**
 * Parse the SECTIONS array from compositionToReactCode output.
 * Returns the detected sections with their types and props.
 */
export function detectSections(code: string): DetectedSection[] {
  // Find the SECTIONS = [...] block using bracket balancing
  const startMatch = code.match(/const\s+SECTIONS\s*=\s*\[/);
  if (!startMatch || startMatch.index === undefined) return [];

  const startIdx = startMatch.index + startMatch[0].length - 1; // position of '['
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < code.length; i++) {
    if (code[i] === '[') depth++;
    else if (code[i] === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) return [];

  const sectionsStr = code.slice(startIdx, endIdx + 1);

  try {
    // JSON.parse works since compositionToReactCode uses JSON.stringify
    const sections = JSON.parse(sectionsStr);
    if (!Array.isArray(sections)) return [];
    
    return sections.map((s: any, i: number) => ({
      id: s.id || `section-${i}`,
      type: s.type as SectionType,
      index: i,
      props: s.props || {},
    }));
  } catch {
    // Fallback: regex-based detection for non-JSON code
    const results: DetectedSection[] = [];
    const typePattern = /"id"\s*:\s*"([^"]+)"\s*,\s*"type"\s*:\s*"([^"]+)"/g;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = typePattern.exec(sectionsStr)) !== null) {
      results.push({
        id: match[1],
        type: match[2] as SectionType,
        index: idx++,
        props: {},
      });
    }
    // Also try single-quoted variant
    if (results.length === 0) {
      const altPattern = /['"]id['"]\s*:\s*['"]([^'"]+)['"]\s*,\s*['"]type['"]\s*:\s*['"]([^'"]+)['"]/g;
      while ((match = altPattern.exec(code)) !== null) {
        results.push({
          id: match[1],
          type: match[2] as SectionType,
          index: idx++,
          props: {},
        });
      }
    }
    return results;
  }
}

/**
 * Get available variant options for detected sections in the current code.
 */
export function getSwappableOptions(code: string) {
  const sections = detectSections(code);
  
  return sections
    .filter(s => VARIANT_REGISTRY[s.type]?.length > 1)
    .map(s => ({
      section: s,
      variants: VARIANT_REGISTRY[s.type] || [],
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Section reorder (mutates the SECTIONS = [...] JSON array)
// ─────────────────────────────────────────────────────────────────────────────

export type ReorderSpec =
  | { kind: 'direction'; direction: 'up' | 'down' }
  | { kind: 'anchor'; anchor: SectionType; position: 'before' | 'after' };

/**
 * Reorder sections inside the SECTIONS = [...] array.
 *
 * Returns the new code on success, or null if the section couldn't be located
 * or the move is a no-op (e.g. trying to move the first section up).
 */
export function reorderSection(
  code: string,
  targetType: SectionType,
  spec: ReorderSpec,
): string | null {
  const startMatch = code.match(/const\s+SECTIONS\s*=\s*\[/);
  if (!startMatch || startMatch.index === undefined) return null;

  const startIdx = startMatch.index + startMatch[0].length - 1;
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < code.length; i++) {
    if (code[i] === '[') depth++;
    else if (code[i] === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) return null;

  const sectionsStr = code.slice(startIdx, endIdx + 1);
  let sections: Array<{ type: SectionType; [k: string]: unknown }>;
  try {
    sections = JSON.parse(sectionsStr);
    if (!Array.isArray(sections)) return null;
  } catch {
    return null;
  }

  const fromIdx = sections.findIndex((s) => s?.type === targetType);
  if (fromIdx === -1) return null;

  let toIdx = fromIdx;
  if (spec.kind === 'direction') {
    toIdx = spec.direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= sections.length) return null;
  } else {
    const anchorIdx = sections.findIndex((s) => s?.type === spec.anchor);
    if (anchorIdx === -1) return null;
    toIdx = spec.position === 'before' ? anchorIdx : anchorIdx + 1;
    // Adjust when removing fromIdx shifts the anchor leftward.
    if (fromIdx < toIdx) toIdx -= 1;
    if (toIdx === fromIdx) return null;
  }

  const next = sections.slice();
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);

  // Pretty-print at 2 spaces to match conventional formatting.
  const serialized = JSON.stringify(next, null, 2);
  return code.slice(0, startIdx) + serialized + code.slice(endIdx + 1);
}
