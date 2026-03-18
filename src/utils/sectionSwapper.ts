/**
 * Section Swapper Utility
 * 
 * Parses a compositionToReactCode-generated VFS file to:
 * 1. Identify which sections exist (from SECTIONS array)
 * 2. Extract content from a target section's props
 * 3. Swap the rendering for that section with a variant's JSX
 */

import type { SectionType } from '@/sections/types';
import type { ExtractedSectionContent } from '@/sections/variants/types';
import { getVariantById, VARIANT_REGISTRY } from '@/sections/variants/registry';
import type { VariantId } from '@/sections/variants/types';

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

  while ((match = tagRegex.exec(code)) !== null) {
    const tagName = match[1].toLowerCase();
    const attrs = match[2];

    // Extract id
    const idMatch = attrs.match(/\bid=["'{]([^"'}]+)["'}]/);
    const id = idMatch?.[1] || `${tagName}-${idx}`;

    // Extract className for type inference
    const classMatch = attrs.match(/className=["'{]([^"'}]+)["'}]/);
    const className = (classMatch?.[1] || '').toLowerCase();
    const lowerId = id.toLowerCase();

    // Infer SectionType from tag/id/class
    let type: SectionType = 'hero'; // fallback
    if (tagName === 'nav' || lowerId.includes('nav') || className.includes('nav')) type = 'navbar';
    else if (tagName === 'footer' || lowerId.includes('footer') || className.includes('footer')) type = 'footer';
    else if (tagName === 'header' && !lowerId.includes('hero')) type = 'navbar';
    else if (lowerId.includes('hero') || className.includes('hero')) type = 'hero';
    else if (lowerId.includes('cta') || className.includes('cta')) type = 'cta';
    else if (lowerId.includes('service') || className.includes('service')) type = 'services';
    else if (lowerId.includes('feature') || className.includes('feature')) type = 'features';
    else if (lowerId.includes('pricing') || className.includes('pricing')) type = 'pricing';
    else if (lowerId.includes('testimonial') || className.includes('testimonial')) type = 'testimonials';
    else if (lowerId.includes('team') || className.includes('team')) type = 'team';
    else if (lowerId.includes('gallery') || className.includes('gallery')) type = 'gallery';
    else if (lowerId.includes('faq') || className.includes('faq')) type = 'faq';
    else if (lowerId.includes('contact') || className.includes('contact')) type = 'contact';
    else if (lowerId.includes('stat') || className.includes('stat')) type = 'stats';
    else if (lowerId.includes('about') || className.includes('about')) type = 'about';

    // Also check the function name wrapping this tag (look backwards for `function X(`)
    const beforeTag = code.slice(Math.max(0, match.index - 500), match.index);
    const fnMatch = beforeTag.match(/function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*$/);
    if (fnMatch) {
      const fnName = fnMatch[1].toLowerCase();
      if (fnName === 'navbar' || fnName === 'nav') type = 'navbar';
      else if (fnName === 'hero') type = 'hero';
      else if (fnName === 'cta') type = 'cta';
      else if (fnName === 'footer') type = 'footer';
      else if (fnName === 'services' || fnName === 'features') type = fnName as SectionType;
      else if (fnName === 'testimonials') type = 'testimonials';
      else if (fnName === 'pricing') type = 'pricing';
      else if (fnName === 'contact') type = 'contact';
      else if (fnName === 'faq') type = 'faq';
      else if (fnName === 'team') type = 'team';
      else if (fnName === 'stats') type = 'stats';
      else if (fnName === 'about') type = 'about';
    }

    results.push({ id, type, index: idx++, props: {} });
  }

  return results;
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
      // Generic extraction
      content.heading = props.headline || props.title;
      content.subheading = props.subheadline || props.description;
      break;
  }

  return content;
}

/**
 * Apply a section variant swap to the current code.
 * 
 * Strategy: Find the function for the target section type in SECTION_MAP,
 * and inject a variant-specific rendering override.
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

  // Extract content from the section props
  const content = propsToExtractedContent(targetSection.type, targetSection.props);

  // Generate variant JSX
  const variantJSX = variant.renderJSX(content);

  // Strategy: Add a variant override function and modify the render map
  const overrideFnName = `__Variant_${sectionId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  
  // Insert the override function before the SECTION_MAP
  const sectionMapMarker = '// Section Map';
  const altMarker = 'const SECTION_MAP';
  const insertPoint = code.indexOf(sectionMapMarker) !== -1 
    ? code.indexOf(sectionMapMarker)
    : code.indexOf(altMarker);
  
  if (insertPoint === -1) {
    // Fallback: can't find injection point, try to replace the entire section function
    console.warn('[SectionSwapper] Cannot find SECTION_MAP marker');
    return code;
  }

  const overrideFn = `
// Variant override: ${variantId} for section "${sectionId}"
function ${overrideFnName}() {
  return (
${variantJSX}
  );
}

`;

  // Inject the override function
  let modifiedCode = code.slice(0, insertPoint) + overrideFn + code.slice(insertPoint);

  // Modify the render to use the override for this specific section
  // Replace the generic render: <C key={s.id} props={s.props} />
  // With a conditional that checks for the overridden section ID
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
