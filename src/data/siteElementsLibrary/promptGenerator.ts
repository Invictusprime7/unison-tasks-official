/**
 * AI Site Elements Library — Prompt Generator
 *
 * Converts the structured element library into optimized prompt context
 * that's injected into the AI system prompt. This is the bridge between
 * the knowledge base and the AI code generation system.
 *
 * Design goals:
 * 1. Compact — fits within token budgets (2000-4000 tokens)
 * 2. Actionable — gives the AI concrete patterns to follow
 * 3. Contextual — only includes relevant elements for the request
 */

import type {
  SiteElement,
  ElementCategory,
  IndustryAffinity,
  StyleArchetype,
} from './types';

import {
  getAllElements,
  getElementsByIndustry,
  getElementsByCategory,
  getPageBlueprint,
  getPageBlueprintsForIndustry,
  resolveBlueprint,
  getMostCommonElements,
  systemTypeToIndustry,
  searchElements,
} from './registry';

import {
  generateWiringPrompt,
  generateIndustryIntentSheet,
} from './intentWiring';

// ============================================================================
// Prompt Builder Utilities
// ============================================================================

/**
 * Strip prescriptive visual classes from a skeleton so the AI applies
 * its own colors, fonts, and visual effects (from the industry variation
 * system) rather than copying the skeleton's hardcoded styles.
 *
 * Keeps STRUCTURAL classes (flex, grid, max-w, px, py, gap, items-center,
 * responsive prefixes) and DATA ATTRIBUTES (data-ut-intent, data-no-intent).
 * Removes COLOR classes (bg-gray-950, text-white, border-white/20, etc.),
 * SHADOW classes, GRADIENT classes, and other visual specifics.
 */
