
import type { SystemContract } from '@/data/templates/contracts';
import { getSystemContract } from '@/data/templates/contracts';
import type { BusinessSystemType } from '@/data/templates/types';
import { matchLabelToIntent, type TemplateCategory } from '@/runtime/templateIntentConfig';

// Simplified for React - we mainly want to detect if intents are present
// and potentially flag if specific intents are missing from the code string
// without full DOM parsing.

export type CTASlot =
  | 'cta.primary'
  | 'cta.secondary'
  | 'cta.nav'
  | 'cta.hero'
  | 'cta.section'
  | 'cta.footer';

export interface TemplateCtaAnalysis {
  intents: string[];
  slots: string[];
  hadUtAttributes: boolean;
}

export interface NormalizeTemplateResult {
  code: string;
  analysis: TemplateCtaAnalysis;
}

/**
 * React-aware analyzer for intents
 * Scans JSX for IntentButton components and intent props
 */
export function normalizeTemplateForCtaContract(opts: {
  code: string;
  systemType?: BusinessSystemType | null;
  category?: TemplateCategory;
}): NormalizeTemplateResult {
  const { code } = opts;

  // Scan for intent usages in the code
  const intents = new Set<string>();
  const slots = new Set<string>();

  // Regex patterns for React intent usage
  // 1. <IntentButton intent="xyz" ...>
  // 2. <Component intent="xyz" ...>
  // 3. intent="xyz" prop anywhere
  
  const intentMatches = code.matchAll(/intent=["']([^"']+)["']/g);
  for (const m of intentMatches) {
    if (m[1]) intents.add(m[1]);
  }

  // Also check for legacy data-ut-intent in case of raw HTML snippets or transition
  const dataIntentMatches = code.matchAll(/data-ut-intent=["']([^"']+)["']/g);
  for (const m of dataIntentMatches) {
    if (m[1]) intents.add(m[1]);
  }

  // Scan for slots/CTAs
  const slotMatches = code.matchAll(/cta=["']([^"']+)["']/g);
  for (const m of slotMatches) {
    if (m[1]) slots.add(m[1]);
  }
  
  const dataSlotMatches = code.matchAll(/data-ut-cta=["']([^"']+)["']/g);
  for (const m of dataSlotMatches) {
    if (m[1]) slots.add(m[1]);
  }

  // We don't mutate React code automatically with regex to avoid breaking logic.
  // We just report what we found. The AI should generate correct code.
  
  return {
    code,
    analysis: {
      intents: Array.from(intents),
      slots: Array.from(slots),
      hadUtAttributes: intents.size > 0 || slots.size > 0
    }
  };
}
