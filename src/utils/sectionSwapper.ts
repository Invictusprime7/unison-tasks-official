/**
 * Section Swapper Utility
 * 
 * Parses a compositionToReactCode-generated VFS file to:
 * 1. Identify which sections exist (from SECTIONS array or JSX tags)
 * 2. Extract content from a target section's props/JSX
 * 3. Swap the rendering for that section with a variant's JSX
 */

import type { SectionType } from '@/sections/types';
import type { ExtractedSectionContent } from '@/sections/variants/types';
import { getVariantById, VARIANT_REGISTRY } from '@/sections/variants/registry';
import { extractSectionContentFromJSX, findSectionBounds } from '@/sections/variants/contentExtractor';
import type { VariantId } from '@/sections/variants/types';

/** Detected section in current preview code */
export interface DetectedSection {
  id: string;
  type: SectionType;
  index: number; // position in SECTIONS array
  props: Record<string, any>;
  /** The HTML tag name used (section, header, nav, footer, main) — for JSX replacement */
  tagName?: string;
  /** Index of this tag among all tags of the same name — for findSectionBounds */
  tagIndex?: number;
}

/**
 * Parse the SECTIONS array from compositionToReactCode output.
 * Returns the detected sections with their types and props.
 */
export function detectSections(code: string): DetectedSection[] {
  // Strategy 1: Parse the JSON SECTIONS array (compositionToReactCode output)
  const jsonSections = parseJsonSectionsArray(code);
  if (jsonSections.length > 0) return jsonSections;

  // Strategy 2: Parse JSX tags (<section>, <header>, <nav>, <footer>)
  return parseJsxSectionTags(code);
}

/** Strategy 1: Find `const SECTIONS = [...]` and JSON.parse it */
function parseJsonSectionsArray(code: string): DetectedSection[] {
  const startMatch = code.match(/const\s+SECTIONS\s*=\s*\[/);
  if (!startMatch || startMatch.index === undefined) return [];

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
  if (endIdx === -1) return [];

  const sectionsStr = code.slice(startIdx, endIdx + 1);

  try {
    const sections = JSON.parse(sectionsStr);
    if (!Array.isArray(sections)) return [];
    return sections.map((s: any, i: number) => ({
      id: s.id || `section-${i}`,
      type: s.type as SectionType,
      index: i,
      props: s.props || {},
    }));
  } catch {
    // Fallback: regex extraction from the JSON-like string
    const results: DetectedSection[] = [];
    const pattern = /"id"\s*:\s*"([^"]+)"\s*,\s*"type"\s*:\s*"([^"]+)"/g;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = pattern.exec(sectionsStr)) !== null) {
      results.push({ id: match[1], type: match[2] as SectionType, index: idx++, props: {} });
    }
    return results;
  }
}

/** Strategy 2: Parse JSX semantic tags and infer section type from id/class/tag */
function parseJsxSectionTags(code: string): DetectedSection[] {
  const results: DetectedSection[] = [];
  const tagRegex = /<(section|header|nav|footer|main)\b([^>]*?)>/gi;
  let match: RegExpExecArray | null;
  let idx = 0;

  // Track per-tagName index for findSectionBounds
  const tagCounts: Record<string, number> = {};

  while ((match = tagRegex.exec(code)) !== null) {
    const tagName = match[1].toLowerCase();
    const attrs = match[2];

    // Track tag index
    tagCounts[tagName] = (tagCounts[tagName] || 0);
    const tagIndex = tagCounts[tagName];
    tagCounts[tagName]++;

    // Extract id
    const idMatch = attrs.match(/\bid=["'{]([^"'}]+)["'}]/);
    const id = idMatch?.[1] || `${tagName}-${idx}`;

    // Extract className for type inference
    const classMatch = attrs.match(/className=["'{]([^"'}]+)["'}]/);
    const className = (classMatch?.[1] || '').toLowerCase();
    const lowerId = id.toLowerCase();

    // Also check data-variant attribute
    const dataVariantMatch = attrs.match(/data-variant=["']([^"']+)["']/);
    const dataVariant = dataVariantMatch?.[1] || '';

    // Infer SectionType from tag/id/class/data-variant
    let type: SectionType = inferSectionType(tagName, lowerId, className, dataVariant);

    // Also check the function name wrapping this tag
    const beforeTag = code.slice(Math.max(0, match.index - 500), match.index);
    const fnMatch = beforeTag.match(/function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*$/);
    if (fnMatch) {
      const fnType = fnNameToSectionType(fnMatch[1]);
      if (fnType) type = fnType;
    }

    // Also check for const Component = () => pattern
    const arrowMatch = beforeTag.match(/(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|)\s*=>\s*(?:\{[^}]*)?$/);
    if (arrowMatch) {
      const fnType = fnNameToSectionType(arrowMatch[1]);
      if (fnType) type = fnType;
    }

    results.push({ id, type, index: idx++, props: {}, tagName, tagIndex });
  }

  return results;
}