function neutralizeSkeleton(skeleton: string): string {
  return skeleton
    // Remove specific color/gradient/shadow classes but keep structural ones
    .replace(/\b(bg-gray-\d+|bg-black|bg-white|text-white|text-gray-\d+|text-black|border-white\/\d+|border-gray-\d+|shadow-lg|shadow-xl|shadow-2xl|shadow-md|shadow-sm|shadow-primary\/\d+|bg-gradient-to-[a-z]+|from-[a-z]+-\d+(?:\/\d+)?|via-[a-z]+-\d+(?:\/\d+)?|to-[a-z]+-\d+(?:\/\d+)?|from-black\/\d+|via-black\/\d+|to-transparent|bg-primary\/\d+|bg-accent\/\d+)\b/gi, '')
    // Collapse multiple spaces
    .replace(/  +/g, ' ')
    // Clean up class attributes with empty entries
    .replace(/class="\s+/g, 'class="')
    .replace(/\s+"/g, '"')
    .trim();
}

/** Condense a SiteElement into compact prompt text */
function elementToPromptBlock(el: SiteElement, includeSkeletons = false): string {
  // Pick variations with diversity — rotate based on element index to avoid
  // always showing the same top-2
  const sortedVariations = [...el.variations]
    .sort((a, b) => b.popularity - a.popularity);
  // Show max 2 variations, but vary which ones are shown
  const variations = sortedVariations.slice(0, 2);

  let block = `### ${el.name} [${el.category}/${el.subCategory}] (freq: ${el.frequencyScore}/100)\n`;
  block += `${el.description}\n`;

  // Content slots
  const requiredSlots = el.contentSlots.filter(s => s.required);
  const optionalSlots = el.contentSlots.filter(s => !s.required);
  block += `Required slots: ${requiredSlots.map(s => `${s.name}(${s.type})`).join(', ')}\n`;
  if (optionalSlots.length) {
    block += `Optional slots: ${optionalSlots.map(s => `${s.name}(${s.type})`).join(', ')}\n`;
  }

  // Available styles (so AI knows the options but picks based on variation system)
  const styleOptions = [...new Set(el.variations.map(v => v.style))];
  const layoutOptions = [...new Set(el.variations.map(v => v.layout))];
  block += `Available styles: ${styleOptions.join(', ')}\n`;
  block += `Layout options: ${layoutOptions.join(', ')}\n`;

  // Variation summaries — structure only, NOT visual prescription
  for (const v of variations) {
    block += `\n**${v.name}** [${v.layout}] — pop: ${v.popularity}/100\n`;
    block += `Best for: ${v.bestFor.join(', ')}\n`;
    if (includeSkeletons && v.skeleton) {
      // Neutralize visual classes so skeleton only conveys STRUCTURE + WIRING
      const structuralSkeleton = neutralizeSkeleton(v.skeleton)
        .replace(/\n\s*\n/g, '\n')
        .replace(/<!--[^>]*-->/g, '...')
        .trim();
      block += `Structure (adapt colors/fonts to match design system):\n\`\`\`html\n${structuralSkeleton}\n\`\`\`\n`;
    }
  }

  // Conversion intelligence — compact
  if (el.conversion.recommendedIntent) {
    block += `Default intent: ${el.conversion.recommendedIntent} (override per industry via wiring map)\n`;
  }
  if (el.conversion.abInsights?.length) {
    block += `Key insight: ${el.conversion.abInsights[0]}\n`;
  }

  return block;
}

/** Condense conversion intelligence into a focused prompt block */
function conversionSummary(elements: SiteElement[]): string {
  const tips: string[] = [];
  for (const el of elements) {
    if (el.conversion.abInsights?.length) {
      tips.push(...el.conversion.abInsights.slice(0, 1));
    }
    if (el.conversion.copyGuidelines?.length) {
      tips.push(...el.conversion.copyGuidelines.slice(0, 1));
    }
  }
  // Deduplicate and limit
  const unique = [...new Set(tips)].slice(0, 10);
  return unique.map(t => `• ${t}`).join('\n');
}

// ============================================================================
// Public Prompt Generators
// ============================================================================

/**
 * Generate the full AI knowledge base prompt context.
 * This is injected into the AI system prompt for every request.
 *
 * @param options Configuration for prompt generation
 * @returns Formatted prompt text (2000-4000 tokens)
 */
export function generateLibraryPrompt(options: {
  /** Business system type for industry-filtered context */
  systemType?: string | null;
  /** Specific element categories to focus on */
  categories?: ElementCategory[];
  /** Style preference for variation selection */
  style?: StyleArchetype;
  /** Page type for blueprint guidance */
  pageType?: string;
  /** User's prompt for contextual element search */
  userPrompt?: string;
  /** Include HTML skeletons (more tokens but more actionable) */
  includeSkeletons?: boolean;
  /** Maximum elements to include */
  maxElements?: number;
} = {}): string {
  const {
    systemType,
    categories,
    style,
    pageType,
    userPrompt,
    includeSkeletons = false,
    maxElements = 12,
  } = options;

  const industry = systemType ? systemTypeToIndustry(systemType) : 'universal';

  // 1. Select relevant elements
  let elements: SiteElement[];

  if (userPrompt) {
    // Search-based selection for specific requests
    elements = searchElements(userPrompt).slice(0, maxElements);
  } else if (categories?.length) {
    // Category-filtered selection
    elements = categories.flatMap(c => getElementsByCategory(c));
  } else if (industry !== 'universal') {
    // Industry-filtered selection
    elements = getElementsByIndustry(industry);
  } else {
    // Default: most common elements
    elements = getMostCommonElements(maxElements);
  }

  // Limit and sort by frequency
  elements = elements
    .sort((a, b) => b.frequencyScore - a.frequencyScore)
    .slice(0, maxElements);

  // 2. Build prompt
  let prompt = `\n\n\ud83d\udcda **AI SITE ELEMENTS LIBRARY** — Structural & Wiring Reference\n`;
  prompt += `Component structure and intent wiring patterns from production websites.\n`;
  prompt += `\u26a0\ufe0f IMPORTANT: These are STRUCTURAL references only. Apply YOUR OWN colors, fonts, gradients,\n`;
  prompt += `and visual effects based on the industry variation system and design profile. Do NOT copy\n`;
  prompt += `skeleton colors/styles verbatim — adapt each element to match the unique design direction.\n\n`;

  // Page blueprint if available
  const blueprint = pageType
    ? getPageBlueprint(pageType)
    : industry !== 'universal'
      ? getPageBlueprintsForIndustry(industry)[0]
      : null;

  if (blueprint) {
    prompt += `📋 **RECOMMENDED PAGE STRUCTURE** (${blueprint.pageType}):\n`;
    prompt += `${blueprint.description}\n`;
    prompt += `Section order: ${blueprint.elementSequence.join(' → ')}\n\n`;
  }

  // Element knowledge blocks
  prompt += `🧩 **COMPONENT PATTERNS** (${elements.length} elements, sorted by real-world frequency):\n\n`;

  for (const el of elements) {
    prompt += elementToPromptBlock(el, includeSkeletons);
    prompt += '\n---\n\n';
  }

  // Conversion intelligence summary
  prompt += `\n🎯 **CONVERSION INTELLIGENCE** (aggregated A/B insights):\n`;
  prompt += conversionSummary(elements);
  prompt += '\n\n';

  // Style guidance if specified
  if (style) {
    prompt += `🎨 **STYLE DIRECTION**: ${style}\n`;
    prompt += `Select variations matching the "${style}" archetype from the patterns above.\n\n`;
  }

  // Responsive reminders
  prompt += `📱 **RESPONSIVE RULES**: Mobile-first, sm:640px md:768px lg:1024px xl:1280px.\n`;
  prompt += `Every element must work on mobile. Stack grids, reduce font sizes, hide decorative elements.\n`;

  // Intent wiring map — tells AI exactly which attributes to place
  const elementIds = elements.map(el => el.id);
  const wiringBlock = generateWiringPrompt(elementIds, industry as IndustryAffinity);
  if (wiringBlock) {
    prompt += wiringBlock;
  }

  // Industry-specific intent cheat-sheet
  if (industry !== 'universal') {
    prompt += generateIndustryIntentSheet(industry as IndustryAffinity);
  }

  return prompt;
}

/**
 * Generate a focused prompt for a specific element type.
 * Used when the AI needs to generate/modify a single section.
 *
 * @param elementType Search term for the element type
 * @param systemType Business system type for industry context
 * @returns Focused prompt with skeleton and conversion tips
 */
export function generateElementPrompt(
  elementType: string,
  systemType?: string | null,
): string {
  const matches = searchElements(elementType);
  if (!matches.length) {
    return `No library patterns found for "${elementType}". Generate using general best practices.`;
  }

  const el = matches[0];
  let prompt = `\n📚 **ELEMENT LIBRARY REFERENCE** for: ${el.name}\n\n`;
  prompt += elementToPromptBlock(el, true);

  // Full conversion details
  prompt += `\n🎯 **CONVERSION DETAILS:**\n`;
  prompt += `Goal: ${el.conversion.goal}\n`;
  if (el.conversion.recommendedIntent) {
    prompt += `Wire intent: ${el.conversion.recommendedIntent}\n`;
  }
  prompt += `Placement: ${el.conversion.placementTips.join(' | ')}\n`;
  prompt += `Copy: ${el.conversion.copyGuidelines.join(' | ')}\n`;
  if (el.conversion.abInsights?.length) {
    prompt += `A/B insights:\n${el.conversion.abInsights.map(i => `  • ${i}`).join('\n')}\n`;
  }
  if (el.conversion.mobileNotes?.length) {
    prompt += `Mobile: ${el.conversion.mobileNotes.join(' | ')}\n`;
  }

  // Accessibility
  prompt += `\n♿ **A11Y:** ${el.a11y.ariaRequirements.join(', ')}\n`;
  if (el.a11y.keyboardNav) prompt += `Keyboard: ${el.a11y.keyboardNav}\n`;

  // Responsive
  prompt += `\n📱 **Responsive:** Mobile: ${el.responsive.mobile} | Desktop: ${el.responsive.desktop}\n`;

  // Intent wiring for this specific element
  const industry = systemType ? systemTypeToIndustry(systemType) : 'universal';
  const wiringBlock = generateWiringPrompt([el.id], industry as IndustryAffinity);
  if (wiringBlock) {
    prompt += wiringBlock;
  }

  return prompt;
}

/**
 * Generate the page blueprint prompt — ordered list of elements
 * that should appear on a page.
 *
 * @param pageType Type of page (landing-page, service-business, etc.)
 * @param industry Industry for custom recommendations
 * @returns Blueprint prompt text
 */
export function generateBlueprintPrompt(
  pageType?: string,
  industry?: IndustryAffinity,
): string {
  const matches = pageType
    ? [getPageBlueprint(pageType)].filter(Boolean)
    : industry
      ? getPageBlueprintsForIndustry(industry)
      : [];

  if (!matches.length) {
    return `No specific blueprint found. Use the standard landing page structure:\nnav → hero → logo strip → features → about → testimonials → pricing → FAQ → CTA → footer`;
  }

  let prompt = `\n📋 **PAGE BLUEPRINTS:**\n\n`;
  for (const bp of matches.slice(0, 3)) {
    if (!bp) continue;
    prompt += `**${bp.pageType}** (${bp.industry}): ${bp.description}\n`;
    prompt += `Order: ${bp.elementSequence.join(' → ')}\n\n`;

    // Include wiring map for the blueprint's elements
    const wiringBlock = generateWiringPrompt(bp.elementSequence, bp.industry);
    if (wiringBlock) {
      prompt += wiringBlock;
    }
  }

  return prompt;
}
