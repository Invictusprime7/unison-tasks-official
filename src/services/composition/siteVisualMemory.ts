import type { CompositionSignature, SiteVisualMemoryEntry } from './types';

/** Structural memory of pages already committed during a launch. */
export function createSiteVisualMemory() {
  const entries: SiteVisualMemoryEntry[] = [];
  return {
    record(pageId: string, role: string, signature: CompositionSignature) {
      const i = entries.findIndex((e) => e.pageId === pageId);
      if (i >= 0) entries[i] = { pageId, role, signature };
      else entries.push({ pageId, role, signature });
    },
    entries(): readonly SiteVisualMemoryEntry[] {
      return entries;
    },
  };
}

export type SiteVisualMemory = ReturnType<typeof createSiteVisualMemory>;