/** Infer SectionType from tag name, id, className, and data-variant */
function inferSectionType(tagName: string, lowerId: string, className: string, dataVariant: string): SectionType {
  // data-variant is most reliable: "hero:centered" -> "hero"
  if (dataVariant) {
    const dvType = dataVariant.split(':')[0] as SectionType;
    if (dvType) return dvType;
  }

  if (tagName === 'nav' || lowerId.includes('nav') || className.includes('nav')) return 'navbar';
  if (tagName === 'footer' || lowerId.includes('footer') || className.includes('footer')) return 'footer';
  if (tagName === 'header' && !lowerId.includes('hero')) return 'navbar';
  if (lowerId.includes('hero') || className.includes('hero')) return 'hero';
  if (lowerId.includes('cta') || className.includes('cta')) return 'cta';
  if (lowerId.includes('service') || className.includes('service')) return 'services';
  if (lowerId.includes('feature') || className.includes('feature')) return 'features';
  if (lowerId.includes('pricing') || className.includes('pricing')) return 'pricing';
  if (lowerId.includes('testimonial') || className.includes('testimonial')) return 'testimonials';
  if (lowerId.includes('team') || className.includes('team')) return 'team';
  if (lowerId.includes('gallery') || className.includes('gallery')) return 'gallery';
  if (lowerId.includes('faq') || className.includes('faq')) return 'faq';
  if (lowerId.includes('contact') || className.includes('contact')) return 'contact';
  if (lowerId.includes('stat') || className.includes('stat')) return 'stats';
  if (lowerId.includes('about') || className.includes('about')) return 'about';
  return 'hero'; // fallback
}

/** Map function/component names to section types */
function fnNameToSectionType(name: string): SectionType | null {
  const n = name.toLowerCase();
  const map: Record<string, SectionType> = {
    navbar: 'navbar', nav: 'navbar', navigation: 'navbar',
    hero: 'hero', herosection: 'hero', herobanner: 'hero',
    cta: 'cta', calltoaction: 'cta',
    footer: 'footer', footersection: 'footer',
    services: 'services', servicesection: 'services',
    features: 'features', featuresection: 'features',
    testimonials: 'testimonials', testimonialsection: 'testimonials',
    pricing: 'pricing', pricingsection: 'pricing',
    contact: 'contact', contactsection: 'contact',
    faq: 'faq', faqsection: 'faq',
    team: 'team', teamsection: 'team',
    stats: 'stats', statssection: 'stats',
    about: 'about', aboutsection: 'about',
    gallery: 'gallery', gallerysection: 'gallery',
  };
  return map[n] || null;
}

/**
 * Convert section props (from the composition data model) to ExtractedSectionContent
 * for use with variant renderJSX functions.
 */
export function propsToExtractedContent(
  sectionType: SectionType,
  props: Record<string, any>
): ExtractedSectionContent {
  const content: ExtractedSectionContent = {};

  switch (sectionType) {
    case 'hero':
      content.heading = props.headline;
      content.subheading = props.subheadline || props.description;
      content.badge = props.badge;
      content.imageSrc = props.image || props.backgroundImage;
      if (props.ctas?.length) {
        content.ctaButtons = props.ctas.map((c: any, i: number) => ({
          text: c.label,
          href: c.href || (c.intent ? `#${c.intent}` : '#'),
          isPrimary: i === 0 || c.variant !== 'outline',
        }));
      }
      break;

    case 'navbar':
      content.brandName = props.brand;
      if (props.links?.length) {
        content.navLinks = props.links.map((l: any) => ({
          text: l.label,
          href: l.href,
        }));
      }
      if (props.cta) {
        content.ctaButtons = [{
          text: props.cta.label,
          href: props.cta.href || (props.cta.intent ? `#${props.cta.intent}` : '#'),
          isPrimary: true,
        }];
      }
      break;

    case 'cta':
      content.heading = props.headline;
      content.subheading = props.description;
      if (props.ctas?.length) {
        content.ctaButtons = props.ctas.map((c: any, i: number) => ({
          text: c.label,
          href: c.href || (c.intent ? `#${c.intent}` : '#'),
          isPrimary: i === 0 || c.variant !== 'outline',
        }));
      }
      break;

    default:
      content.heading = props.headline || props.title;
      content.subheading = props.subheadline || props.description;
      break;
  }

  return content;
}

/**
 * Apply a section variant swap to the current code.
 * 
 * Two strategies:
 *   1. Composition templates: inject override function + modify SECTION_MAP render
 *   2. AI-generated templates: find section JSX boundaries + replace with variant JSX
 * 
 * Returns the modified code string.
 */
export function swapSectionVariant(
  code: string,
  sectionId: string,
  variantId: VariantId,
): string {
  const variant = getVariantById(variantId);
  if (!variant) {
    console.warn(`[SectionSwapper] Variant not found: ${variantId}`);
    return code;
  }

  // Detect sections to find the target
  const sections = detectSections(code);
  const targetSection = sections.find(s => s.id === sectionId);
  if (!targetSection) {
    console.warn(`[SectionSwapper] Section not found: ${sectionId}`);
    return code;
  }

  // Strategy 1: Composition-based templates (has SECTION_MAP)
  const hasSectionMap = code.includes('SECTION_MAP') || code.includes('// Section Map');
  if (hasSectionMap) {
    return swapCompositionSection(code, sectionId, targetSection, variant);
  }

  // Strategy 2: Direct JSX replacement for AI-generated templates
  return swapJsxSection(code, targetSection, variant);
}

/** Strategy 1: Composition template swap (inject override function) */
function swapCompositionSection(
  code: string,
  sectionId: string,
  targetSection: DetectedSection,
  variant: import('@/sections/variants/types').SectionVariant,
): string {
  const content = propsToExtractedContent(targetSection.type, targetSection.props);
  const variantJSX = variant.renderJSX(content);

  const overrideFnName = `__Variant_${sectionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  const sectionMapMarker = '// Section Map';
  const altMarker = 'const SECTION_MAP';
  const insertPoint = code.indexOf(sectionMapMarker) !== -1 
    ? code.indexOf(sectionMapMarker)
    : code.indexOf(altMarker);
  
  if (insertPoint === -1) return code;

  const overrideFn = `
// Variant override: ${variant.id} for section "${sectionId}"
function ${overrideFnName}() {
  return (
${variantJSX}
  );
}

`;

  let modifiedCode = code.slice(0, insertPoint) + overrideFn + code.slice(insertPoint);

  const renderPattern = /\{SECTIONS\.filter\(s => !s\.hidden\)\.map\(s => \{[\s\S]*?return <C key=\{s\.id\} props=\{s\.props\} \/>;[\s\S]*?\}\)\}/;
  
  modifiedCode = modifiedCode.replace(renderPattern, (match) => {
    return match.replace(
      'return <C key={s.id} props={s.props} />;',
      `if (s.id === '${sectionId}') return <${overrideFnName} key={s.id} />;
        return <C key={s.id} props={s.props} />;`
    );
  });

  return modifiedCode;
}

/** Strategy 2: Direct JSX replacement for AI-generated templates */
function swapJsxSection(
  code: string,
  targetSection: DetectedSection,
  variant: import('@/sections/variants/types').SectionVariant,
): string {
  const tagName = targetSection.tagName;
  const tagIndex = targetSection.tagIndex;

  if (!tagName || tagIndex === undefined) {
    console.warn('[SectionSwapper] No tagName/tagIndex for JSX swap');
    return code;
  }

  // Find the JSX boundaries of this section
  const bounds = findSectionBounds(code, tagName, tagIndex);
  if (!bounds) {
    console.warn(`[SectionSwapper] Could not find bounds for <${tagName}> index=${tagIndex}`);
    return code;
  }

  // Extract the old section's source code
  const oldSectionSource = code.slice(bounds.start, bounds.end);

  // Extract content from the old section for content preservation
  const content = extractSectionContentFromJSX(oldSectionSource);

  // If composition props are available, merge them in
  if (Object.keys(targetSection.props).length > 0) {
    const propsContent = propsToExtractedContent(targetSection.type, targetSection.props);
    // Merge: prefer extracted JSX content, fill gaps from props
    if (!content.heading && propsContent.heading) content.heading = propsContent.heading;
    if (!content.subheading && propsContent.subheading) content.subheading = propsContent.subheading;
    if (!content.brandName && propsContent.brandName) content.brandName = propsContent.brandName;
    if (!content.ctaButtons?.length && propsContent.ctaButtons?.length) content.ctaButtons = propsContent.ctaButtons;
    if (!content.navLinks?.length && propsContent.navLinks?.length) content.navLinks = propsContent.navLinks;
    if (!content.imageSrc && propsContent.imageSrc) content.imageSrc = propsContent.imageSrc;
    if (!content.badge && propsContent.badge) content.badge = propsContent.badge;
  }

  // Generate the new variant JSX
  const variantJSX = variant.renderJSX(content);

  // Replace the old section with the new variant JSX
  const modifiedCode = code.slice(0, bounds.start) + variantJSX + code.slice(bounds.end);

  return modifiedCode;
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
